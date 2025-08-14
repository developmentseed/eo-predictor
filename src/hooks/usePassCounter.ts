import { useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { VisiblePass } from "../store/filterStore";

interface UsePassCounterProps {
  mapRef: React.RefObject<maplibregl.Map | null>;
}

export const usePassCounter = ({ mapRef }: UsePassCounterProps) => {
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);
  const [visiblePasses, setVisiblePasses] = useState<VisiblePass[]>([]);

  const MAX_PASSES_THRESHOLD = 100;

  // Function to count unique satellites from rendered features
  const updateVisiblePassCount = useCallback(() => {
    if (!mapRef.current) return;

    try {
      const map = mapRef.current;
      const features = map.queryRenderedFeatures(undefined, {
        layers: ["satellite_paths"],
      });

      if (features.length === 0) {
        setVisiblePassCount(0);
        setVisiblePasses([]);
        return;
      }

      // Cap at threshold for performance
      if (features.length > MAX_PASSES_THRESHOLD) {
        setVisiblePassCount(101); // Indicate "100+"
        setVisiblePasses([]);
        return;
      }

      // Build list of passes with deduplication
      const allPasses: VisiblePass[] = features
        .map((feature: maplibregl.MapGeoJSONFeature): VisiblePass | null => {
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
              : undefined,
            data_access: props.data_access?.toString() || undefined,
            constellation: props.constellation?.toString() || undefined,
          };
        })
        .filter((pass): pass is VisiblePass => pass !== null);

      // Deduplicate passes by grouping satellite segments into actual passes
      // Group by satellite name and 15-minute time windows to consolidate segments
      const passGroups = new Map<string, VisiblePass>();

      allPasses.forEach((pass) => {
        const startTime = new Date(pass.start_time);
        // Round to nearest 15-minute window for grouping
        const roundedMinutes = Math.floor(startTime.getMinutes() / 15) * 15;
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

      const passes = Array.from(passGroups.values()).sort(
        (a, b) => Date.parse(a.start_time) - Date.parse(b.start_time)
      );

      setVisiblePassCount(passes.length);
      setVisiblePasses(passes);
    } catch {
      setVisiblePassCount(null);
      setVisiblePasses([]);
    }
  }, [mapRef]);

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
    if (visiblePassCount === null) return "Loading...";
    if (visiblePassCount === 0) return "No passes";
    if (visiblePassCount === 1) return "1 pass";
    if (visiblePassCount > MAX_PASSES_THRESHOLD) return "Many passes (100+)";
    return `${visiblePassCount} passes`;
  };

  return {
    visiblePassCount,
    visiblePasses,
    getPassCountText,
  };
};
