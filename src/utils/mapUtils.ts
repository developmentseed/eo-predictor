import * as pmtiles from "pmtiles";
import maplibregl from "maplibre-gl";

/**
 * Sets up PMTiles protocol for MapLibre
 * @returns Cleanup function to remove protocol
 */
export const setupPMTilesProtocol = (): (() => void) => {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  
  // Return cleanup function
  return () => {
    maplibregl.removeProtocol("pmtiles");
  };
};

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