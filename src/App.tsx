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

const Controls = ({
  timeRange,
  onTimeChange,
  selectedConstellation,
  onConstellationChange,
  selectedOperator,
  onOperatorChange,
  selectedSensorTypes,
  onSensorTypesChange,
  selectedSpatialResolution,
  onSpatialResolutionChange,
  selectedDataAccess,
  onDataAccessChange,
  constellations,
  operators,
  sensorTypes,
  dataAccessOptions,
  minTime,
  maxTime,
}) => {
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-4 max-w-sm max-h-[90vh] overflow-y-auto">
      <div>
        <label className="font-bold mb-2 block">Constellation</label>
        <Select
          onValueChange={onConstellationChange}
          value={selectedConstellation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a constellation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {constellations.map((constellation) => (
              <SelectItem key={constellation} value={constellation}>
                {constellation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Operator</label>
        <Select
          onValueChange={onOperatorChange}
          value={selectedOperator}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {operators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {operator}
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
          onValueChange={onSensorTypesChange}
          className="flex-wrap gap-1"
        >
          {sensorTypes.map((sensorType) => (
            <ToggleGroupItem
              key={sensorType}
              value={sensorType}
              className="text-xs px-2 py-1"
            >
              {sensorType}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Spatial Resolution</label>
        <ToggleGroup
          type="multiple"
          value={selectedSpatialResolution}
          onValueChange={onSpatialResolutionChange}
          className="flex-wrap gap-1"
        >
          <ToggleGroupItem value="high" className="text-xs px-2 py-1">
            High (&lt;5m)
          </ToggleGroupItem>
          <ToggleGroupItem value="medium" className="text-xs px-2 py-1">
            Medium (5-30m)
          </ToggleGroupItem>
          <ToggleGroupItem value="low" className="text-xs px-2 py-1">
            Low (&gt;30m)
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Data Access</label>
        <ToggleGroup
          type="multiple"
          value={selectedDataAccess}
          onValueChange={onDataAccessChange}
          className="flex gap-1"
        >
          {dataAccessOptions.map((access) => (
            <ToggleGroupItem
              key={access}
              value={access}
              className="text-xs px-2 py-1 capitalize"
            >
              {access}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Time Range</label>
        <Slider
          defaultValue={timeRange}
          min={minTime}
          max={maxTime}
          step={3600000} // 1 hour
          onValueCommit={onTimeChange}
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
  const [timeRange, setTimeRange] = useState<number[] | undefined>(undefined);
  const [selectedConstellation, setSelectedConstellation] = useState("all");
  const [selectedOperator, setSelectedOperator] = useState("all");
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([]);
  const [selectedSpatialResolution, setSelectedSpatialResolution] = useState<string[]>([]);
  const [selectedDataAccess, setSelectedDataAccess] = useState<string[]>([]);
  const [clickedFeature, setClickedFeature] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    fetch("/satellite_paths_metadata.json")
      .then((res) => res.json())
      .then((data) => {
        const min = new Date(data.minTime).getTime();
        const max = new Date(data.maxTime).getTime();
        setMetadata({ ...data, minTime: min, maxTime: max });
        setTimeRange([min, max]);
      });

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleTimeChange = (value: number[]) => {
    setTimeRange(value);
  };

  const handleConstellationChange = (value: string) => {
    setSelectedConstellation(value);
  };
  
  const handleOperatorChange = (value: string) => {
    setSelectedOperator(value);
  };
  
  const handleSensorTypesChange = (value: string[]) => {
    setSelectedSensorTypes(value);
  };
  
  const handleSpatialResolutionChange = (value: string[]) => {
    setSelectedSpatialResolution(value);
  };
  
  const handleDataAccessChange = (value: string[]) => {
    setSelectedDataAccess(value);
  };

  const handleMapClick = (e) => {
    if (e.features && e.features.length > 0) {
      setClickedFeature({ ...e.features[0].properties, lngLat: e.lngLat });
    } else {
      setClickedFeature(null);
    }
  };

  if (!metadata || !timeRange) {
    return <div>Loading...</div>;
  }

  const filter: any[] = [
    "all",
    [">=", ["get", "start_time"], new Date(timeRange[0]).toISOString()],
    ["<=", ["get", "end_time"], new Date(timeRange[1]).toISOString()],
  ];

  // Constellation filter
  if (selectedConstellation !== "all") {
    filter.push(["==", ["get", "constellation"], selectedConstellation]);
  }
  
  // Operator filter
  if (selectedOperator !== "all") {
    filter.push(["==", ["get", "operator"], selectedOperator]);
  }
  
  // Sensor types filter
  if (selectedSensorTypes.length > 0) {
    const sensorFilter = selectedSensorTypes.length === 1 
      ? ["==", ["get", "sensor_type"], selectedSensorTypes[0]]
      : ["in", ["get", "sensor_type"], ["literal", selectedSensorTypes]];
    filter.push(sensorFilter);
  }
  
  // Spatial resolution filter
  if (selectedSpatialResolution.length > 0) {
    const spatialFilters = [];
    selectedSpatialResolution.forEach(range => {
      if (range === "high") {
        spatialFilters.push(["<", ["get", "spatial_res_m"], 5]);
      } else if (range === "medium") {
        spatialFilters.push(["all", [">==", ["get", "spatial_res_m"], 5], ["<=", ["get", "spatial_res_m"], 30]]);
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
  if (selectedDataAccess.length > 0) {
    const accessFilter = selectedDataAccess.length === 1 
      ? ["==", ["get", "data_access"], selectedDataAccess[0]]
      : ["in", ["get", "data_access"], ["literal", selectedDataAccess]];
    filter.push(accessFilter);
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
            filter={filter}
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
      <Controls
        timeRange={timeRange}
        onTimeChange={handleTimeChange}
        selectedConstellation={selectedConstellation}
        onConstellationChange={handleConstellationChange}
        selectedOperator={selectedOperator}
        onOperatorChange={handleOperatorChange}
        selectedSensorTypes={selectedSensorTypes}
        onSensorTypesChange={handleSensorTypesChange}
        selectedSpatialResolution={selectedSpatialResolution}
        onSpatialResolutionChange={handleSpatialResolutionChange}
        selectedDataAccess={selectedDataAccess}
        onDataAccessChange={handleDataAccessChange}
        constellations={metadata.constellations}
        operators={metadata.operators}
        sensorTypes={metadata.sensor_types}
        dataAccessOptions={metadata.data_access_options}
        minTime={metadata.minTime}
        maxTime={metadata.maxTime}
      />
    </>
  );
}

export default App;
