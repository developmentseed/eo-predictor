import requests
from skyfield.api import load, wgs84, Timescale
from datetime import datetime, timedelta, timezone
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, LineString

# List of satellite TLE data URLs from Celestrak
urls = [
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=planet&FORMAT=tle",
]

# Fetch and combine TLE data
print("Fetching TLE data...")
with open("combined_tle.txt", "w") as outfile:
    for url in urls:
        print(f"  Fetching from {url}")
        response = requests.get(url)
        if response.status_code == 200:
            outfile.write(response.text.strip() + "\n")
        else:
            print(f"  Failed to fetch {url} (status: {response.status_code})")

# Read and print the content of the TLE file for debugging
with open("combined_tle.txt", "r") as infile:
    tle_content = infile.read()
    print("\n--- TLE File Content ---")
    print(tle_content)
    print("--- End TLE File Content ---\n")

# Load satellites from the TLE file
print("Loading satellites from TLE file...")
satellites = load.tle_file("combined_tle.txt")
print(f"{len(satellites)} satellites loaded.")

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
            "coordinates": Point(lon.degrees, lat.degrees)
        })
        current_time += timedelta(minutes=step_minutes)
    return positions

# Calculate positions for all satellites
print("\nCalculating satellite positions...")
all_positions = []
for i, sat in enumerate(satellites):
    print(f"  ({i+1}/{len(satellites)}) Calculating positions for {sat.name}")
    all_positions.extend(get_satellite_positions(sat, time_1, time_2, 3))

# Create a DataFrame from the positions
print("\nCreating DataFrame from positions...")
positions_df = pd.DataFrame(all_positions, columns=["satellite", "timestamp", "coordinates"])

# Create LineString paths for each satellite
print("Creating LineString paths for each satellite...")
path_segments = []
for sat_name, group in positions_df.groupby('satellite'):
    group = group.sort_values('timestamp').reset_index(drop=True)
    for i in range(len(group) - 1):
        pt0 = group.loc[i, 'coordinates']
        pt1 = group.loc[i + 1, 'coordinates']
        line = LineString([pt0, pt1])
        path_segments.append({
            'satellite': sat_name,
            'start_time': group.loc[i, 'timestamp'],
            'end_time': group.loc[i + 1, 'timestamp'],
            'geometry': line
        })

if not path_segments:
    print("\nNo satellite paths were generated. Exiting.")
else:
    # Convert to a GeoDataFrame and save as GeoJSON
    print("\nSaving paths to GeoJSON file...")
    path_gdf = gpd.GeoDataFrame(path_segments, geometry='geometry', crs='EPSG:4326')
    path_gdf.to_file("satellite_paths.geojson", driver='GeoJSON')
    print("\nSuccessfully generated satellite_paths.geojson")
