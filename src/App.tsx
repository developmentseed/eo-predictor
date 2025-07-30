import { useState, useEffect } from "react";
import Map, { useControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { DeckProps } from "@deck.gl/core";
import { GeoArrowPolygonLayer } from "@geoarrow/deck.gl-layers";
import init, { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";

interface DeckGLOverlayProps extends DeckProps {
  interleaved?: boolean;
}

function DeckGLOverlay(props: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const [table, setTable] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // Initialize the WASM module
      await init("/parquet_wasm_bg.wasm");

      const resp = await fetch("/Utah@1.parquet");
      const arrayBuffer = await resp.arrayBuffer();
      const wasmTable = readParquet(new Uint8Array(arrayBuffer));
      const newTable = tableFromIPC(wasmTable.intoIPCStream());
      setTable(newTable);
      console.log(newTable);
    };

    loadData();
  }, []);

  const layers = [];
  if (table) {
    const deckLayer = new GeoArrowPolygonLayer({
      id: "geo-arrow-polygon-layer",
      data: table,
      getPolygon: table.getChild("GEOMETRY"),
      getFillColor: [255, 0, 0],
    });
    layers.push(deckLayer);
  }

  return (
    <Map
      initialViewState={{
        longitude: -111.7,
        latitude: 39.3,
        zoom: 5,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    >
      <DeckGLOverlay layers={layers} interleaved />
    </Map>
  );
}

export default App;
