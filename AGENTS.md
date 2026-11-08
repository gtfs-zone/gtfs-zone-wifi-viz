# AGENTS.md

Static frontend at viz.wifi.gtfs.zone that demos the wifi.gtfs.zone data:
a map of the JSON and PMTiles published by gtfs-zone-wifi-pipeline and a
"wifi along this trip" view. Built on gtfs-zone-web-common, laid out like
gtfs-zone-rt-viewer.

- **Verification**: no Playwright or other browser automation. Stop at
  `pnpm typecheck` / `pnpm build` and hand off; the user checks in the browser.
- **UI**: conventions live in gtfs-zone-web-common's `AGENTS.md`.
- **Data**: read published artifacts only; no backend of its own.

## Conventions

- **Commits**: Conventional Commits, enforced by the `commit-msg` hook. Never add
  Co-Authored-By trailers. Setup is in [CONTRIBUTING.md](CONTRIBUTING.md).
- **Cross-repo work**: sibling gtfs.zone repos live under the same parent
  directory and may be read and edited when a change spans repos.
- **Plans**: the cross-repo plan is `docs/overview.md` in
  gtfs-zone-wifi-pipeline. A local `CURRENT_PLAN.md` here is neither tracked
  nor gitignored: never stage or commit it.
