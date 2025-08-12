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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlarmClock, Satellite, Settings2 } from "lucide-react";

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
    <div>
      <div className="flex">
        <title>Hello</title>
      </div>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Desktop Sidebar - Left 1/3 */}
        <div className="hidden md:flex md:w-1/3 md:flex-col md:overflow-y-auto md:bg-background md:border-r md:p-4">
          <Accordion
            type="multiple"
            defaultValue={["time-range", "filters", "passes"]}
            className="flex-1 flex flex-col"
          >
            {/* Time Range Section */}
            <AccordionItem value="time-range">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-4">
                  <AlarmClock />
                  Time Range
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <TimeSlider />
              </AccordionContent>
            </AccordionItem>

            {/* Filters Section */}
            <AccordionItem value="filters">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-4">
                  <Settings2 />
                  Satellite Filters
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Controls mapRef={mapRef} />
              </AccordionContent>
            </AccordionItem>

            {/* Passes Section - Fills remaining space */}
            <AccordionItem value="passes" className="flex-1 flex flex-col">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-4">
                  <Satellite />
                  {getPassCountText()}
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <PassCounter mapRef={mapRef} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

        {/* Mobile Controls - Below map */}
        <div className="md:hidden bg-background border-t max-h-80 overflow-y-auto">
          <Accordion type="multiple" defaultValue={["time-range"]}>
            {/* Time Range */}
            <AccordionItem value="time-range">
              <AccordionTrigger className="px-4 text-left font-semibold">
                <div className="flex items-center gap-4">
                  <AlarmClock />
                  Time Range
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TimeSlider />
              </AccordionContent>
            </AccordionItem>

            {/* Satellite Filters */}
            <AccordionItem value="filters">
              <AccordionTrigger className="px-4 text-left font-semibold">
                <div className="flex items-center gap-4">
                  <Settings2 />
                  Satellite Filters
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Controls mapRef={mapRef} />
              </AccordionContent>
            </AccordionItem>

            {/* Satellite Passes */}
            <AccordionItem value="passes">
              <AccordionTrigger className="px-4 text-left font-semibold">
                <div className="flex items-center gap-4">
                  <Satellite />
                  {getPassCountText()}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="max-h-60 overflow-y-auto">
                  <PassCounter mapRef={mapRef} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default App;
