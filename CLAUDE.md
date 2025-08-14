# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EO-Predictor is a satellite tracking visualization web application that predicts and displays Earth Observation (EO) satellite coverage paths. It consists of a React/TypeScript frontend and Python data processing pipeline.

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + MapLibre GL + Tailwind CSS
- **UI Framework**: shadcn/ui design system built on Radix UI primitives
- **State Management**: Zustand for reactive state management
- **Backend**: Python 3.11+ with Skyfield (satellite calculations), GeoPandas, and async HTTP
- **Data Format**: PMTiles vector tiles for efficient satellite path visualization
- **Package Managers**: `pnpm` (frontend), `uv` (Python)
- **Build Tools**: Vite, TypeScript compiler, tippecanoe (PMTiles generation)

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
# Note: Requires tippecanoe to be installed system-wide for PMTiles generation
```

## Architecture Overview

### Data Flow
1. **Data Generation**: Python script fetches TLE (Two-Line Element) data from Celestrak
2. **Path Calculation**: Skyfield calculates satellite positions over 2-day periods
3. **Geometry Processing**: Converts positions to coverage polygons and PMTiles format
4. **Visualization**: React app renders interactive satellite paths on MapLibre globe

### Key Components
- **scripts/satellite-list.json**: Master satellite database with NORAD IDs, operators, sensors, and technical specifications
- **generate_satellite_paths.py**: Core data processing pipeline with async TLE fetching from Celestrak
- **App.tsx**: Main application with Header, map controls, and layer management
- **filterStore.ts**: Zustand store managing satellite filtering and MapLibre filter expressions
- **PMTiles output**: Vector tiles containing satellite path geometries and metadata
- **Header.tsx**: Navigation component with title and menu links

### Data Processing Pipeline
- Uses `asyncio.gather()` for concurrent TLE API calls to Celestrak
- Skyfield library for precise orbital calculations
- GeoPandas for geospatial data manipulation
- Time-based filtering with MapLibre expressions for interactive timeline

### Frontend Architecture
- **Component Library**: shadcn/ui components built on Radix UI (Accordion, Select, ToggleGroup, NavigationMenu)
- **State Management**: Zustand store with computed derived state and MapLibre filter generation
- **Map Rendering**: MapLibre globe projection with PMTiles vector tile layers
- **Interactive Controls**: Time slider, constellation/operator/sensor type filtering with dynamic availability
- **Real-time Updates**: Filter expressions update map layers without re-fetching data
- **Responsive Design**: Mobile and desktop layouts with collapsible sidebar

## Development Patterns

- **Path Aliases**: Use `@/*` for `src/*` imports (configured in vite.config.ts and tsconfig.json)
- **Async Data Processing**: Python scripts use `asyncio.gather()` for concurrent TLE API calls
- **State Management**: Zustand patterns with computed derived state and reactive updates
- **Component Organization**: Separate UI components (`/ui`) from customized components (`/customized`)
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Filter Architecture**: MapLibre expressions for client-side filtering without data re-fetching
- **Time-based Visualization**: Dynamic filter expressions based on selected time ranges
- **UI Consistency**: shadcn/ui design system for consistent, accessible interfaces
- **PMTiles Integration**: Efficient vector tile serving with tippecanoe optimization

## State Management Architecture

### Zustand Store (`filterStore.ts`)
- **Raw Data**: Satellite metadata and TLE-derived satellite list
- **Filter State**: Selected values for constellation, operator, sensor type, spatial resolution, data access
- **Computed State**: Available options with disabled states based on filter dependencies
- **MapLibre Integration**: Dynamic filter expression generation for vector tile layers
- **Filter Hierarchy**: Driver filters (sensor type, spatial resolution, data access) constrain constellation/operator options

### Component Integration
- **Controls.tsx**: ToggleGroup components for sensor types, spatial resolution, data access; Select components for constellation/operator
- **TimeSlider.tsx**: Time range selection integrated with filter store
- **PassCounter.tsx**: Real-time satellite pass counting based on current filters

## Troubleshooting

### Common Issues
- **Build Errors**: Ensure all dependencies are installed with `pnpm install`
- **TypeScript Errors**: Check path aliases are configured correctly in tsconfig.json
- **PMTiles Generation**: Verify tippecanoe is installed system-wide (`brew install tippecanoe` on macOS)
- **Python Dependencies**: Use `uv sync` in scripts directory, requires Python 3.11+
- **Map Loading Issues**: Check PMTiles files exist in `/public` directory
- **Filter Issues**: Verify satellite-list.json structure matches expected schema

### Development Dependencies
- **tippecanoe**: Required for PMTiles generation (install system-wide)
- **Python 3.11+**: Required for Skyfield orbital calculations
- **Node.js 18+**: Required for Vite and React 19

## TypeScript Configuration

### Path Resolution
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Vite Configuration
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```