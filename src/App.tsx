import { Button } from "@/components/ui/button";
import Map, { useControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { DeckProps } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";

interface DeckGLOverlayProps extends DeckProps {
  interleaved?: boolean;
}

function DeckGLOverlay(props: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const layers = [
    new ScatterplotLayer({
      id: "scatter-plot",
      data: [{ position: [-122.4, 37.8] }],
      getPosition: (d) => d.position,
      getFillColor: [255, 0, 0],
      getRadius: 100,
    }),
  ];

  return (
    <>
      <Map
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        style={{ width: "100vw", height: "90vh" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        <DeckGLOverlay layers={layers} interleaved />
      </Map>
      <Button variant="outline">Outline</Button>
    </>
  );
}

export default App;
