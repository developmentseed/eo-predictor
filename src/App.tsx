import { useEffect, useState } from "react";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useFilterStore } from "@/store/filterStore";

const Controls = () => {
  const {
    timeRange,
    selectedConstellation,
    selectedOperator, 
    selectedSensorTypes,
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
    setSensorTypes,
    setSpatialResolution,
    setDataAccess,
  } = useFilterStore();
  
  if (!metadata || !timeRange.length) {
    return null;
  }
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-4 max-w-sm max-h-[90vh] overflow-y-auto">
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
        <ToggleGroup
          type="multiple"
          value={selectedSensorTypes}
          onValueChange={setSensorTypes}
          className="flex-wrap gap-1"
        >
          {availableSensorTypes.map(({ value, disabled }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              disabled={disabled}
              className={`text-xs px-2 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Spatial Resolution</label>
        <ToggleGroup
          type="multiple"
          value={selectedSpatialResolution}
          onValueChange={setSpatialResolution}
          className="flex-wrap gap-1"
        >
          {availableSpatialResolution.map(({ value, disabled }) => {
            const label = value === 'high' ? 'High (<5m)' : 
                        value === 'medium' ? 'Medium (5-30m)' : 
                        'Low (>30m)';
            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                className={`text-xs px-2 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Data Access</label>
        <ToggleGroup
          type="multiple"
          value={selectedDataAccess}
          onValueChange={setDataAccess}
          className="flex gap-1"
        >
          {availableDataAccess.map(({ value, disabled }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              disabled={disabled}
              className={`text-xs px-2 py-1 capitalize ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Time Range</label>
        <Slider
          value={timeRange}
          min={metadata.minTime}
          max={metadata.maxTime}
          step={3600000} // 1 hour
          onValueChange={setTimeRange}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>{new Date(timeRange[0]).toUTCString()}</span>
          <span>{new Date(timeRange[1]).toUTCString()}</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [clickedFeature, setClickedFeature] = useState(null);
  
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


  const handleMapClick = (e) => {
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
      <Controls />
    </>
  );
}

export default App;
