/**
 * Loads satellite metadata and processes it for the application
 * @returns Promise resolving to processed data
 */
export interface FetchStatus {
  expectedCount: number;
  activeExpectedCount: number;
  fetchedCount: number;
  missingNoradIds: number[];
  noGpDataNoradIds: number[];
  failedFetchNoradIds: number[];
  successRate: number;
  lastUpdated: string;
}

export const loadMapData = async () => {
  const metadataData = await fetch("./satellite_paths_metadata.json").then(
    (res) => res.json()
  );

  let fetchStatus: FetchStatus | null = null;
  try {
    const fetchStatusResponse = await fetch("./satellite_fetch_status.json");
    if (fetchStatusResponse.ok) {
      fetchStatus = await fetchStatusResponse.json();
    }
  } catch (error) {
    console.warn("Unable to load satellite fetch status:", error);
  }

  // Process metadata to convert time strings to timestamps
  const min = new Date(metadataData.minTime).getTime();
  const max = new Date(metadataData.maxTime).getTime();

  const processedMetadata = {
    ...metadataData,
    minTime: min,
    maxTime: max,
  };

  return {
    metadata: processedMetadata,
    initialTimeRange: [min, max] as [number, number],
    fetchStatus,
  };
};
