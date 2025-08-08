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

const Controls = ({
  timeRange,
  onTimeChange,
  selectedConstellation,
  onConstellationChange,
  constellations,
  minTime,
  maxTime,
}) => {
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-5">
      <div>
        <label className="font-bold">Constellation</label>
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
        <label className="font-bold">Time Range</label>
        <Slider
          defaultValue={timeRange}
          min={minTime}
          max={maxTime}
          step={3600000} // 1 hour
          onValueCommit={onTimeChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs">
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

  if (selectedConstellation !== "all") {
    filter.push(["==", ["get", "constellation"], selectedConstellation]);
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
        constellations={metadata.constellations}
        minTime={metadata.minTime}
        maxTime={metadata.maxTime}
      />
    </>
  );
}

export default App;
