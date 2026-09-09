EO-Predictor is a public satellite-tracking visualization app: an interactive
MapLibre globe showing predicted Earth Observation satellite coverage paths.
There is no login/account system — test as an anonymous visitor.

Focus areas:

- The time slider that filters satellite passes by time range.
- Constellation / operator / sensor-type / spatial-resolution / data-access
  filter controls (Controls.tsx) and how they interact (some filters disable
  others depending on current selection).
- The pass counter updating correctly as filters change.
- Map interactions: panning/zooming the globe, clicking satellite paths.
- Mobile vs desktop responsive layout, including the collapsible sidebar.
- Console errors, especially around PMTiles loading or MapLibre filter
  expressions.
