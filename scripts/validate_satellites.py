#!/usr/bin/env python3
"""
Validation script for satellite constellation files.

This script validates:
1. JSON structure of all constellation files using Pydantic models
2. Required fields are present
3. NORAD ID uniqueness across all constellations
4. Data type validation and constraints

Usage: uv run validate_satellites.py
"""

import json
import os
from collections import defaultdict
from typing import Annotated, List, Literal, Optional
from pydantic import BaseModel, Field, HttpUrl


class SatelliteConstellation(BaseModel):
    """Model for satellite constellation data with validation rules."""

    constellation: str = Field(
        min_length=1, description="Human-readable constellation name"
    )
    operator: str = Field(
        min_length=1, description="Organization that operates the satellites"
    )
    sensor_type: Literal["optical", "SAR", "hyperspectral"] = Field(
        description="Type of sensor on the satellites"
    )
    spatial_res_cm: float = Field(gt=0, description="Spatial resolution in centimeters")
    swath_km: float = Field(gt=0, description="Swath width in kilometers")
    altitude_km: float = Field(description="Typical orbit altitude in kilometers")
    off_nadir_deg: float = Field(
        description="Maximum off-nadir viewing angle in degrees"
    )
    data_access: Literal["open", "commercial"] = Field(
        description="Data access type - free (open) or paid (commercial)"
    )
    tasking: bool = Field(
        description="Whether satellites can be tasked (true) or are pre-programmed (false)"
    )
    url: Optional[HttpUrl] = Field(
        None, description="Optional link to constellation information page"
    )
    norad_ids: List[Annotated[int, Field(gt=0)]] = Field(
        min_length=1, description="Array of NORAD catalog numbers"
    )
    data_repo_type: Optional[Literal["STAC", "API", "portal", "bucket", "other"]] = (
        Field(None, description="Type of data repository. STAC is preferred.")
    )
    data_repo_url: Optional[HttpUrl] = Field(
        None,
        description="Link to get data. Preferred STAC catalog, can also be API, portal, bucket or other",
    )

    class ConfigDict:
        extra = "forbid"  # Forbid extra fields to catch typos
        use_enum_values = True


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    satellites_dir = os.path.join(script_dir, "satellites")

    if not os.path.exists(satellites_dir):
        raise FileNotFoundError(f"Satellites directory not found: {satellites_dir}")

    all_norad_ids = defaultdict(list)
    constellations = []

    # Validate each constellation file
    for filename in sorted(os.listdir(satellites_dir)):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(satellites_dir, filename)
        with open(file_path) as f:
            data = json.load(f)

        constellation = SatelliteConstellation.model_validate(data)
        constellations.append(constellation)

        # Track NORAD IDs for uniqueness check
        for norad_id in constellation.norad_ids:
            all_norad_ids[norad_id].append(filename)

    # Check for duplicate NORAD IDs across constellations
    duplicates = [
        (norad_id, files) for norad_id, files in all_norad_ids.items() if len(files) > 1
    ]
    if duplicates:
        duplicate_errors = [
            f"Duplicate NORAD ID {norad_id} in: {', '.join(files)}"
            for norad_id, files in duplicates
        ]
        raise ValueError(f"NORAD ID duplicates found: {'; '.join(duplicate_errors)}")

    total_satellites = sum(len(c.norad_ids) for c in constellations)
    print(
        f"✅ VALIDATION PASSED - {len(constellations)} constellation files, {total_satellites} satellites"
    )


main()
