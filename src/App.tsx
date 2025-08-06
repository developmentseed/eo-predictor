import { useEffect, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import maplibregl from "maplibre-gl";
import { Slider } from "@/components/ui/slider";

const minTime = new Date("2025-08-06T09:02:34Z").getTime();
const maxTime = new Date("2025-08-08T08:59:34Z").getTime();

function App() {
  const [timeRange, setTimeRange] = useState([minTime, maxTime]);

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

  const filter = [
    "all",
    [
      ">=",
      ["get", "start_time"],
      new Date(timeRange[0]).toISOString(),
    ],
    [
      "<=",
      ["get", "end_time"],
      new Date(timeRange[1]).toISOString(),
    ],
  ];

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
      >
        <Source type="vector" url="pmtiles:///sar.pmtiles">
          <Layer
            id="sar"
            source-layer="sar"
            type="line"
            paint={{
              "line-color": "red",
              "line-width": 1,
            }}
            filter={filter}
          />
        </Source>
      </Map>
      <Slider
        defaultValue={timeRange}
        min={minTime}
        max={maxTime}
        step={3600000} // 1 hour
        onValueChange={handleTimeChange}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-1/2 bg-white/80 p-5 rounded-lg"
      />
    </>
  );
}

export default App;