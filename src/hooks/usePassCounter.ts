import { useState, useCallback, useEffect } from "react";

interface UsePassCounterProps {
  mapRef: React.RefObject<any>;
}

type VisiblePass = {
  name: string;
  start_time: string;
  sensor_type?: string;
  spatial_res_m?: number;
  data_access?: string;
};

export const usePassCounter = ({ mapRef }: UsePassCounterProps) => {
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);
  const [visiblePasses, setVisiblePasses] = useState<VisiblePass[]>([]);

  const MAX_PASSES_THRESHOLD = 100;

  // Function to count unique satellites from rendered features
  const updateVisiblePassCount = useCallback(() => {
    if (!mapRef.current) return;

    try {
      const map = mapRef.current.getMap();
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

      // Build list of passes
      const passes: VisiblePass[] = features
        .map(feature => {
          const props = feature.properties || {};
          const name = (props.satellite || props.name || "").toString();
          const start = (props.start_time || "").toString();
          
          if (!name || !start) return null;
          
          return {
            name,
            start_time: start,
            sensor_type: props.sensor_type?.toString(),
            spatial_res_m: props.spatial_res_m ? Number(props.spatial_res_m) : undefined,
            data_access: props.data_access?.toString(),
          };
        })
        .filter((pass): pass is VisiblePass => pass !== null)
        .sort((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time));

      setVisiblePassCount(features.length);
      setVisiblePasses(passes);
    } catch (error) {
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
        const map = mapRef.current.getMap();

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
