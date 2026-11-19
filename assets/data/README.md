# Footprint globe assets

- `footprint-world.json`: world-atlas 2.0.2, `countries-110m.json`, https://github.com/topojson/world-atlas. Derived from Natural Earth public-domain cartography (https://www.naturalearthdata.com/about/terms-of-use/).
- D3 7.9.0 and topojson-client 3.1.0 are served from `assets/js/lib/`, with their ISC licenses alongside them.
- Visited places are stored in `_data/footprint.json`. Names and coordinates were imported from the existing public Google My Maps KML on 2026-11-19: https://www.google.com/maps/d/kml?mid=1CCrwMqOjRP27GkbI51z7hSaEk2VdpjE&forcekml=1

The city list is a static snapshot, not a live Google Maps connection. Add or edit entries in `_data/footprint.json` using `name`, `lat`, and `lon`. The page generates the count, list, and globe markers from that single data source.
