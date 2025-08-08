# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EO-Predictor is a satellite tracking visualization web application that predicts and displays Earth Observation (EO) satellite coverage paths. It consists of a React/TypeScript frontend and Python data processing pipeline.

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + MapLibre GL + Tailwind CSS
- **Backend**: Python 3.11+ with Skyfield (satellite calculations), GeoPandas, and async HTTP
- **Data Format**: PMTiles vector tiles for efficient satellite path visualization
- **Package Managers**: `pnpm` (frontend), `uv` (Python)

## Key Development Commands

### Frontend Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint with TypeScript
pnpm preview      # Preview production build
```

### Data Processing
```bash
# Python scripts are in /scripts/ directory
cd scripts
uv sync           # Install Python dependencies
python generate_satellite_paths.py  # Generate satellite path data
```

## Architecture Overview

### Data Flow
1. **Data Generation**: Python script fetches TLE (Two-Line Element) data from Celestrak
2. **Path Calculation**: Skyfield calculates satellite positions over 2-day periods
3. **Geometry Processing**: Converts positions to coverage polygons and PMTiles format
4. **Visualization**: React app renders interactive satellite paths on MapLibre globe

### Key Components
- **satellite-list.json**: Master satellite database with NORAD IDs, operators, sensors
- **generate_satellite_paths.py**: Core data processing pipeline with async TLE fetching
- **App.tsx**: Main application with map controls and layer management
- **PMTiles output**: Vector tiles containing satellite path geometries and metadata

### Data Processing Pipeline
- Uses `asyncio.gather()` for concurrent TLE API calls to Celestrak
- Skyfield library for precise orbital calculations
- GeoPandas for geospatial data manipulation
- Time-based filtering with MapLibre expressions for interactive timeline

### Frontend Architecture
- Custom shadcn/ui components for controls (time slider, constellation selector)
- MapLibre globe projection with vector tile layers
- Interactive popups showing satellite details on path clicks
- Real-time filtering by time ranges and satellite constellations

## Development Patterns

- **Path Aliases**: Use `@/*` for `src/*` imports
- **Async Data Processing**: Python scripts use async/await patterns for API calls
- **Time-based Visualization**: Map layers dynamically filter by selected time ranges
- **Responsive Controls**: Time slider and constellation selector drive map updates
- **PMTiles Integration**: Efficient vector tile serving for large satellite datasets
- **UI Design**: Use shadcn/ui components and design philosophy for consistent, accessible interfaces