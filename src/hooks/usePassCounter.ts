import { useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { MapRef } from "react-map-gl/maplibre";
import bboxPolygon from "@turf/bbox-polygon";
import booleanIntersects from "@turf/boolean-intersects";
import { useFilterStore, type VisiblePass } from "../store/filterStore";

interface UsePassCounterProps {
  mapRef: React.RefObject<MapRef | null>;
}

// Build polygon(s) covering the map's current viewport, so pass counts can be
// restricted to what's within view (independent of source tile granularity).
// Returns two boxes when the viewport crosses the antimeridian (reported as
// west > east) instead of one inverted/incorrect rectangle.
const getViewportPolygons = (
  map: MapRef
): GeoJSON.Feature<GeoJSON.Polygon>[] => {
  const bounds = map.getBounds();
  if (!bounds) return [];

  const west = bounds.getWest();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const north = bounds.getNorth();

  if (west > east) {
    return [
      bboxPolygon([west, south, 180, north]),
      bboxPolygon([-180, south, east, north]),
    ];
  }

  return [bboxPolygon([west, south, east, north])];
};

export const usePassCounter = ({ mapRef }: UsePassCounterProps) => {
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);
  const [visiblePasses, setVisiblePasses] = useState<VisiblePass[]>([]);

  const MAX_PASSES_THRESHOLD = 100;
  const aoiGeoJSON = useFilterStore((s) => s.aoiGeoJSON);
  const mapFilter = useFilterStore((s) => s.mapFilter);

  // Function to count unique satellites from rendered features
  const updateVisiblePassCount = useCallback(() => {
    if (!mapRef.current) return;

    try {
      const map = mapRef.current;
      // Use querySourceFeatures (not queryRenderedFeatures) so the count reflects
      // the full loaded tile data rather than only what's currently painted on
      // screen — queryRenderedFeatures is zoom/render-state dependent and gives
      // inconsistent results as tiles are simplified/dropped at different zooms.
      let features = map.querySourceFeatures("satellite-source", {
        sourceLayer: "satellite_paths",
        filter: mapFilter && mapFilter.length > 0 ? mapFilter : undefined,
      });

      // Restrict to the current viewport so the count reflects what's on
      // screen (zooming/panning changes the result), independent of which
      // source tiles happen to be loaded.
      const viewportPolygons = getViewportPolygons(map);
      if (viewportPolygons.length > 0) {
        features = features.filter((feature) =>
          viewportPolygons.some((polygon) =>
            booleanIntersects(feature.geometry, polygon)
          )
        );
      }

      if (aoiGeoJSON) {
        features = features.filter((feature) =>
          booleanIntersects(feature.geometry, aoiGeoJSON)
        );
      }

      if (features.length === 0) {
        setVisiblePassCount(0);
        setVisiblePasses([]);
        return;
      }

      // Build list of passes with deduplication
      const allPasses: VisiblePass[] = features
        .map((feature: maplibregl.GeoJSONFeature): VisiblePass | null => {
          const props = feature.properties || {};
          const name = (props.satellite || props.name || "").toString();
          const start = (props.start_time || "").toString();

          if (!name || !start) return null;

          return {
            name,
            start_time: start,
            sensor_type: props.sensor_type?.toString() || undefined,
            spatial_res_cm: props.spatial_res_cm
              ? Number(props.spatial_res_cm)
              : props.spatial_res_m
                ? Number(props.spatial_res_m) * 100 // Convert meters to centimeters
                : undefined,
            data_access: props.data_access?.toString() || undefined,
            data_repo_type: props.data_repo_type?.toString() || undefined,
            data_repo_url: props.data_repo_url?.toString() || undefined,
            constellation: props.constellation?.toString() || undefined,
            tasking:
              props.tasking !== undefined ? Boolean(props.tasking) : undefined,
            is_daytime:
              props.is_daytime !== undefined
                ? Boolean(props.is_daytime)
                : undefined,
          };
        })
        .filter((pass): pass is VisiblePass => pass !== null);

      // Deduplicate passes by grouping satellite segments into actual passes
      // Group by satellite name and 15-minute time windows to consolidate segments
      const passGroups = new Map<string, VisiblePass>();

      allPasses.forEach((pass) => {
        const startTime = new Date(pass.start_time);
        // Round to nearest 5-minute window for grouping
        const roundedMinutes = Math.floor(startTime.getMinutes() / 5) * 5;
        const roundedTime = new Date(startTime);
        roundedTime.setMinutes(roundedMinutes, 0, 0);

        // Create unique key for satellite + time window
        const groupKey = `${pass.name}-${roundedTime.getTime()}`;

        // Keep the earliest pass in each group (most representative of the actual pass)
        if (
          !passGroups.has(groupKey) ||
          Date.parse(pass.start_time) <
            Date.parse(passGroups.get(groupKey)!.start_time)
        ) {
          passGroups.set(groupKey, pass);
        }
      });

      // Cap at threshold for performance — checked on deduplicated pass count,
      // since raw tile features include multiple segments per pass and can
      // exceed the threshold even when the real number of passes doesn't.
      if (passGroups.size > MAX_PASSES_THRESHOLD) {
        setVisiblePassCount(101); // Indicate "100+"
        setVisiblePasses([]);
        return;
      }

      const passes = Array.from(passGroups.values()).sort(
        (a, b) => Date.parse(a.start_time) - Date.parse(b.start_time)
      );

      setVisiblePassCount(passes.length);
      setVisiblePasses(passes);
    } catch {
      setVisiblePassCount(null);
      setVisiblePasses([]);
    }
  }, [mapRef, aoiGeoJSON, mapFilter]);

  // Set up event listeners when map becomes available
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cleanup: (() => void) | undefined;

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVisiblePassCount, 300);
    };

    const setupListeners = () => {
      if (mapRef.current) {
        const map = mapRef.current;

        map.on("moveend", debouncedUpdate);
        map.on("sourcedata", debouncedUpdate);

        // Initial count with delay to ensure layer is loaded
        setTimeout(updateVisiblePassCount, 1000);

        cleanup = () => {
          clearTimeout(timeoutId);
          map.off("moveend", debouncedUpdate);
          map.off("sourcedata", debouncedUpdate);
        };
      } else {
        setTimeout(setupListeners, 100);
      }
    };

    setupListeners();

    return () => {
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [mapRef, updateVisiblePassCount]);

  // Format pass count text
  const getPassCountText = () => {
    const suffix = aoiGeoJSON ? " in AOI within Map View" : " in Map View";
    if (visiblePassCount === null) return "Loading...";
    if (visiblePassCount === 0) return `No Predicted Passes${suffix}`;
    if (visiblePassCount === 1) return `1 Predicted Pass${suffix}`;
    if (visiblePassCount > MAX_PASSES_THRESHOLD)
      return `Many Predicted Passes (100+)${suffix}`;
    return `${visiblePassCount} Predicted Passes${suffix}`;
  };

  return {
    visiblePassCount,
    visiblePasses,
    getPassCountText,
  };
};
