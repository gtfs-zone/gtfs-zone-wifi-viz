/** Application-wide constants. */
export const CONFIG = {
  /** Where the pipeline's artifacts live; `.env.development` points at the fixtures. */
  DATA_URL: (
    import.meta.env.VITE_DATA_URL || 'https://data.wifi.gtfs.zone'
  ).replace(/\/+$/, ''),

  // Per-device map preferences, not part of a shared link.
  MAP_VIEW_KEY: 'wifi.map.view',
  MAP_APPEARANCE_KEY: 'wifi.map.appearance',
  /** The metric the map and strip colour by, per device. */
  METRIC_KEY: 'wifi.metric',
} as const;
