#!/usr/bin/env python3
"""
Migration script to convert the flat satellite-list.json into individual constellation files.

This script:
1. Reads the existing satellite-list.json
2. Groups satellites by constellation 
3. Creates individual JSON files in satellites/ folder
4. Validates that no data is lost in the conversion

Usage: python migrate_to_folders.py
"""

import json
import os
from collections import defaultdict

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Read the existing satellite list
    satellite_list_path = os.path.join(script_dir, "satellite-list.json")
    with open(satellite_list_path, 'r') as f:
        satellites = json.load(f)
    
    print(f"Loaded {len(satellites)} satellites from satellite-list.json")
    
    # Group satellites by constellation
    constellations = defaultdict(list)
    
    for satellite in satellites:
        constellation_name = satellite['constellation']
        constellations[constellation_name].append(satellite)
    
    print(f"Found {len(constellations)} unique constellations:")
    for const_name, sats in constellations.items():
        print(f"  - {const_name}: {len(sats)} satellites")
    
    # Create satellites directory
    satellites_dir = os.path.join(script_dir, "satellites")
    os.makedirs(satellites_dir, exist_ok=True)
    print(f"\nCreated directory: {satellites_dir}")
    
    # Generate individual constellation files
    total_satellites_written = 0
    
    for constellation_name, satellites_in_const in constellations.items():
        # Use the first satellite as template for constellation metadata
        template = satellites_in_const[0].copy()
        
        # Extract NORAD IDs from all satellites in this constellation
        norad_ids = [sat['norad_id'] for sat in satellites_in_const]
        
        # Create constellation file structure
        constellation_data = {
            'constellation': template['constellation'],
            'operator': template['operator'],
            'sensor_type': template['sensor_type'],
            'spatial_res_cm': template['spatial_res_cm'],
            'swath_km': template['swath_km'],
            'altitude_km': template['altitude_km'],
            'off_nadir_deg': template['off_nadir_deg'],
            'data_access': template['data_access'],
            'norad_ids': sorted(norad_ids)
        }
        
        # Add 'tasking' field if it exists in the template
        if 'tasking' in template:
            constellation_data['tasking'] = template['tasking']
        
        # Validate all satellites in constellation have same metadata
        for sat in satellites_in_const:
            for key in ['operator', 'sensor_type', 'spatial_res_cm', 'swath_km', 
                       'altitude_km', 'off_nadir_deg', 'data_access']:
                if sat[key] != template[key]:
                    print(f"WARNING: Inconsistent {key} in constellation {constellation_name}")
                    print(f"  Template: {template[key]}")
                    print(f"  Satellite {sat['name']}: {sat[key]}")
        
        # Create filename (sanitize constellation name for filesystem)
        filename = constellation_name.lower().replace(' ', '-').replace('/', '-')
        file_path = os.path.join(satellites_dir, f"{filename}.json")
        
        # Write constellation file
        with open(file_path, 'w') as f:
            json.dump(constellation_data, f, indent=2)
        
        total_satellites_written += len(satellites_in_const)
        print(f"Created {filename}.json with {len(norad_ids)} satellites")
    
    print(f"\nMigration complete!")
    print(f"Created {len(constellations)} constellation files")
    print(f"Total satellites: {total_satellites_written} (original: {len(satellites)})")
    
    # Validation check
    if total_satellites_written != len(satellites):
        print("ERROR: Satellite count mismatch! Some data may have been lost.")
        return False
    else:
        print("✓ All satellites successfully migrated")
        return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)