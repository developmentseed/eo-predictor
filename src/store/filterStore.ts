import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Use a compatible filter type that works with MapLibre GL at runtime
export type FilterExpression = any;

export interface SatelliteData {
  name: string;
  operator: string;
  constellation: string;
  sensor_type: string;
  spatial_res_cm: number;
  data_access: string;
}

export interface Metadata {
  minTime: number;
  maxTime: number;
  constellations: string[];
  operators: string[];
  sensor_types: string[];
  spatialResolutions: string[];
  data_access_options: string[];
  lastUpdated: string;
  // Add other properties as needed
}

// Type for visible passes (used in usePassCounter)
export interface VisiblePass {
  name: string;
  start_time: string;
  sensor_type?: string;
  spatial_res_cm?: number;
  data_access?: string;
  constellation?: string;
}

interface FilterState {
  // Raw data
  metadata: Metadata | null;
  satelliteData: SatelliteData[];

  // Filter state
  timeRange: number[];
  selectedConstellation: string;
  selectedOperator: string;
  selectedSensorType: string;
  selectedSpatialResolution: string;
  selectedDataAccess: string;

  // Computed/derived state
  availableConstellations: Array<{ value: string; disabled: boolean }>;
  availableOperators: Array<{ value: string; disabled: boolean }>;
  availableSensorTypes: Array<{ value: string; disabled: boolean }>;
  availableSpatialResolution: Array<{ value: string; disabled: boolean }>;
  availableDataAccess: Array<{ value: string; disabled: boolean }>;

  // Map filter for MapLibre
  mapFilter: FilterExpression;

  // Actions
  setMetadata: (metadata: Metadata) => void;
  setSatelliteData: (data: SatelliteData[]) => void;
  setTimeRange: (range: number[]) => void;
  setConstellation: (value: string) => void;
  setOperator: (value: string) => void;
  setSensorType: (value: string) => void;
  setSpatialResolution: (value: string) => void;
  setDataAccess: (value: string) => void;
  resetFilters: () => void;

  // Computed filter logic
  getFilteredSatellites: () => SatelliteData[];
  updateDerivedState: () => void;
  generateMapFilter: () => FilterExpression;
}

const getSpatialResolutionCategory = (spatial_res_cm: number): string => {
  const meters = spatial_res_cm / 100;
  if (meters < 5) return "high";
  if (meters <= 30) return "medium";
  return "low";
};

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      metadata: null,
      satelliteData: [],
      timeRange: [],
      selectedConstellation: "all",
      selectedOperator: "all",
      selectedSensorType: "all",
      selectedSpatialResolution: "all",
      selectedDataAccess: "all",

      // Initial computed state
      availableConstellations: [],
      availableOperators: [],
      availableSensorTypes: [],
      availableSpatialResolution: [],
      availableDataAccess: [],
      mapFilter: [],

      // Actions
      setMetadata: (metadata) => {
        set({ metadata });
        get().updateDerivedState();
      },

      setSatelliteData: (data) => {
        set({ satelliteData: data });
        get().updateDerivedState();
      },

      setTimeRange: (range) => {
        set({ timeRange: range });
        get().updateDerivedState();
      },

      setConstellation: (value) => {
        set({ selectedConstellation: value });
        get().updateDerivedState();
      },

      setOperator: (value) => {
        set({ selectedOperator: value });
        get().updateDerivedState();
      },

      setSensorType: (value) => {
        set({ selectedSensorType: value });
        get().updateDerivedState();
      },

      setSpatialResolution: (value) => {
        set({ selectedSpatialResolution: value });
        get().updateDerivedState();
      },

      setDataAccess: (value) => {
        set({ selectedDataAccess: value });
        get().updateDerivedState();
      },

      resetFilters: () => {
        set({
          selectedConstellation: "all",
          selectedOperator: "all",
          selectedSensorType: "all",
          selectedSpatialResolution: "all",
          selectedDataAccess: "all",
        });
        get().updateDerivedState();
      },

      // Computed methods
      getFilteredSatellites: () => {
        const state = get();
        let filtered = [...state.satelliteData];

        // Apply constellation filter
        if (state.selectedConstellation !== "all") {
          filtered = filtered.filter(
            (sat) => sat.constellation === state.selectedConstellation
          );
        }

        // Apply operator filter
        if (state.selectedOperator !== "all") {
          filtered = filtered.filter(
            (sat) => sat.operator === state.selectedOperator
          );
        }

        // Apply sensor type filter
        if (state.selectedSensorType !== "all") {
          filtered = filtered.filter(
            (sat) => sat.sensor_type === state.selectedSensorType
          );
        }

        // Apply spatial resolution filter
        if (state.selectedSpatialResolution !== "all") {
          filtered = filtered.filter((sat) => {
            const category = getSpatialResolutionCategory(sat.spatial_res_cm);
            return category === state.selectedSpatialResolution;
          });
        }

        // Apply data access filter
        if (state.selectedDataAccess !== "all") {
          filtered = filtered.filter(
            (sat) => sat.data_access === state.selectedDataAccess
          );
        }

        return filtered;
      },

      updateDerivedState: () => {
        const state = get();

        // Apply driver filters (sensor type, spatial resolution, data access) to determine available constellations/operators
        let driverFiltered = [...state.satelliteData];

        // Apply sensor type filter
        if (state.selectedSensorType !== "all") {
          driverFiltered = driverFiltered.filter(
            (sat) => sat.sensor_type === state.selectedSensorType
          );
        }

        // Apply spatial resolution filter
        if (state.selectedSpatialResolution !== "all") {
          driverFiltered = driverFiltered.filter((sat) => {
            const category = getSpatialResolutionCategory(sat.spatial_res_cm);
            return category === state.selectedSpatialResolution;
          });
        }

        // Apply data access filter
        if (state.selectedDataAccess !== "all") {
          driverFiltered = driverFiltered.filter(
            (sat) => sat.data_access === state.selectedDataAccess
          );
        }

        // Get available options from driver-filtered satellites
        const availableConstellationsFromDrivers = [
          ...new Set(driverFiltered.map((sat) => sat.constellation)),
        ];
        const availableOperatorsFromDrivers = [
          ...new Set(driverFiltered.map((sat) => sat.operator)),
        ];

        // Generate available options with disabled states
        // Only constellation and operator get constrained by driver filters
        const availableConstellations = (
          state.metadata?.constellations || []
        ).map((constellation: string) => ({
          value: constellation,
          disabled: !availableConstellationsFromDrivers.includes(constellation),
        }));

        const availableOperators = (state.metadata?.operators || []).map(
          (operator: string) => ({
            value: operator,
            disabled: !availableOperatorsFromDrivers.includes(operator),
          })
        );

        // Driver filters are never disabled - they're always selectable
        const availableSensorTypes = (state.metadata?.sensor_types || []).map(
          (sensorType: string) => ({
            value: sensorType,
            disabled: false,
          })
        );

        const availableSpatialResolution = ["high", "medium", "low"].map(
          (resolution: string) => ({
            value: resolution,
            disabled: false,
          })
        );

        const availableDataAccess = (
          state.metadata?.data_access_options || []
        ).map((access: string) => ({
          value: access,
          disabled: false,
        }));

        const mapFilter = state.generateMapFilter();

        set({
          availableConstellations,
          availableOperators,
          availableSensorTypes,
          availableSpatialResolution,
          availableDataAccess,
          mapFilter,
        });
      },

      generateMapFilter: () => {
        const state = get();

        // Return empty filter if timeRange is not set yet
        if (!state.timeRange.length) {
          return ["all"];
        }

        const filter: FilterExpression = [
          "all",
          [
            ">=",
            ["get", "start_time"],
            new Date(state.timeRange[0]).toISOString(),
          ],
          [
            "<=",
            ["get", "end_time"],
            new Date(state.timeRange[1]).toISOString(),
          ],
        ];

        // Constellation filter
        if (state.selectedConstellation !== "all") {
          filter.push([
            "==",
            ["get", "constellation"],
            state.selectedConstellation,
          ]);
        }

        // Operator filter
        if (state.selectedOperator !== "all") {
          filter.push(["==", ["get", "operator"], state.selectedOperator]);
        }

        // Sensor type filter
        if (state.selectedSensorType !== "all") {
          filter.push(["==", ["get", "sensor_type"], state.selectedSensorType]);
        }

        // Spatial resolution filter
        if (state.selectedSpatialResolution !== "all") {
          const resolutionFilters = {
            high: ["<", ["get", "spatial_res_m"], 5],
            medium: [
              "all",
              [">=", ["get", "spatial_res_m"], 5],
              ["<=", ["get", "spatial_res_m"], 30],
            ],
            low: [">", ["get", "spatial_res_m"], 30],
          };

          const resolutionFilter =
            resolutionFilters[
              state.selectedSpatialResolution as keyof typeof resolutionFilters
            ];
          if (resolutionFilter) {
            filter.push(resolutionFilter);
          }
        }

        // Data access filter
        if (state.selectedDataAccess !== "all") {
          filter.push(["==", ["get", "data_access"], state.selectedDataAccess]);
        }

        return filter;
      },
    }),
    { name: "filter-store" }
  )
);
