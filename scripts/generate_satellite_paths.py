import requests
import subprocess
import json
import os
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
metadata_path = os.path.join(public_dir, "satellite_paths_metadata.json")
pmtiles_path = os.path.join(public_dir, "satellite_paths.pmtiles")
geojson_path = os.path.join(script_dir, "satellite_paths.geojson")

# Load satellite list from JSON
with open(os.path.join(script_dir, "satellite-list.json"), "r") as f:
    satellite_info = json.load(f)

# List of satellite TLE data URLs from Celestrak
urls = []
for sat in satellite_info:
    urls.append(f"https://celestrak.org/NORAD/elements/gp.php?CATNR={sat['norad_id']}&FORMAT=tle")

# Fetch and combine TLE data
print("Fetching TLE data...")
combined_tle_content = ""
for url in urls:
    print(f"  Fetching from {url}")
    response = requests.get(url)
    if response.status_code == 200:
        combined_tle_content += response.text.strip() + "\n"
    else:
        print(f"  Failed to fetch {url} (status: {response.status_code})")

with open(os.path.join(script_dir, "combined_tle.txt"), "w") as outfile:
    outfile.write(combined_tle_content)

# Load satellites from the TLE file
print("Loading satellites from TLE file...")
satellites = load.tle_file(os.path.join(script_dir, "combined_tle.txt"))

# Create a mapping from NORAD ID to satellite name and swath_km from your JSON
satellite_data_map = {str(sat["norad_id"]): {"name": sat["name"], "swath_km": sat["swath_km"]} for sat in satellite_info}

# Filter satellites to only include those from your JSON list and rename them
filtered_satellites = []
for sat in satellites:
    # Skyfield's sat.model.satnum is the NORAD ID
    if str(sat.model.satnum) in satellite_data_map:
        sat.name = satellite_data_map[str(sat.model.satnum)]["name"]
        sat.swath_km = satellite_data_map[str(sat.model.satnum)]["swath_km"]
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
            "swath_km": sat.swath_km
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
positions_df = pd.DataFrame(all_positions, columns=["satellite", "timestamp", "coordinates", "swath_km"])

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
            'swath_km': group.loc[i, 'swath_km'] # Add swath_km to path segments
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
    metadata = {
        "satellites": path_gdf['satellite'].unique().tolist(),
        "minTime": path_gdf['start_time'].min().isoformat(),
        "maxTime": path_gdf['end_time'].max().isoformat(),
    }
    with open(metadata_path, "w") as f:
        json.dump(metadata, f)
    print(f"\nSuccessfully generated {metadata_path}")

    # Save GeoJSON
    print("\nSaving paths to GeoJSON file...")
    path_gdf.to_file(geojson_path, driver='GeoJSON')
    print(f"\nSuccessfully generated {geojson_path}")

    # Generate PMTiles from the GeoJSON
    print("\nGenerating PMTiles from GeoJSON...")
    subprocess.run([
        "tippecanoe",
        "-Z0",
        "-z8", # Changed from -z12 to -z8
        "--simplification=10",
        "--drop-densest-as-needed",
        "--extend-zooms-if-still-dropping",
        "--detect-longitude-wraparound",
        "-o",
        pmtiles_path,
        geojson_path,
        "--force"
    ])
    print(f"\nSuccessfully generated {pmtiles_path}")
