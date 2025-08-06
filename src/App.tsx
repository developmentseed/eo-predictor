import { useEffect, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
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

const minTime = new Date("2025-08-06T09:02:34Z").getTime();
const maxTime = new Date("2025-08-08T08:59:34Z").getTime();

const satellites = [
  "ICEYE-X15",
  "ICEYE-X17",
  "ICEYE-X26",
  "ICEYE-X27",
  "ICEYE-X30",
  "ICEYE-X33",
  "ICEYE-X34",
  "ICEYE-X36",
  "ICEYE-X37",
  "ICEYE-X39",
  "ICEYE-X4",
  "ICEYE-X40",
  "ICEYE-X41",
  "ICEYE-X42",
  "ICEYE-X43",
  "ICEYE-X44",
  "ICEYE-X45",
  "ICEYE-X47",
  "ICEYE-X49",
  "ICEYE-X5",
  "RISAT-1",
  "SENTINEL-1C",
];

const Controls = ({
  timeRange,
  onTimeChange,
  selectedSatellite,
  onSatelliteChange,
}) => {
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-5">
      <div>
        <label className="font-bold">Satellite</label>
        <Select onValueChange={onSatelliteChange} value={selectedSatellite}>
          <SelectTrigger>
            <SelectValue placeholder="Select a satellite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {satellites.map((sat) => (
              <SelectItem key={sat} value={sat}>
                {sat}
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
          onValueChange={onTimeChange}
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
  const [timeRange, setTimeRange] = useState([minTime, maxTime]);
  const [selectedSatellite, setSelectedSatellite] = useState("all");
  const [clickedFeature, setClickedFeature] = useState(null);

  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleTimeChange = (value: number[]) => {
    setTimeRange(value);
  };

  const handleSatelliteChange = (value: string) => {
    setSelectedSatellite(value);
  };

  const handleMapClick = (e) => {
    if (e.features && e.features.length > 0) {
      setClickedFeature({ ...e.features[0].properties, lngLat: e.lngLat });
    } else {
      setClickedFeature(null);
    }
  };

  const filter: any[] = [
    "all",
    [">=", ["get", "start_time"], new Date(timeRange[0]).toISOString()],
    ["<=", ["get", "end_time"], new Date(timeRange[1]).toISOString()],
  ];

  if (selectedSatellite !== "all") {
    filter.push(["==", ["get", "satellite"], selectedSatellite]);
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
        interactiveLayerIds={["sar"]}
      >
        <Source type="vector" url="pmtiles://src/assets/sar.pmtiles">
          <Layer
            id="sar"
            source-layer="sar"
            type="line"
            paint={{
              "line-color": "red",
              "line-width": 3,
              "line-opacity": 0.25,
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
              <p>Start Time: {clickedFeature.start_time}</p>
              <p>End Time: {clickedFeature.end_time}</p>
              <p>Length: {clickedFeature.length_m}m</p>
            </div>
          </Popup>
        )}
      </Map>
      <Controls
        timeRange={timeRange}
        onTimeChange={handleTimeChange}
        selectedSatellite={selectedSatellite}
        onSatelliteChange={handleSatelliteChange}
      />
    </>
  );
}

export default App;
