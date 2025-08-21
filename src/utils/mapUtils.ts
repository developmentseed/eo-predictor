

// Import satellite data directly since it's not included in the runtime metadata
import satelliteListData from '../../scripts/satellite-list.json';

/**
 * Loads satellite metadata and processes it for the application
 * @returns Promise resolving to processed data
 */
export const loadMapData = async () => {
  const metadataData = await fetch("./satellite_paths_metadata.json").then((res) => res.json());

  // Process metadata to convert time strings to timestamps
  const min = new Date(metadataData.minTime).getTime();
  const max = new Date(metadataData.maxTime).getTime();
  
  const processedMetadata = { 
    ...metadataData, 
    minTime: min, 
    maxTime: max 
  };

  return {
    metadata: processedMetadata,
    satelliteData: satelliteListData,
    initialTimeRange: [min, max] as [number, number]
  };
};