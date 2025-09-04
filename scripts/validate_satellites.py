#!/usr/bin/env python3
"""
Validation script for satellite constellation files.

This script validates:
1. JSON structure of all constellation files
2. Required fields are present
3. NORAD ID uniqueness across all constellations
4. Reasonable value ranges for technical specifications

Usage: python validate_satellites.py
"""

import json
import os
from collections import defaultdict

def validate_constellation_file(file_path, filename):
    """Validate a single constellation JSON file"""
    errors = []
    warnings = []
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {e}")
        return data, errors, warnings
    except Exception as e:
        errors.append(f"Could not read file: {e}")
        return None, errors, warnings
    
    # Required fields
    required_fields = [
        'constellation', 'operator', 'sensor_type', 'spatial_res_cm',
        'swath_km', 'altitude_km', 'off_nadir_deg', 'data_access', 'norad_ids'
    ]
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Validate field types and ranges
    if 'norad_ids' in data:
        if not isinstance(data['norad_ids'], list) or not data['norad_ids']:
            errors.append("norad_ids must be a non-empty list")
        else:
            for norad_id in data['norad_ids']:
                if not isinstance(norad_id, int) or norad_id <= 0:
                    errors.append(f"Invalid NORAD ID: {norad_id}")
    
    # Validate sensor types
    valid_sensors = ['optical', 'SAR', 'hyperspectral']
    if 'sensor_type' in data and data['sensor_type'] not in valid_sensors:
        warnings.append(f"Unusual sensor type: {data['sensor_type']} (expected: {valid_sensors})")
    
    # Validate data access types
    valid_access = ['open', 'commercial']
    if 'data_access' in data and data['data_access'] not in valid_access:
        warnings.append(f"Unusual data access: {data['data_access']} (expected: {valid_access})")
    
    # Validate reasonable ranges for technical specs
    if 'spatial_res_cm' in data:
        res = data['spatial_res_cm']
        if not isinstance(res, (int, float)) or res <= 0 or res > 100000:
            warnings.append(f"Unusual spatial resolution: {res}cm")
    
    if 'altitude_km' in data:
        alt = data['altitude_km']
        if not isinstance(alt, (int, float)) or alt < 200 or alt > 2000:
            warnings.append(f"Unusual altitude: {alt}km (typical range: 200-2000km)")
    
    if 'swath_km' in data:
        swath = data['swath_km']
        if not isinstance(swath, (int, float)) or swath <= 0 or swath > 3000:
            warnings.append(f"Unusual swath width: {swath}km")
    
    if 'off_nadir_deg' in data:
        angle = data['off_nadir_deg']
        if not isinstance(angle, (int, float)) or angle < 0 or angle > 90:
            errors.append(f"Invalid off-nadir angle: {angle}° (must be 0-90)")
    
    # Validate URL field (optional)
    if 'url' in data:
        url = data['url']
        if not isinstance(url, str) or not url.startswith(('http://', 'https://')):
            warnings.append(f"Invalid URL format: {url} (should start with http:// or https://)")
        if len(url) > 500:
            warnings.append(f"URL is very long ({len(url)} chars): {url}")
    
    return data, errors, warnings

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    satellites_dir = os.path.join(script_dir, "satellites")
    
    if not os.path.exists(satellites_dir):
        print(f"ERROR: Satellites directory not found: {satellites_dir}")
        return False
    
    print("Validating satellite constellation files...")
    print(f"Checking directory: {satellites_dir}")
    
    all_norad_ids = defaultdict(list)  # NORAD ID -> list of files containing it
    all_data = {}
    total_errors = 0
    total_warnings = 0
    total_satellites = 0
    
    # Process each constellation file
    for filename in sorted(os.listdir(satellites_dir)):
        if not filename.endswith('.json'):
            continue
        
        file_path = os.path.join(satellites_dir, filename)
        print(f"\n--- {filename} ---")
        
        data, errors, warnings = validate_constellation_file(file_path, filename)
        
        if errors:
            print(f"❌ ERRORS ({len(errors)}):")
            for error in errors:
                print(f"   {error}")
            total_errors += len(errors)
        
        if warnings:
            print(f"⚠️  WARNINGS ({len(warnings)}):")
            for warning in warnings:
                print(f"   {warning}")
            total_warnings += len(warnings)
        
        if not errors and not warnings:
            print("✅ OK")
        
        if data and 'norad_ids' in data:
            constellation_name = data.get('constellation', filename)
            print(f"   {len(data['norad_ids'])} satellites in {constellation_name}")
            total_satellites += len(data['norad_ids'])
            
            # Track NORAD IDs for uniqueness check
            for norad_id in data['norad_ids']:
                all_norad_ids[norad_id].append(filename)
            
            all_data[filename] = data
    
    # Check for duplicate NORAD IDs
    print(f"\n--- NORAD ID Uniqueness Check ---")
    duplicates_found = False
    for norad_id, files in all_norad_ids.items():
        if len(files) > 1:
            print(f"❌ DUPLICATE: NORAD ID {norad_id} found in: {', '.join(files)}")
            duplicates_found = True
            total_errors += 1
    
    if not duplicates_found:
        print("✅ All NORAD IDs are unique")
    
    # Summary
    print(f"\n--- SUMMARY ---")
    print(f"Constellation files: {len(all_data)}")
    print(f"Total satellites: {total_satellites}")
    print(f"Unique NORAD IDs: {len(all_norad_ids)}")
    print(f"Errors: {total_errors}")
    print(f"Warnings: {total_warnings}")
    
    if total_errors == 0:
        print("\n✅ VALIDATION PASSED - All constellation files are valid!")
        return True
    else:
        print(f"\n❌ VALIDATION FAILED - Found {total_errors} errors")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)