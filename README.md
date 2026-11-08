# gtfs-zone-wifi-viz

Static frontend at https://viz.wifi.gtfs.zone that shows what wifi and cell
coverage riders actually get on transit.

- Map of the aggregates published by gtfs-zone-wifi-pipeline
- "Wifi along this trip": pick a trip and see expected wifi, cell coverage
  and amenities per segment
- Station wifi and captive portal reports

Built on gtfs-zone-web-common. See the [project overview](https://github.com/gtfs-zone/gtfs-zone-wifi-pipeline/blob/main/docs/overview.md).

## Development

```bash
pnpm install
pnpm dev          # dev server on :8091, reading public/fixtures/
pnpm check        # typecheck, lint, knip, vitest
pnpm build
```

`VITE_DATA_URL` sets where the artifacts are read from. It defaults to
`https://data.wifi.gtfs.zone`; `.env.development` points the dev server at
`/fixtures`. To read another copy of the artifacts (served with CORS and
range requests, for `bins.pmtiles`):

```bash
VITE_DATA_URL=http://localhost:3902 pnpm dev
```

`public/fixtures/` is the output of the gtfs-zone-wifi-pipeline test run (the
fixture sessions through every asset) and is left out of the build.

## Data license

The data shown is wifi.gtfs.zone data under the
[ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), with trip shapes
and stops via [Transitous](https://transitous.org/sources/) and map data from
[OpenStreetMap](https://www.openstreetmap.org/copyright).

## License

AGPL-3.0-or-later. See [LICENSE.txt](LICENSE.txt).
