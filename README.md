# Gaia_Vis
A tool for interactive 3D visualization of spatio-temporal environmental data.

## Running Locally
1. Clone the repo.
2. Run a live server in `gaia_vis/` (the root directory).
3. Open `index.html` in your browser.

## Code Structure
- `data/` contains all the datasets used in the tool demo, which also serve as examples of the kind of data format required for visualisation. The data format is described in the next section.
- `src/` contains the source code for the tool.
- `index.html` is the entry point for the tool, and redirects to `src/forestcover.html`.
- `data-helper-scripts` are python scripts used to manipulate geojson files. They are not required for running the tool. They are included for reference.

## Datasets
The tool currently uses the following datasets:
- `forestcover.geojson` - Forest cover data for the year 2015. The data is sourced from [here](https://www.naturalearthdata.com/downloads/) and [here](https://github.com/nvkelso/natural-earth-vector/tree/master) for country-wise data [here](https://ourworldindata.org/forest-area) for forest cover data.
- `volcanoes.json` - The data is sourced from [here](https://volcano.oregonstate.edu/volcano_table).
- `satellites.txt` - The data is sourced from [here](https://www.space-track.org/documentation#tle).
- `quakes.geojson` - The data is sourced from [here](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php).
