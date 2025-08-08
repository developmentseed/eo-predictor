import { useEffect, useState, useRef, useCallback } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import maplibregl from "maplibre-gl";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useFilterStore } from "@/store/filterStore";

interface ControlsProps {
  mapRef: React.RefObject<any>;
}

const Controls = ({ mapRef }: ControlsProps) => {
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([]);
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);
  
  const {
    timeRange,
    selectedConstellation,
    selectedOperator, 
    selectedSensorType,
    selectedSpatialResolution,
    selectedDataAccess,
    availableConstellations,
    availableOperators,
    availableSensorTypes,
    availableSpatialResolution,
    availableDataAccess,
    metadata,
    setTimeRange,
    setConstellation,
    setOperator,
    setSensorType,
    setSpatialResolution,
    setDataAccess,
  } = useFilterStore();

  // Sync local time range with store when timeRange changes from external source
  useEffect(() => {
    if (timeRange.length > 0 && localTimeRange.length === 0) {
      setLocalTimeRange(timeRange);
    }
  }, [timeRange, localTimeRange.length]);

  // Function to count unique satellites from rendered features
  const updateVisiblePassCount = useCallback(() => {
    console.log('updateVisiblePassCount called');
    
    if (!mapRef.current) {
      console.log('No mapRef.current');
      return;
    }
    
    try {
      const map = mapRef.current.getMap();
      console.log('Got map reference:', map);
      
      const features = map.queryRenderedFeatures(undefined, {
        layers: ['satellite_paths']
      });
      
      console.log(`Found ${features.length} rendered features`);
      
      // Log first few features to check structure
      if (features.length > 0) {
        console.log('Sample feature properties:', features[0].properties);
        console.log('Available property keys:', Object.keys(features[0].properties || {}));
      }

      if (features.length === 0) {
        console.log('Setting count to 0');
        setVisiblePassCount(0);
        return;
      }

      // Count unique satellites, cap at 100 for performance
      if (features.length > 100) {
        console.log('Too many features, capping at 100+');
        setVisiblePassCount(101); // Use 101 to indicate "100+"
        return;
      }

      const uniqueSatellites = new Set(
        features.map(feature => feature.properties?.satellite || feature.properties?.name)
      );
      
      console.log('Unique satellites:', Array.from(uniqueSatellites));
      console.log(`Setting count to ${uniqueSatellites.size}`);
      setVisiblePassCount(uniqueSatellites.size);
    } catch (error) {
      console.warn('Error counting visible passes:', error);
      setVisiblePassCount(null);
    }
  }, [mapRef]);

  // Set up event listeners when map becomes available
  useEffect(() => {
    console.log('Checking for map availability');
    let timeoutId: NodeJS.Timeout;
    let cleanup: (() => void) | undefined;
    
    const debouncedUpdate = () => {
      console.log('Debounced update triggered');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVisiblePassCount, 300);
    };

    const setupListeners = () => {
      if (mapRef.current) {
        console.log('Map is available, setting up listeners');
        const map = mapRef.current.getMap();
        
        // Add event listeners for map movement and data changes
        map.on('moveend', debouncedUpdate);
        map.on('sourcedata', debouncedUpdate);
        
        console.log('Event listeners added, calling initial count');
        // Initial count with delay to ensure layer is loaded
        setTimeout(updateVisiblePassCount, 1000);
        
        // Set up cleanup
        cleanup = () => {
          console.log('Cleaning up event listeners');
          clearTimeout(timeoutId);
          map.off('moveend', debouncedUpdate);
          map.off('sourcedata', debouncedUpdate);
        };
      } else {
        console.log('Map not yet available, retrying in 100ms');
        setTimeout(setupListeners, 100);
      }
    };
    
    setupListeners();
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [mapRef, updateVisiblePassCount]);
  
  // Format pass count text
  const getPassCountText = () => {
    if (visiblePassCount === null) return "Loading...";
    if (visiblePassCount === 0) return "No passes";
    if (visiblePassCount === 1) return "1 pass";
    if (visiblePassCount > 100) return "Many passes (100+)";
    return `${visiblePassCount} passes`;
  };

  if (!metadata || !timeRange.length) {
    return null;
  }
  
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-4 max-w-sm max-h-[90vh] overflow-y-auto">
      {/* Pass Counter */}
      <div className="bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
        <div className="text-sm font-medium text-blue-900">
          {getPassCountText()}
        </div>
      </div>
      <div>
        <label className="font-bold mb-2 block">Constellation</label>
        <Select
          onValueChange={setConstellation}
          value={selectedConstellation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a constellation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {availableConstellations.map(({ value, disabled }) => (
              <SelectItem 
                key={value} 
                value={value}
                disabled={disabled}
                className={disabled ? "opacity-50" : ""}
              >
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Operator</label>
        <Select
          onValueChange={setOperator}
          value={selectedOperator}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {availableOperators.map(({ value, disabled }) => (
              <SelectItem 
                key={value} 
                value={value}
                disabled={disabled}
                className={disabled ? "opacity-50" : ""}
              >
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Sensor Types</label>
        <RadioGroup
          value={selectedSensorType}
          onValueChange={setSensorType}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="sensor-all" />
            <label htmlFor="sensor-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableSensorTypes.map(({ value, disabled }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`sensor-${value}`} disabled={disabled} />
              <label
                htmlFor={`sensor-${value}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabled ? 'opacity-50' : ''}`}
              >
                {value}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Spatial Resolution</label>
        <RadioGroup
          value={selectedSpatialResolution}
          onValueChange={setSpatialResolution}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="resolution-all" />
            <label htmlFor="resolution-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableSpatialResolution.map(({ value, disabled }) => {
            const label = value === 'high' ? 'High (<5m)' : 
                        value === 'medium' ? 'Medium (5-30m)' : 
                        'Low (>30m)';
            return (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`resolution-${value}`} disabled={disabled} />
                <label
                  htmlFor={`resolution-${value}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabled ? 'opacity-50' : ''}`}
                >
                  {label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Data Access</label>
        <RadioGroup
          value={selectedDataAccess}
          onValueChange={setDataAccess}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="access-all" />
            <label htmlFor="access-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableDataAccess.map(({ value, disabled }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`access-${value}`} disabled={disabled} />
              <label
                htmlFor={`access-${value}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize ${disabled ? 'opacity-50' : ''}`}
              >
                {value}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Time Range</label>
        <Slider
          value={localTimeRange.length > 0 ? localTimeRange : timeRange}
          min={metadata.minTime}
          max={metadata.maxTime}
          step={3600000} // 1 hour
          onValueChange={setLocalTimeRange}
          onValueCommit={setTimeRange}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>{new Date((localTimeRange.length > 0 ? localTimeRange : timeRange)[0]).toUTCString()}</span>
          <span>{new Date((localTimeRange.length > 0 ? localTimeRange : timeRange)[1]).toUTCString()}</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [clickedFeature, setClickedFeature] = useState(null);
  const mapRef = useRef<any>(null);
  
  const { 
    metadata, 
    timeRange, 
    mapFilter,
    setMetadata, 
    setSatelliteData, 
    setTimeRange 
  } = useFilterStore();

  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Load metadata and satellite data in parallel
    Promise.all([
      fetch("/satellite_paths_metadata.json").then((res) => res.json()),
      fetch("/scripts/satellite-list.json").then((res) => res.json())
    ])
    .then(([metadataData, satelliteData]) => {
      const min = new Date(metadataData.minTime).getTime();
      const max = new Date(metadataData.maxTime).getTime();
      
      setMetadata({ ...metadataData, minTime: min, maxTime: max });
      setSatelliteData(satelliteData);
      setTimeRange([min, max]);
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, [setMetadata, setSatelliteData, setTimeRange]);


  const handleMapClick = (e: any) => {
    if (e.features && e.features.length > 0) {
      setClickedFeature({ ...e.features[0].properties, lngLat: e.lngLat });
    } else {
      setClickedFeature(null);
    }
  };

  if (!metadata || !timeRange.length) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -111.7,
          latitude: 39.3,
          zoom: 1,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        projection={{ type: "globe" }}
        onClick={handleMapClick}
        interactiveLayerIds={["satellite_paths"]}
      >
        <Source type="vector" url="pmtiles:///satellite_paths.pmtiles">
          <Layer
            id="satellite_paths"
            source-layer="satellite_paths"
            type="fill"
            paint={{
              "fill-color": "red",
              "fill-opacity": 0.1,
            }}
            filter={mapFilter}
          />
        </Source>
        {clickedFeature && (
          <Popup
            longitude={clickedFeature.lngLat.lng}
            latitude={clickedFeature.lngLat.lat}
            onClose={() => setClickedFeature(null)}
            closeOnClick={false}
          >
            <div>
              <h3 className="font-bold mb-1">
                Satellite: {clickedFeature.satellite}
              </h3>
              <p>Constellation: {clickedFeature.constellation}</p>
              <p>Operator: {clickedFeature.operator}</p>
              <p>Sensor Type: {clickedFeature.sensor_type}</p>
              <p>Spatial Resolution: {clickedFeature.spatial_res_m} m</p>
              <p>Data Access: {clickedFeature.data_access}</p>
              <p>Start Time: {clickedFeature.start_time}</p>
              <p>End Time: {clickedFeature.end_time}</p>
            </div>
          </Popup>
        )}
        <NavigationControl position="bottom-right" visualizePitch={true} />
        <GeolocateControl position="bottom-right" trackUserLocation={true} />
      </Map>
      <Controls mapRef={mapRef} />
    </>
  );
}

export default App;
