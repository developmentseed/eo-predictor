import { useEffect, useState, useRef } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useFilterStore } from "@/store/filterStore";
import { Controls } from "@/components/Controls";
import { SatellitePopup } from "@/components/SatellitePopup";
import { PassCounter } from "@/components/PassCounter";
import { setupPMTilesProtocol, loadMapData } from "@/utils/mapUtils";

function App() {
  const [clickedFeature, setClickedFeature] = useState(null);
  const mapRef = useRef<any>(null);

  const {
    metadata,
    timeRange,
    mapFilter,
    setMetadata,
    setSatelliteData,
    setTimeRange,
  } = useFilterStore();

  useEffect(() => {
    const cleanupProtocol = setupPMTilesProtocol();

    // Load metadata and satellite data
    loadMapData()
      .then(({ metadata, satelliteData, initialTimeRange }) => {
        setMetadata(metadata);
        setSatelliteData(satelliteData);
        setTimeRange(initialTimeRange);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });

    return cleanupProtocol;
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
              "fill-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2,
                0, // Completely transparent at zoom 3
                6,
                0.05,
                12,
                0.1, // Full opacity at zoom 4
              ],
            }}
            filter={mapFilter}
          />
        </Source>
        <SatellitePopup
          clickedFeature={clickedFeature}
          onClose={() => setClickedFeature(null)}
        />
        <NavigationControl position="bottom-right" visualizePitch={true} />
        <GeolocateControl position="bottom-right" trackUserLocation={true} />
      </Map>
      <PassCounter mapRef={mapRef} />
      <Controls mapRef={mapRef} />
    </>
  );
}

export default App;
