import { useState, useCallback, useEffect } from 'react';

interface UsePassCounterProps {
  mapRef: React.RefObject<any>;
}

export const usePassCounter = ({ mapRef }: UsePassCounterProps) => {
  const [visiblePassCount, setVisiblePassCount] = useState<number | null>(null);

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
        return;
      }

      // Count unique satellites, cap at 100 for performance
      if (features.length > 100) {
        console.log('Too many features, capping at 100+');
        setVisiblePassCount(101); // Use 101 to indicate "100+"
        return;
      }

      const uniqueSatellites = new Set(
        features.map(feature => feature.properties?.satellite || feature.properties?.name)
      );
      
      console.log('Unique satellites:', Array.from(uniqueSatellites));
      console.log(`Setting count to ${uniqueSatellites.size}`);
      setVisiblePassCount(uniqueSatellites.size);
    } catch (error) {
      console.warn('Error counting visible passes:', error);
      setVisiblePassCount(null);
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
    getPassCountText
  };
};