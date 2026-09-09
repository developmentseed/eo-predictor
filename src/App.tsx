import { useEffect, useState, useRef } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  useFilterStore,
  type DataRepoType,
  type FilterExpression,
} from "@/store/filterStore";
import { SatellitePopup } from "@/components/SatellitePopup";
import { Header } from "@/components/Header";
import { SidebarContent } from "@/components/SidebarContent";
import { ZoomPrompt } from "@/components/ZoomPrompt";
import { loadMapData, type FetchStatus } from "@/utils/mapUtils";
import { MAX_PASSES_THRESHOLD } from "@/hooks/usePassCounter";
import booleanIntersects from "@turf/boolean-intersects";

interface ClickedFeature {
  lngLat: { lng: number; lat: number };
  satellite: string;
  constellation: string;
  operator: string;
  sensor_type: string;
  spatial_res_m: number;
  data_access: string;
  data_repo_type?: DataRepoType;
  data_repo_url?: string;
  tasking: boolean;
  start_time: string;
  end_time: string;
  is_daytime?: boolean;
}

const NO_AOI_PASS_FILTER: FilterExpression = ["boolean", false];

function App() {
  const [clickedFeature, setClickedFeature] = useState<ClickedFeature | null>(
    null
  );
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<MapRef | null>(null); // MapLibre map ref
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | null>(null);
  const [aoiPassFilterState, setAoiPassFilterState] = useState<{
    aoi: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null;
    filter: FilterExpression;
  }>({ aoi: null, filter: NO_AOI_PASS_FILTER });

  const {
    metadata,
    timeRange,
    mapFilter,
    aoiGeoJSON,
    setMetadata,
    setTimeRange,
  } = useFilterStore();

  const aoiPassFilter =
    aoiGeoJSON && aoiPassFilterState.aoi === aoiGeoJSON
      ? aoiPassFilterState.filter
      : NO_AOI_PASS_FILTER;
  const satelliteLayerFilter = aoiGeoJSON
    ? ["all", mapFilter, aoiPassFilter]
    : mapFilter;

  useEffect(() => {
    // Load metadata
    loadMapData()
      .then(({ metadata, initialTimeRange, fetchStatus }) => {
        setMetadata(metadata);
        setTimeRange(initialTimeRange);
        setFetchStatus(fetchStatus);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
  }, [setMetadata, setTimeRange]);

  useEffect(() => {
    if (!aoiGeoJSON) {
      setAoiPassFilterState({ aoi: null, filter: NO_AOI_PASS_FILTER });
      return;
    }

    let map: MapLibreMap | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let updateTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const updateAoiPassFilter = () => {
      if (cancelled || !map) return;

      if (!map.getSource("satellite-source")) {
        retryTimeout = setTimeout(updateAoiPassFilter, 100);
        return;
      }

      try {
        // Apply mapFilter here too (mirroring usePassCounter) so the cap
        // below is taken from the same filtered set the sidebar count is
        // based on — otherwise the two can disagree, and passes that match
        // the current filter can be capped out in favor of ones that don't.
        const sourceFeatures = map.querySourceFeatures("satellite-source", {
          sourceLayer: "satellite_paths",
          filter: mapFilter && mapFilter.length > 0 ? mapFilter : undefined,
        });
        const passKeys = new globalThis.Map<
          string,
          { satellite: string; startTime: string }
        >();

        sourceFeatures.forEach((feature) => {
          if (!booleanIntersects(feature.geometry, aoiGeoJSON)) return;

          const satellite = feature.properties?.satellite?.toString();
          const startTime = feature.properties?.start_time?.toString();

          if (satellite && startTime) {
            passKeys.set(`${satellite}|${startTime}`, { satellite, startTime });
          }
        });

        // Cap the number of per-pass clauses: an AOI over dense coverage can
        // match far more passes than are worth giving MapLibre one filter
        // clause each to evaluate per feature per frame.
        const cappedPassKeys = Array.from(passKeys.values()).slice(
          0,
          MAX_PASSES_THRESHOLD
        );

        const aoiFilter: FilterExpression =
          cappedPassKeys.length > 0
            ? [
                "any",
                ...cappedPassKeys.map(({ satellite, startTime }) => [
                  "all",
                  ["==", ["get", "satellite"], satellite],
                  ["==", ["get", "start_time"], startTime],
                ]),
              ]
            : NO_AOI_PASS_FILTER;

        setAoiPassFilterState({ aoi: aoiGeoJSON, filter: aoiFilter });
      } catch {
        // A genuine computation error (e.g. a degenerate AOI geometry) is
        // deterministic and will never succeed on retry — unlike the
        // "source not loaded yet" case above, don't loop forever on it.
        setAoiPassFilterState({ aoi: aoiGeoJSON, filter: NO_AOI_PASS_FILTER });
      }
    };

    const scheduleUpdate = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateAoiPassFilter, 150);
    };

    const setup = () => {
      map = mapRef.current?.getMap() ?? null;
      if (!map) {
        retryTimeout = setTimeout(setup, 100);
        return;
      }

      map.on("moveend", scheduleUpdate);
      map.on("sourcedata", scheduleUpdate);
      scheduleUpdate();
    };

    setup();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (updateTimeout) clearTimeout(updateTimeout);
      map?.off("moveend", scheduleUpdate);
      map?.off("sourcedata", scheduleUpdate);
    };
  }, [aoiGeoJSON, mapFilter]);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (feature?.properties) {
      setClickedFeature({
        ...feature.properties,
        lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
      } as ClickedFeature);
    } else {
      setClickedFeature(null);
    }
  };

  if (!metadata || !timeRange.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header mapRef={mapRef} />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-1/3 md:flex-col md:overflow-y-auto md:bg-background md:border-r md:p-4">
          <SidebarContent
            mapRef={mapRef}
            variant="desktop"
            lastUpdated={metadata?.lastUpdated}
            fetchStatus={fetchStatus}
          />
        </div>

        {/* Map Area - Desktop: Right 2/3, Mobile: Full width with reduced height */}
        <div className="flex-1 md:w-2/3 relative">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: -111.7,
              latitude: 39.3,
              zoom: zoom,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            projection={{ type: "globe" }}
            onClick={handleMapClick}
            onMove={(evt) => setZoom(evt.viewState.zoom)}
            interactiveLayerIds={["satellite_paths"]}
            maxZoom={13}
          >
            <Source
              id="satellite-source"
              type="vector"
              tiles={[import.meta.env.VITE_TILES_URL]}
              minzoom={0}
              maxzoom={7}
            >
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
                filter={satelliteLayerFilter}
              />
            </Source>
            {aoiGeoJSON && (
              <Source id="aoi-source" type="geojson" data={aoiGeoJSON}>
                <Layer
                  id="aoi-outline"
                  type="line"
                  paint={{ "line-color": "#2563eb", "line-width": 2 }}
                />
              </Source>
            )}
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
          <ZoomPrompt visible={zoom < 2.5} />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden bg-background border-t max-h-80 overflow-y-auto">
          <SidebarContent
            mapRef={mapRef}
            variant="mobile"
            lastUpdated={metadata?.lastUpdated}
            fetchStatus={fetchStatus}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
