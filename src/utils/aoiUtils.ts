import bbox from "@turf/bbox";

export class AoiParseError extends Error {}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type AoiFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

const isPolygonGeometry = (
  geometry: GeoJSON.Geometry
): geometry is GeoJSON.Polygon | GeoJSON.MultiPolygon =>
  geometry.type === "Polygon" || geometry.type === "MultiPolygon";

// Rejects structurally-valid-but-degenerate geometries (e.g. empty
// coordinate arrays from buggy export tools) that would otherwise pass
// through and break downstream turf calls with obscure errors.
const hasValidRings = (
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): boolean => {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  return (
    polygons.length > 0 &&
    polygons.every(
      (rings) => rings.length > 0 && rings.every((ring) => ring.length > 0)
    )
  );
};

const assertValidPolygon = (
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): void => {
  if (!hasValidRings(geometry)) {
    throw new AoiParseError("This file's polygon shape is empty or malformed.");
  }
};

export const readAoiFile = (file: File): Promise<unknown> => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.reject(new AoiParseError("File is too large."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(
          new AoiParseError("This doesn't look like a valid GeoJSON file.")
        );
      }
    };
    reader.onerror = () =>
      reject(new AoiParseError("Could not read this file."));
    reader.readAsText(file);
  });
};

// Combines multiple polygon features into a single MultiPolygon by
// concatenating their coordinate rings, preserving every uploaded shape
// without requiring a geometric union library.
const combinePolygonGeometries = (
  geometries: Array<GeoJSON.Polygon | GeoJSON.MultiPolygon>
): GeoJSON.MultiPolygon => ({
  type: "MultiPolygon",
  coordinates: geometries.flatMap((geometry) =>
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
  ),
});

export const normalizeAoiGeoJson = (
  json: unknown
): { feature: AoiFeature; combinedCount?: number } => {
  if (!json || typeof json !== "object" || !("type" in json)) {
    throw new AoiParseError("This doesn't look like a valid GeoJSON file.");
  }

  const geoJson = json as GeoJSON.GeoJSON;

  if (geoJson.type === "Polygon" || geoJson.type === "MultiPolygon") {
    assertValidPolygon(geoJson);
    return { feature: { type: "Feature", properties: {}, geometry: geoJson } };
  }

  if (geoJson.type === "Feature") {
    if (!isPolygonGeometry(geoJson.geometry)) {
      throw new AoiParseError(
        "No polygon shape found. Please upload a GeoJSON Polygon, MultiPolygon, or a Feature/FeatureCollection containing one."
      );
    }
    assertValidPolygon(geoJson.geometry);
    return { feature: geoJson as AoiFeature };
  }

  if (geoJson.type === "FeatureCollection") {
    const polygonGeometries = geoJson.features
      .map((f) => f.geometry)
      .filter(
        (geometry): geometry is GeoJSON.Polygon | GeoJSON.MultiPolygon =>
          !!geometry && isPolygonGeometry(geometry) && hasValidRings(geometry)
      );

    if (polygonGeometries.length === 0) {
      throw new AoiParseError(
        "No polygon shape found. Please upload a GeoJSON Polygon, MultiPolygon, or a Feature/FeatureCollection containing one."
      );
    }

    if (polygonGeometries.length === 1) {
      return {
        feature: {
          type: "Feature",
          properties: {},
          geometry: polygonGeometries[0],
        },
      };
    }

    return {
      feature: {
        type: "Feature",
        properties: {},
        geometry: combinePolygonGeometries(polygonGeometries),
      },
      combinedCount: polygonGeometries.length,
    };
  }

  throw new AoiParseError(
    "No polygon shape found. Please upload a GeoJSON Polygon, MultiPolygon, or a Feature/FeatureCollection containing one."
  );
};

export const computeAoiFitBounds = (
  feature: AoiFeature
): [number, number, number, number] => {
  const [minX, minY, maxX, maxY] = bbox(feature);
  return [minX, minY, maxX, maxY];
};

export const loadAoiFromFile = async (
  file: File
): Promise<{ feature: AoiFeature; combinedCount?: number }> => {
  const json = await readAoiFile(file);
  return normalizeAoiGeoJson(json);
};
