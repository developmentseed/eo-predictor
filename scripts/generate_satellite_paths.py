import httpx
import subprocess
import json
import os
import asyncio
from skyfield.api import load, wgs84, Timescale
from datetime import datetime, timedelta, timezone
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, LineString

# Get the absolute path of the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the absolute path of the project root
project_root = os.path.dirname(script_dir)

# Define absolute paths for output files
public_dir = os.path.join(project_root, "public")
local_metadata_path = os.path.join(public_dir, "satellite_paths_metadata.json")
tiles_dir = os.path.join(public_dir, "tiles")
geojson_path = os.path.join(script_dir, "satellite_paths.geojson")


# Load satellite list from JSON
with open(os.path.join(script_dir, "satellite-list.json"), "r") as f:
    satellite_info = json.load(f)

# List of satellite TLE data URLs from Celestrak
urls = []
for sat in satellite_info:
    urls.append(f"https://celestrak.org/NORAD/elements/gp.php?CATNR={sat['norad_id']}&FORMAT=tle")

# Async function to fetch a single TLE URL
async def fetch_tle(client, url):
    try:
        response = await client.get(url)
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        print(f"  Successfully fetched from {url}")
        return response.text
    except httpx.HTTPStatusError as e:
        print(f"  Failed to fetch {url} (HTTP error: {e.response.status_code})")
        return ""
    except httpx.RequestError as e:
        print(f"  Failed to fetch {url} (Request error: {e})")
        return ""

# Async function to fetch all TLE URLs concurrently
async def fetch_all_tles(urls):
    async with httpx.AsyncClient() as client:
        tasks = [fetch_tle(client, url) for url in urls]
        return await asyncio.gather(*tasks)

# Fetch and combine TLE data
print("Fetching TLE data...")
combined_tle_content = ""

# Run the async fetching
all_tle_contents = asyncio.run(fetch_all_tles(urls))
combined_tle_content = "\n".join(all_tle_contents)

with open(os.path.join(script_dir, "combined_tle.txt"), "w") as outfile:
    outfile.write(combined_tle_content)

# Load satellites from the TLE file
print("Loading satellites from TLE file...")
satellites = load.tle_file(os.path.join(script_dir, "combined_tle.txt"))

# Create a mapping from NORAD ID to satellite data from your JSON
satellite_data_map = {str(sat["norad_id"]): sat for sat in satellite_info}

# Filter satellites to only include those from your JSON list and add properties
filtered_satellites = []
for sat in satellites:
    # Skyfield's sat.model.satnum is the NORAD ID
    if str(sat.model.satnum) in satellite_data_map:
        sat_props = satellite_data_map[str(sat.model.satnum)]
        sat.name = sat_props["name"]
        sat.constellation = sat_props["constellation"]
        sat.swath_km = sat_props["swath_km"]
        sat.operator = sat_props["operator"]
        sat.sensor_type = sat_props["sensor_type"]
        sat.spatial_res_m = sat_props["spatial_res_cm"] / 100 # Convert cm to meters
        sat.data_access = sat_props["data_access"]
        filtered_satellites.append(sat)
satellites = filtered_satellites

print(f"{len(satellites)} satellites loaded and filtered.")

# Set up the time range for the prediction
ts = load.timescale()
now = datetime.now(timezone.utc)
time_1 = now
time_2 = now + timedelta(days=2)

# Function to calculate satellite positions
def get_satellite_positions(sat, start_time, end_time, step_minutes):
    positions = []
    current_time = start_time
    while current_time <= end_time:
        geocentric = sat.at(ts.from_datetime(current_time))
        lat, lon = wgs84.latlon_of(geocentric)
        positions.append({
            "satellite": sat.name,
            "timestamp": current_time,
            "coordinates": Point(lon.degrees, lat.degrees),
            "swath_km": sat.swath_km,
            "constellation": sat.constellation,
            "operator": sat.operator,
            "sensor_type": sat.sensor_type,
            "spatial_res_m": sat.spatial_res_m, # Use meters
            "data_access": sat.data_access
        })
        current_time += timedelta(minutes=step_minutes)
    return positions

# Calculate positions for all satellites
print("\nCalculating satellite positions...")
all_positions = []
for i, sat in enumerate(satellites):
    print(f"  ({i+1}/{len(satellites)}) Calculating positions for {sat.name}")
    all_positions.extend(get_satellite_positions(sat, time_1, time_2, 5))

# Create a DataFrame from the positions
print("\nCreating DataFrame from positions...")
positions_df = pd.DataFrame(all_positions, columns=[
    "satellite", "timestamp", "coordinates", "swath_km", "constellation",
    "operator", "sensor_type", "spatial_res_m", "data_access" # Use meters
])

# Create LineString paths for each satellite
print("Creating LineString paths for each satellite...")
path_segments = []
for sat_name, group in positions_df.groupby('satellite'):
    group = group.sort_values('timestamp').reset_index(drop=True)
    for i in range(len(group) - 1):
        pt0 = group.loc[i, 'coordinates']
        pt1 = group.loc[i + 1, 'coordinates']

        # Skip segments that cross the antimeridian
        if abs(pt0.x - pt1.x) > 180:
            continue

        line = LineString([pt0, pt1])
        path_segments.append({
            'satellite': sat_name,
            'start_time': group.loc[i, 'timestamp'],
            'end_time': group.loc[i + 1, 'timestamp'],
            'geometry': line,
            'swath_km': group.loc[i, 'swath_km'],
            'constellation': group.loc[i, 'constellation'],
            'operator': group.loc[i, 'operator'],
            'sensor_type': group.loc[i, 'sensor_type'],
            'spatial_res_m': group.loc[i, 'spatial_res_m'], # Use meters
            'data_access': group.loc[i, 'data_access']
        })

if not path_segments:
    print("\nNo satellite paths were generated. Exiting.")
else:
    # Convert to a GeoDataFrame
    path_gdf = gpd.GeoDataFrame(path_segments, geometry='geometry', crs='EPSG:4326')

    # Buffer the lines to create polygons
    print("\nBuffering paths to create polygons...")
    path_gdf_proj = path_gdf.to_crs("EPSG:3395")
    # Use swath_km for buffering, converting km to meters
    path_gdf_proj['geometry'] = path_gdf_proj.apply(lambda row: row.geometry.buffer(row['swath_km'] * 500), axis=1) # Half of swath_km for buffer
    path_gdf = path_gdf_proj.to_crs("EPSG:4326")

    # Save metadata
    print("\nSaving metadata...")
    
    # Calculate spatial resolution ranges
    spatial_resolutions = path_gdf['spatial_res_m'].unique()
    spatial_resolution_ranges = []
    for res in spatial_resolutions:
        if res < 5:
            range_category = "high"
        elif res <= 30:
            range_category = "medium"
        else:
            range_category = "low"
        spatial_resolution_ranges.append(range_category)
    
    # Generate base metadata with tiles URL template
    base_metadata = {
        "satellites": path_gdf['satellite'].unique().tolist(),
        "constellations": path_gdf['constellation'].unique().tolist(),
        "operators": path_gdf['operator'].unique().tolist(),
        "sensor_types": path_gdf['sensor_type'].unique().tolist(),
        "data_access_options": path_gdf['data_access'].unique().tolist(),
        "spatial_resolution_ranges": list(set(spatial_resolution_ranges)),
        "minTime": path_gdf['start_time'].min().isoformat(),
        "maxTime": path_gdf['end_time'].max().isoformat(),
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "tilesUrl": "/tiles/{z}/{x}/{y}.pbf"
    }
    
    # Save local copy first
    with open(local_metadata_path, "w") as f:
        json.dump(base_metadata, f, indent=2)
    print(f"\nSuccessfully generated local {local_metadata_path}")

    # Save GeoJSON
    print("\nSaving paths to GeoJSON file...")
    path_gdf.to_file(geojson_path, driver='GeoJSON')
    print(f"\nSuccessfully generated {geojson_path}")

    # Generate directory tiles from the GeoJSON
    print("\nGenerating directory tiles from GeoJSON...")
    
    # Remove existing tiles directory if it exists
    if os.path.exists(tiles_dir):
        import shutil
        shutil.rmtree(tiles_dir)
    
    subprocess.run([
        "tippecanoe",
        "-Z0",
        "-z7", # Changed from -z12 to -z7
        "--simplification=10",
        "--drop-densest-as-needed",
        "--extend-zooms-if-still-dropping",
        "--detect-longitude-wraparound",
        "--no-tile-compression",  # Important for web hosting
        "--output-to-directory",
        tiles_dir,
        geojson_path,
        "--force"
    ])
    print(f"\nSuccessfully generated tiles in {tiles_dir}")
    
    print(f"\nTiles generated successfully and ready for GitHub hosting")
    print(f"Metadata saved to: {local_metadata_path}")
    print(f"Tiles directory: {tiles_dir}")
