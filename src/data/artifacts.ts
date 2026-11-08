/** Types and loaders for the public artifacts (docs/overview.md in gtfs-zone-wifi-pipeline). */

import { CONFIG } from '../config';

export interface CellValues {
  samples: number;
  level_dbm_median: number | null;
  level_0_4_median: number | null;
}

/** Per report field (outlets, wifi, portal, ...), sessions per answer. */
export type ReportCounts = Record<string, Record<string, number>>;

/** The values every bin and station carries. */
export interface Measures {
  session_count: number;
  samples: number;
  wifi_connected_share: number | null;
  wifi_working_share: number | null;
  wifi_rssi_median: number | null;
  net_tests: number;
  net_test_success_rate: number | null;
  latency_ms_median: number | null;
  captive_portal_tests: number;
  no_cell_samples: number;
  cell_level_0_4_median: number | null;
  cell: Record<string, CellValues>;
}

export interface RouteSummary {
  route_key: string;
  name: string;
  mode: string;
  agency: string;
  feed: string;
  session_count: number;
  bin_count: number;
}

export interface DataIndex {
  updated_at: string;
  license: string;
  attribution: string;
  routes: RouteSummary[];
  station_count: number;
  bin_count: number;
}

export interface RouteBin extends Measures {
  bin_id: string;
  from_m: number;
  to_m: number;
  reports: ReportCounts;
}

export interface RouteStop {
  stop_id: string;
  name: string;
  m: number;
}

export interface RouteFile {
  updated_at: string;
  route_key: string;
  route_id: string;
  name: string;
  mode: string;
  agency: string;
  feed: string;
  session_count: number;
  length_m: number;
  stops: RouteStop[];
  reports: ReportCounts;
  bins: RouteBin[];
}

export interface Station extends Measures {
  station_key: string;
  name: string;
  lat: number;
  lon: number;
  checklist: Record<string, { yes: number; no: number }>;
}

export interface StationsFile {
  updated_at: string;
  stations: Station[];
}

/** An artifact's URL; relative data URLs resolve against the page. */
export function dataUrl(path: string, base: string = CONFIG.DATA_URL): string {
  return new URL(`${base}/${path}`, location.href).href;
}

/**
 * The route file's path. `route_key` is already percent-encoded and the `%`
 * is part of the object key, so it is encoded once more.
 */
export function routePath(route_key: string): string {
  return `routes/${encodeURIComponent(route_key)}.json`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(dataUrl(path));
  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const fetchIndex = (): Promise<DataIndex> => getJson('index.json');
export const fetchStations = (): Promise<StationsFile> =>
  getJson('stations.json');
export const fetchRoute = (route_key: string): Promise<RouteFile> =>
  getJson(routePath(route_key));
