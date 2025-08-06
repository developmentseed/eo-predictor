import { useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import maplibregl from "maplibre-gl";

function App() {
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return (
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
        />
      </Source>
    </Map>
  );
}

export default App;
