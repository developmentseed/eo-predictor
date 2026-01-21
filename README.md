# EO Predictor

An interactive web application for visualizing Earth Observation satellite coverage paths and predicting upcoming satellite passes, primarily for humanitarian response planning.

<img width="1818" height="1527" alt="image" src="https://github.com/user-attachments/assets/8fed8a42-a2ef-41a5-b5c1-3d97c2745a99" />

## Motivation

The Earth Observation sector is highly fragmented, making it difficult to know when the next satellite observation will occur over a specific area of interest. For humanitarian organizations responding to disasters and crises, having access to the most up-to-date information about upcoming satellite passes is critical for mission planning, damage assessment, and resource allocation.

EO Predictor addresses this challenge by providing a visualization of satellite coverage paths, enabling humanitarian teams to anticipate when high-resolution imagery will be available for their areas of operation.

> [!IMPORTANT]
> This provides predicted satellite paths and _possible_ Earth Observation captures, but does not guarantee that an image/observation will become available.

## Features

- **Interactive Map Visualization**: Globe projection showing satellite coverage paths over 48-hour prediction windows
- **Real-time Filtering**: Filter satellites by constellation, operator, sensor type, spatial resolution, and data access
- **Time-based Controls**: Interactive timeline to visualize satellite passes at specific times
- **Satellite Details**: Click on coverage paths to view detailed satellite specifications
- **Mobile Responsive**: Optimized interface for both desktop and mobile devices
- **Humanitarian Focus**: Emphasis on satellites relevant for disaster response and humanitarian monitoring

## Technology Stack

### Frontend

- **React 19** with TypeScript for type-safe component development
- **MapLibre GL** for interactive globe visualization and vector tile rendering
- **Zustand** for reactive state management
- **shadcn/ui** design system built on Radix UI primitives
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and optimized builds

### Backend & Data Processing

- **Python 3.11+** with async/await patterns for concurrent data processing
- **Skyfield** for precise orbital calculations and satellite positioning
- **GeoPandas** for geospatial data manipulation and coverage polygon generation
- **Vector tiles** served from tile directories for efficient satellite path visualization
- **Celestrak API** for real-time Two-Line Element (TLE) data

## Quick Start

### Prerequisites

- Node.js 18+ and [pnpm](https://pnpm.io/)
- Python 3.11+ via [uv](https://docs.astral.sh/uv/)
- [tippecanoe](https://github.com/mapbox/tippecanoe) (for vector tile generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eo-predictor
   ```

2. **Install frontend dependencies**

   ```bash
   pnpm install
   ```

3. **Install Python dependencies**

   ```bash
   cd scripts
   uv sync
   ```

4. **Generate satellite data**

   ```bash
   uv run python generate_satellite_paths.py
   ```

5. **Start development server**

   ```bash
   cd ..
   pnpm dev
   ```

The application will be available at `http://localhost:5173`

## Data Sources

### Satellite Database

The application tracks a curated database of Earth Observation satellites organized in individual constellation files in `scripts/satellites/`, including:

- **Open Data Satellites**: Sentinel-1/2/3, Landsat-8/9, NISAR
- **Commercial Satellites**: Planet SkySat, PlanetScope, Maxar WorldView, ICEYE SAR
- **Sensor Types**: Optical, SAR, and Hyperspectral sensors
- **Technical Specifications**: Spatial resolution, swath width, data access policies
- **Reference URLs**: Links to official constellation information pages

> [!NOTE]
> Some of the information was collected using ChatGPT Deep Research, and has not been fully independently verified.

### Orbital Data

- **TLE Source**: Real-time Two-Line Element data from Celestrak
- **Update Frequency**: Satellite positions calculated every 5 minutes over 48-hour windows
- **Coverage Calculation**: Swath polygons generated based on satellite altitude and sensor characteristics

## Development

### Frontend Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint with TypeScript
pnpm preview      # Preview production build
```

### Data Processing Commands

```bash
cd scripts
uv sync           # Install Python dependencies
uv run python generate_satellite_paths.py  # Generate satellite path data
uv run python validate_satellites.py       # Validate constellation files
uv run ruff check                          # Run Python linting
uv run ruff format                         # Format Python code
```

### Project Structure

```text
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── customized/   # Project-specific components
│   ├── Controls.tsx  # Satellite filtering interface
│   ├── Header.tsx    # Navigation header
│   └── TimeSlider.tsx # Time range selection
├── store/
│   └── filterStore.ts # Zustand state management
├── utils/
│   └── mapUtils.ts   # Vector tiles and MapLibre utilities
└── App.tsx          # Main application component

scripts/
├── satellites/              # Individual constellation files
├── template-constellation.json # Template for new constellations
├── validate_satellites.py  # Constellation validation tool
├── generate_satellite_paths.py # Data processing pipeline
└── pyproject.toml          # Python dependencies
```

## Architecture

### Data Flow

1. **TLE Fetching**: Async requests to Celestrak API for orbital data
2. **Orbital Calculations**: Skyfield computes satellite positions over 48-hour windows
3. **Coverage Processing**: Generate swath polygons based on satellite specifications
4. **Vector Tile Generation**: Tippecanoe converts geospatial data to tile directories (`/public/tiles/`)
5. **Tile Serving**: Vector tiles served via HTTP at `/tiles/{z}/{x}/{y}.pbf` endpoint structure
6. **Interactive Visualization**: MapLibre renders tiles with real-time filtering

### State Management

- **Zustand Store**: Manages satellite filters and computed derived state
- **Filter Hierarchy**: Driver filters (sensor type, resolution) constrain constellation/operator options
- **MapLibre Integration**: Dynamic filter expressions update visualization without data re-fetching

## Contributing

### Adding New Satellites

1. **Copy the template:**
   ```bash
   cp scripts/template-constellation.json scripts/satellites/new-constellation.json
   ```

2. **Edit constellation details:** Update constellation name, operator, technical specifications, and NORAD IDs

3. **Validate:** Run `uv run python scripts/validate_satellites.py` to ensure data integrity

## Update Release

1. `pnpm version <major|minor|patch>`
2. `git push`
3. `gh release create --generate-notes`
4. Create new tag

## License

MIT
