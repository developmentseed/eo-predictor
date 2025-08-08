import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SatelliteData {
  name: string;
  operator: string;
  constellation: string;
  sensor_type: string;
  spatial_res_cm: number;
  data_access: string;
}

interface FilterState {
  // Raw data
  metadata: any;
  satelliteData: SatelliteData[];
  
  // Filter state
  timeRange: number[];
  selectedConstellation: string;
  selectedOperator: string;
  selectedSensorTypes: string[];
  selectedSpatialResolution: string[];
  selectedDataAccess: string[];
  
  // Computed/derived state
  availableConstellations: Array<{ value: string; disabled: boolean }>;
  availableOperators: Array<{ value: string; disabled: boolean }>;
  availableSensorTypes: Array<{ value: string; disabled: boolean }>;
  availableSpatialResolution: Array<{ value: string; disabled: boolean }>;
  availableDataAccess: Array<{ value: string; disabled: boolean }>;
  
  // Map filter for MapLibre
  mapFilter: any[];
  
  // Actions
  setMetadata: (metadata: any) => void;
  setSatelliteData: (data: SatelliteData[]) => void;
  setTimeRange: (range: number[]) => void;
  setConstellation: (value: string) => void;
  setOperator: (value: string) => void;
  setSensorTypes: (values: string[]) => void;
  setSpatialResolution: (values: string[]) => void;
  setDataAccess: (values: string[]) => void;
  
  // Computed filter logic
  getFilteredSatellites: () => SatelliteData[];
  updateDerivedState: () => void;
  generateMapFilter: () => any[];
}

const getSpatialResolutionCategory = (spatial_res_cm: number): string => {
  const meters = spatial_res_cm / 100;
  if (meters < 5) return 'high';
  if (meters <= 30) return 'medium';
  return 'low';
};

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      metadata: null,
      satelliteData: [],
      timeRange: [],
      selectedConstellation: 'all',
      selectedOperator: 'all',
      selectedSensorTypes: [],
      selectedSpatialResolution: [],
      selectedDataAccess: [],
      
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
        const currentState = get();
        set({ selectedConstellation: value });
        
        // Reset dependent filters that might become invalid
        if (value !== 'all') {
          const availableSats = currentState.satelliteData.filter(sat => sat.constellation === value);
          const availableOperators = [...new Set(availableSats.map(sat => sat.operator))];
          const availableSensorTypes = [...new Set(availableSats.map(sat => sat.sensor_type))];
          
          // Reset operator if it's not available for this constellation
          if (currentState.selectedOperator !== 'all' && !availableOperators.includes(currentState.selectedOperator)) {
            set({ selectedOperator: 'all' });
          }
          
          // Reset sensor types if they're not available for this constellation
          const validSensorTypes = currentState.selectedSensorTypes.filter(type => availableSensorTypes.includes(type));
          if (validSensorTypes.length !== currentState.selectedSensorTypes.length) {
            set({ selectedSensorTypes: validSensorTypes });
          }
        }
        
        get().updateDerivedState();
      },
      
      setOperator: (value) => {
        const currentState = get();
        set({ selectedOperator: value });
        
        // Reset dependent filters that might become invalid
        if (value !== 'all') {
          const availableSats = currentState.satelliteData.filter(sat => sat.operator === value);
          const availableConstellations = [...new Set(availableSats.map(sat => sat.constellation))];
          const availableSensorTypes = [...new Set(availableSats.map(sat => sat.sensor_type))];
          
          // Reset constellation if it's not available for this operator
          if (currentState.selectedConstellation !== 'all' && !availableConstellations.includes(currentState.selectedConstellation)) {
            set({ selectedConstellation: 'all' });
          }
          
          // Reset sensor types if they're not available for this operator
          const validSensorTypes = currentState.selectedSensorTypes.filter(type => availableSensorTypes.includes(type));
          if (validSensorTypes.length !== currentState.selectedSensorTypes.length) {
            set({ selectedSensorTypes: validSensorTypes });
          }
        }
        
        get().updateDerivedState();
      },
      
      setSensorTypes: (values) => {
        const currentState = get();
        set({ selectedSensorTypes: values });
        
        // Reset dependent filters that might become invalid
        if (values.length > 0) {
          const availableSats = currentState.satelliteData.filter(sat => values.includes(sat.sensor_type));
          const availableConstellations = [...new Set(availableSats.map(sat => sat.constellation))];
          const availableOperators = [...new Set(availableSats.map(sat => sat.operator))];
          
          // Reset constellation if it's not available for these sensor types
          if (currentState.selectedConstellation !== 'all' && !availableConstellations.includes(currentState.selectedConstellation)) {
            set({ selectedConstellation: 'all' });
          }
          
          // Reset operator if it's not available for these sensor types
          if (currentState.selectedOperator !== 'all' && !availableOperators.includes(currentState.selectedOperator)) {
            set({ selectedOperator: 'all' });
          }
        }
        
        get().updateDerivedState();
      },
      
      setSpatialResolution: (values) => {
        set({ selectedSpatialResolution: values });
        get().updateDerivedState();
      },
      
      setDataAccess: (values) => {
        set({ selectedDataAccess: values });
        get().updateDerivedState();
      },
      
      // Computed methods
      getFilteredSatellites: () => {
        const state = get();
        let filtered = [...state.satelliteData];
        
        // Apply constellation filter
        if (state.selectedConstellation !== 'all') {
          filtered = filtered.filter(sat => sat.constellation === state.selectedConstellation);
        }
        
        // Apply operator filter
        if (state.selectedOperator !== 'all') {
          filtered = filtered.filter(sat => sat.operator === state.selectedOperator);
        }
        
        // Apply sensor type filter
        if (state.selectedSensorTypes.length > 0) {
          filtered = filtered.filter(sat => state.selectedSensorTypes.includes(sat.sensor_type));
        }
        
        // Apply spatial resolution filter
        if (state.selectedSpatialResolution.length > 0) {
          filtered = filtered.filter(sat => {
            const category = getSpatialResolutionCategory(sat.spatial_res_cm);
            return state.selectedSpatialResolution.includes(category);
          });
        }
        
        // Apply data access filter
        if (state.selectedDataAccess.length > 0) {
          filtered = filtered.filter(sat => state.selectedDataAccess.includes(sat.data_access));
        }
        
        return filtered;
      },
      
      updateDerivedState: () => {
        const state = get();
        const filteredSatellites = state.getFilteredSatellites();
        
        // Get all available options from current filtered satellites
        const allConstellations = [...new Set(filteredSatellites.map(sat => sat.constellation))];
        const allOperators = [...new Set(filteredSatellites.map(sat => sat.operator))];
        const allSensorTypes = [...new Set(filteredSatellites.map(sat => sat.sensor_type))];
        const allSpatialResolution = [...new Set(filteredSatellites.map(sat => getSpatialResolutionCategory(sat.spatial_res_cm)))];
        const allDataAccess = [...new Set(filteredSatellites.map(sat => sat.data_access))];
        
        // Generate available options with disabled states
        const availableConstellations = (state.metadata?.constellations || []).map((constellation: string) => ({
          value: constellation,
          disabled: !allConstellations.includes(constellation)
        }));
        
        const availableOperators = (state.metadata?.operators || []).map((operator: string) => ({
          value: operator,
          disabled: !allOperators.includes(operator)
        }));
        
        const availableSensorTypes = (state.metadata?.sensor_types || []).map((sensorType: string) => ({
          value: sensorType,
          disabled: !allSensorTypes.includes(sensorType)
        }));
        
        const availableSpatialResolution = ['high', 'medium', 'low'].map((resolution: string) => ({
          value: resolution,
          disabled: !allSpatialResolution.includes(resolution)
        }));
        
        const availableDataAccess = (state.metadata?.data_access_options || []).map((access: string) => ({
          value: access,
          disabled: !allDataAccess.includes(access)
        }));
        
        const mapFilter = state.generateMapFilter();
        
        set({
          availableConstellations,
          availableOperators,
          availableSensorTypes,
          availableSpatialResolution,
          availableDataAccess,
          mapFilter
        });
      },
      
      generateMapFilter: () => {
        const state = get();
        
        // Return empty filter if timeRange is not set yet
        if (!state.timeRange.length) {
          return ["all"];
        }
        
        const filter: any[] = [
          "all",
          [">=", ["get", "start_time"], new Date(state.timeRange[0]).toISOString()],
          ["<=", ["get", "end_time"], new Date(state.timeRange[1]).toISOString()],
        ];
        
        // Constellation filter
        if (state.selectedConstellation !== "all") {
          filter.push(["==", ["get", "constellation"], state.selectedConstellation]);
        }
        
        // Operator filter
        if (state.selectedOperator !== "all") {
          filter.push(["==", ["get", "operator"], state.selectedOperator]);
        }
        
        // Sensor types filter
        if (state.selectedSensorTypes.length > 0) {
          const sensorFilter = state.selectedSensorTypes.length === 1 
            ? ["==", ["get", "sensor_type"], state.selectedSensorTypes[0]]
            : ["in", ["get", "sensor_type"], ["literal", state.selectedSensorTypes]];
          filter.push(sensorFilter);
        }
        
        // Spatial resolution filter
        if (state.selectedSpatialResolution.length > 0) {
          const spatialFilters: any[] = [];
          state.selectedSpatialResolution.forEach(range => {
            if (range === "high") {
              spatialFilters.push(["<", ["get", "spatial_res_m"], 5]);
            } else if (range === "medium") {
              spatialFilters.push(["all", [">=", ["get", "spatial_res_m"], 5], ["<=", ["get", "spatial_res_m"], 30]]);
            } else if (range === "low") {
              spatialFilters.push([">", ["get", "spatial_res_m"], 30]);
            }
          });
          
          if (spatialFilters.length === 1) {
            filter.push(spatialFilters[0]);
          } else if (spatialFilters.length > 1) {
            filter.push(["any", ...spatialFilters]);
          }
        }
        
        // Data access filter
        if (state.selectedDataAccess.length > 0) {
          const accessFilter = state.selectedDataAccess.length === 1 
            ? ["==", ["get", "data_access"], state.selectedDataAccess[0]]
            : ["in", ["get", "data_access"], ["literal", state.selectedDataAccess]];
          filter.push(accessFilter);
        }
        
        return filter;
      }
    }),
    { name: 'filter-store' }
  )
);