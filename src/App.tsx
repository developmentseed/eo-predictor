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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDown } from "phosphor-react";

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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Desktop Sidebar - Left 1/3 */}
      <div className="hidden md:flex md:w-1/3 md:flex-col md:overflow-y-auto md:bg-background md:border-r">
        <div className="p-4 space-y-4">
          <Controls mapRef={mapRef} />
          <PassCounter mapRef={mapRef} />
        </div>
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
      </div>

      {/* Mobile Controls - Below map and time slider */}
      <div className="md:hidden bg-background border-t max-h-80 overflow-y-auto">
        {/* Collapsible Controls */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 border-b">
            <div>
              <h3 className="font-semibold">Satellite Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter based on properties of the satellite
              </p>
            </div>
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="[&>*]:border-0 [&>*]:shadow-none [&>*]:bg-transparent">
              <Controls mapRef={mapRef} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Collapsible PassCounter */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
            <div>
              <h3 className="font-semibold">Satellite Passes</h3>
              <p className="text-sm text-muted-foreground">
                View current visible satellite passes
              </p>
            </div>
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="[&>*]:border-0 [&>*]:shadow-none [&>*]:bg-transparent">
              <PassCounter mapRef={mapRef} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

export default App;
