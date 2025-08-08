import { useState, useCallback, useEffect } from 'react';

interface UsePassCounterProps {
  mapRef: React.RefObject<any>;
}

type VisiblePass = { name: string; start_time: string };

export const usePassCounter = ({ mapRef }: UsePassCounterProps) => {
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);
  const [visiblePasses, setVisiblePasses] = useState<VisiblePass[]>([]);

  // Function to count unique satellites from rendered features
  const updateVisiblePassCount = useCallback(() => {
    console.log('updateVisiblePassCount called');
    
    if (!mapRef.current) {
      console.log('No mapRef.current');
      return;
    }
    
    try {
      const map = mapRef.current.getMap();
      console.log('Got map reference:', map);
      
      const features = map.queryRenderedFeatures(undefined, {
        layers: ['satellite_paths']
      });
      
      console.log(`Found ${features.length} rendered features`);
      
      // Log first few features to check structure
      if (features.length > 0) {
        console.log('Sample feature properties:', features[0].properties);
        console.log('Available property keys:', Object.keys(features[0].properties || {}));
      }

      if (features.length === 0) {
        console.log('Setting count to 0');
        setVisiblePassCount(0);
        setVisiblePasses([]);
        return;
      }

      // Count unique satellites, cap at 100 for performance
      if (features.length > 100) {
        console.log('Too many features, capping at 100+');
        setVisiblePassCount(101); // Use 101 to indicate "100+"
        setVisiblePasses([]);
        return;
      }

      // Build list of all passes (duplicates allowed), sorted by start_time
      const passes: VisiblePass[] = [];
      for (const feature of features) {
        const props = feature.properties || {};
        const name = (props.satellite || props.name || '').toString();
        const start = (props.start_time || '').toString();
        if (!name || !start) continue;
        passes.push({ name, start_time: start });
      }

      console.log('Total passes:', passes.length);
      setVisiblePassCount(features.length);

      // Only populate list when small enough to be useful (<= 10)
      const list: VisiblePass[] = passes
        .sort((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time))
        .slice(0, 10);
      if (features.length <= 10) {
        setVisiblePasses(list);
      } else {
        setVisiblePasses([]);
      }
    } catch (error) {
      console.warn('Error counting visible passes:', error);
      setVisiblePassCount(null);
      setVisiblePasses([]);
    }
  }, [mapRef]);

  // Set up event listeners when map becomes available
  useEffect(() => {
    console.log('Checking for map availability');
    let timeoutId: NodeJS.Timeout;
    let cleanup: (() => void) | undefined;
    
    const debouncedUpdate = () => {
      console.log('Debounced update triggered');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVisiblePassCount, 300);
    };

    const setupListeners = () => {
      if (mapRef.current) {
        console.log('Map is available, setting up listeners');
        const map = mapRef.current.getMap();
        
        // Add event listeners for map movement and data changes
        map.on('moveend', debouncedUpdate);
        map.on('sourcedata', debouncedUpdate);
        
        console.log('Event listeners added, calling initial count');
        // Initial count with delay to ensure layer is loaded
        setTimeout(updateVisiblePassCount, 1000);
        
        // Set up cleanup
        cleanup = () => {
          console.log('Cleaning up event listeners');
          clearTimeout(timeoutId);
          map.off('moveend', debouncedUpdate);
          map.off('sourcedata', debouncedUpdate);
        };
      } else {
        console.log('Map not yet available, retrying in 100ms');
        setTimeout(setupListeners, 100);
      }
    };
    
    setupListeners();
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [mapRef, updateVisiblePassCount]);

  // Format pass count text
  const getPassCountText = () => {
    if (visiblePassCount === null) return "Loading...";
    if (visiblePassCount === 0) return "No passes";
    if (visiblePassCount === 1) return "1 pass";
    if (visiblePassCount > 100) return "Many passes (100+)";
    return `${visiblePassCount} passes`;
  };

  return {
    visiblePassCount,
    visiblePasses,
    getPassCountText
  };
};
