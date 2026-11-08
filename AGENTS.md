# AGENTS.md

Static frontend at viz.wifi.gtfs.zone that demos the wifi.gtfs.zone data:
a map of the JSON and PMTiles published by gtfs-zone-wifi-pipeline and a
"wifi along this trip" view. Built on gtfs-zone-web-common, laid out like
gtfs-zone-rt-viewer.

- **Verification**: no Playwright or other browser automation. Stop at
  `pnpm typecheck` / `pnpm build` and hand off; the user checks in the browser.
- **UI**: conventions live in gtfs-zone-web-common's `AGENTS.md`.
- **Data**: read published artifacts only; no backend of its own.

## Commands

```bash
pnpm dev          # dev server on :8091, reading public/fixtures/
pnpm check        # typecheck, lint, knip, vitest
pnpm vuln         # osv-scanner vulnerability gate
```

Deployed to GitHub Pages from `v*` tags.

## Architecture

- `src/data/artifacts.ts`: types and loaders for `index.json`,
  `routes/<route_key>.json` and `stations.json`, under `VITE_DATA_URL`.
- `src/map-controller.ts`: web-common's `RtMapController` with no GTFS feed;
  adds `bins.pmtiles` (via the `pmtiles` protocol) and the stations.
- `src/modules/metric.ts`: the wifi, latency and cell colour scales, as JS
  and as MapLibre expressions.
- `src/modules/panel-view.ts`: route and station lists, the route strip
  (`route-strip.ts`) and the station checklist.
- `public/fixtures/`: the pipeline's test output, for `pnpm dev`; dropped
  from `dist/` at build.

## Conventions

- **Commits**: Conventional Commits, enforced by the `commit-msg` hook. Never add
  Co-Authored-By trailers. Setup is in [CONTRIBUTING.md](CONTRIBUTING.md).
- **Cross-repo work**: sibling gtfs.zone repos live under the same parent
  directory and may be read and edited when a change spans repos.
- **Plans**: the central plan is `CURRENT_PLAN.md` in gtfs-zone-wifi-pipeline
  (phases across all wifi repos). A local `CURRENT_PLAN.md` here only points
  there. It is neither tracked nor gitignored: never stage or commit it.
