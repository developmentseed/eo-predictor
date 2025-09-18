import { create } from "zustand";
import { devtools } from "zustand/middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterExpression = any;

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
  tasking?: boolean;
  is_daytime?: boolean;
}

interface FilterState {
  // Raw data
  metadata: Metadata | null;

  // Filter state
  timeRange: number[];
  selectedConstellation: string;
  selectedOperator: string;
  selectedSensorType: string;
  selectedSpatialResolution: string;
  selectedDataAccess: string;
  selectedTasking: string;
  selectedDaylight: string;

  // Computed/derived state
  availableConstellations: Array<{ value: string; disabled: boolean }>;
  availableOperators: Array<{ value: string; disabled: boolean }>;
  availableSensorTypes: Array<{ value: string; disabled: boolean }>;
  availableSpatialResolution: Array<{ value: string; disabled: boolean }>;
  availableDataAccess: Array<{ value: string; disabled: boolean }>;
  availableTasking: Array<{ value: string; disabled: boolean }>;
  availableDaylight: Array<{ value: string; disabled: boolean }>;

  // Map filter for MapLibre
  mapFilter: FilterExpression;

  // Actions
  setMetadata: (metadata: Metadata) => void;
  setTimeRange: (range: number[]) => void;
  setConstellation: (value: string) => void;
  setOperator: (value: string) => void;
  setSensorType: (value: string) => void;
  setSpatialResolution: (value: string) => void;
  setDataAccess: (value: string) => void;
  setTasking: (value: string) => void;
  setDaylight: (value: string) => void;
  resetFilters: () => void;

  // Computed filter logic
  updateDerivedState: () => void;
  generateMapFilter: () => FilterExpression;
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      metadata: null,
      timeRange: [],
      selectedConstellation: "all",
      selectedOperator: "all",
      selectedSensorType: "all",
      selectedSpatialResolution: "all",
      selectedDataAccess: "all",
      selectedTasking: "all",
      selectedDaylight: "all",

      // Initial computed state
      availableConstellations: [],
      availableOperators: [],
      availableSensorTypes: [],
      availableSpatialResolution: [],
      availableDataAccess: [],
      availableTasking: [],
      availableDaylight: [],
      mapFilter: [],

      // Actions
      setMetadata: (metadata) => {
        set({ metadata });
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

      setTasking: (value) => {
        set({ selectedTasking: value });
        get().updateDerivedState();
      },

      setDaylight: (value) => {
        set({ selectedDaylight: value });
        get().updateDerivedState();
      },

      resetFilters: () => {
        set({
          selectedConstellation: "all",
          selectedOperator: "all",
          selectedSensorType: "all",
          selectedSpatialResolution: "all",
          selectedDataAccess: "all",
          selectedTasking: "all",
          selectedDaylight: "all",
        });
        get().updateDerivedState();
      },

      // Computed methods

      updateDerivedState: () => {
        const state = get();

        // Generate available options - no driver filtering needed since we use metadata directly
        const availableConstellations = (
          state.metadata?.constellations || []
        ).map((constellation: string) => ({
          value: constellation,
          disabled: false,
        }));

        const availableOperators = (state.metadata?.operators || []).map(
          (operator: string) => ({
            value: operator,
            disabled: false,
          })
        );

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

        const availableTasking = ["tasking", "non-tasking"].map(
          (tasking: string) => ({
            value: tasking,
            disabled: false,
          })
        );

        const availableDaylight = ["daytime", "nighttime"].map(
          (daylight: string) => ({
            value: daylight,
            disabled: false,
          })
        );

        const mapFilter = state.generateMapFilter();

        set({
          availableConstellations,
          availableOperators,
          availableSensorTypes,
          availableSpatialResolution,
          availableDataAccess,
          availableTasking,
          availableDaylight,
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

        // Tasking filter
        if (state.selectedTasking !== "all") {
          const taskingValue = state.selectedTasking === "tasking";
          filter.push(["==", ["get", "tasking"], taskingValue]);
        }

        // Daylight filter
        if (state.selectedDaylight !== "all") {
          const isDaytime = state.selectedDaylight === "daytime";
          filter.push(["==", ["get", "is_daytime"], isDaytime]);
        }

        return filter;
      },
    }),
    { name: "filter-store" }
  )
);
