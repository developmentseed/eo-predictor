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
import { TimeSlider } from "@/components/TimeSlider";
import { setupPMTilesProtocol, loadMapData } from "@/utils/mapUtils";
import { usePassCounter } from "@/hooks/usePassCounter";
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

  const { getPassCountText } = usePassCounter({ mapRef });

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
      <div className="hidden md:flex md:w-1/3 md:flex-col md:overflow-y-auto md:bg-background md:border-r md:p-4 md:space-y-4">
        {/* Time Range Section */}
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
            Time Range
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <TimeSlider />
          </CollapsibleContent>
        </Collapsible>

        {/* Filters Section */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
            Satellite Filters
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Controls mapRef={mapRef} />
          </CollapsibleContent>
        </Collapsible>

        {/* Passes Section - Fills remaining space */}
        <div className="flex-1 min-h-0">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
              {getPassCountText()}
              <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 h-full overflow-hidden">
              <div className="h-full overflow-y-auto">
                <PassCounter mapRef={mapRef} />
              </div>
            </CollapsibleContent>
          </Collapsible>
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

      {/* Mobile Controls - Below map */}
      <div className="md:hidden bg-background border-t max-h-80 overflow-y-auto">
        {/* Time Range */}
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 border-b">
            <h3 className="font-semibold">Time Range</h3>
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <TimeSlider />
          </CollapsibleContent>
        </Collapsible>

        {/* Satellite Filters */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 border-b">
            <h3 className="font-semibold">Satellite Filters</h3>
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <Controls mapRef={mapRef} />
          </CollapsibleContent>
        </Collapsible>

        {/* Satellite Passes */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
            <h3 className="font-semibold">{getPassCountText()}</h3>
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="max-h-60 overflow-y-auto">
              <PassCounter mapRef={mapRef} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

export default App;
