import { useEffect, useState, useRef } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useFilterStore } from "@/store/filterStore";
import { SatellitePopup } from "@/components/SatellitePopup";
import { Header } from "@/components/Header";
import { SidebarContent } from "@/components/SidebarContent";
import { setupPMTilesProtocol, loadMapData } from "@/utils/mapUtils";

interface ClickedFeature {
  lngLat: { lng: number; lat: number };
  satellite: string;
  constellation: string;
  operator: string;
  sensor_type: string;
  spatial_res_m: number;
  data_access: string;
  start_time: string;
  end_time: string;
}

function App() {
  const [clickedFeature, setClickedFeature] = useState<ClickedFeature | null>(null);
  const mapRef = useRef<any>(null); // MapLibre map ref type is complex, keeping as any

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

  const handleMapClick = (e: any) => { // MapLibre event type is complex
    const feature = e.features?.[0];
    if (feature?.properties) {
      setClickedFeature({ ...feature.properties, lngLat: e.lngLat });
    } else {
      setClickedFeature(null);
    }
  };

  if (!metadata || !timeRange.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-1/3 md:flex-col md:overflow-y-auto md:bg-background md:border-r md:p-4">
          <SidebarContent mapRef={mapRef} variant="desktop" />
        </div>

        {/* Map Area - Desktop: Right 2/3, Mobile: Full width with reduced height */}
        <div className="flex-1 md:w-2/3 relative">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: -111.7,
              latitude: 39.3,
              zoom: 1,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            projection={{ type: "globe" }}
            onClick={handleMapClick}
            interactiveLayerIds={["satellite_paths"]}
            maxZoom={13}
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
                    0,
                    6,
                    0.05,
                    13,
                    0.1,
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
            <GeolocateControl
              position="bottom-right"
              trackUserLocation={true}
            />
          </Map>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden bg-background border-t max-h-80 overflow-y-auto">
          <SidebarContent mapRef={mapRef} variant="mobile" />
        </div>
      </div>
    </div>
  );
}

export default App;
