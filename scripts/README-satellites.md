# Satellite Constellation Management

This directory contains individual JSON files for each satellite constellation, making it easy to add or modify satellite data.

## Structure

```
scripts/
├── satellites/               # Individual constellation files
│   ├── sentinel-1.json      # ESA Sentinel-1 SAR satellites  
│   ├── iceye.json           # ICEYE commercial SAR constellation
│   ├── worldview-1.json     # Maxar WorldView-1
│   └── ...                  # One file per constellation
├── template-constellation.json  # Template for new constellations
├── generate_satellite_paths.py  # Main data processing script
└── validate_satellites.py      # Validation tool
```

## Adding New Constellations

1. **Copy the template:**
   ```bash
   cp template-constellation.json satellites/my-constellation.json
   ```

2. **Edit the file** with your constellation details:
   ```json
   {
     "constellation": "My Constellation",
     "operator": "My Company",
     "sensor_type": "optical",
     "spatial_res_cm": 100,
     "swath_km": 15,
     "altitude_km": 500,
     "off_nadir_deg": 30,
     "data_access": "commercial",
     "tasking": true,
     "norad_ids": [12345, 12346, 12347]
   }
   ```

3. **Validate your changes:**
   ```bash
   python validate_satellites.py
   ```

## Modifying Existing Constellations

To add satellites to an existing constellation, just edit the JSON file and add NORAD IDs to the `norad_ids` array.

## Field Reference

- **constellation**: Human-readable constellation name
- **operator**: Organization that operates the satellites
- **sensor_type**: `optical`, `SAR`, or `hyperspectral`
- **spatial_res_cm**: Spatial resolution in centimeters
- **swath_km**: Swath width in kilometers  
- **altitude_km**: Typical orbit altitude in kilometers
- **off_nadir_deg**: Maximum off-nadir viewing angle in degrees
- **data_access**: `open` (free) or `commercial` (paid)
- **tasking**: `true` if satellites can be tasked, `false` if pre-programmed
- **norad_ids**: Array of NORAD catalog numbers

## How It Works

The `generate_satellite_paths.py` script automatically:
1. Reads all JSON files from the `satellites/` directory
2. Fetches current satellite names from TLE data using NORAD IDs
3. Generates satellite path predictions and map tiles

## Examples

### Adding a New Constellation
```bash
# Copy template
cp template-constellation.json satellites/capella.json

# Edit satellites/capella.json:
{
  "constellation": "Capella",
  "operator": "Capella Space", 
  "sensor_type": "SAR",
  "spatial_res_cm": 50,
  "swath_km": 20,
  "altitude_km": 525,
  "off_nadir_deg": 45,
  "data_access": "commercial",
  "tasking": true,
  "norad_ids": [44420, 44421, 44422]
}

# Validate
python validate_satellites.py
```

### Adding Satellites to Existing Constellation
Just edit the appropriate file in `satellites/` and add NORAD IDs to the `norad_ids` array.

That's it! The file-based structure makes satellite management simple and straightforward.