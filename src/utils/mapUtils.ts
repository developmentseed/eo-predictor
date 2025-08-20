

/**
 * Loads satellite metadata and list data in parallel
 * @returns Promise resolving to processed data
 */
export const loadMapData = async () => {
  const [metadataData, satelliteData] = await Promise.all([
    fetch("/satellite_paths_metadata.json").then((res) => res.json()),
    fetch("/scripts/satellite-list.json").then((res) => res.json())
  ]);

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
    satelliteData,
    initialTimeRange: [min, max] as [number, number]
  };
};