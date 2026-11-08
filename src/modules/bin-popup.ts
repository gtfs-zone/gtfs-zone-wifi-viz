/** The popup for a clicked bin in bins.pmtiles. */

import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import type { Measures, ReportCounts } from '../data/artifacts';
import { t } from '../i18n/messages';
import { renderMeasures, renderReports } from './values';

type Props = Record<string, unknown>;

function parseJson<T>(v: unknown, fallback: T): T {
  if (typeof v !== 'string') {
    return fallback;
  }
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' ? v : null;
}

/**
 * The tile's flat properties back as measures: `cell` and `reports` are JSON
 * strings, `routes` is comma-separated and null values are left out.
 */
export function binFromProps(p: Props): {
  bin_id: string;
  routes: string[];
  measures: Measures;
  reports: ReportCounts;
} {
  return {
    bin_id: String(p.bin_id ?? ''),
    routes: String(p.routes ?? '')
      .split(',')
      .filter(Boolean),
    reports: parseJson<ReportCounts>(p.reports, {}),
    measures: {
      session_count: Number(p.session_count ?? 0),
      samples: Number(p.samples ?? 0),
      wifi_connected_share: numOrNull(p.wifi_connected_share),
      wifi_working_share: numOrNull(p.wifi_working_share),
      wifi_rssi_median: numOrNull(p.wifi_rssi_median),
      net_tests: Number(p.net_tests ?? 0),
      net_test_success_rate: numOrNull(p.net_test_success_rate),
      latency_ms_median: numOrNull(p.latency_ms_median),
      captive_portal_tests: Number(p.captive_portal_tests ?? 0),
      no_cell_samples: Number(p.no_cell_samples ?? 0),
      cell_level_0_4_median: numOrNull(p.cell_level_0_4_median),
      cell: parseJson(p.cell, {}),
    },
  };
}

/** Popup markup; `routeName` maps a route key to its display name. */
export function renderBinPopup(
  p: Props,
  routeName: (route_key: string) => string
): string {
  const bin = binFromProps(p);
  const routes = bin.routes
    .map(
      (key) =>
        `<button class="link" data-route-key="${escapeHtml(key)}">${escapeHtml(routeName(key))}</button>`
    )
    .join(', ');
  return `<div class="text-xs space-y-1 max-w-72 max-h-80 overflow-y-auto">
    <div class="font-semibold">${escapeHtml(t('values.bin', { id: bin.bin_id }))}</div>
    <div>${escapeHtml(t('values.routes'))}: ${routes}</div>
    ${renderMeasures(bin.measures)}
    <div class="font-semibold pt-1">${escapeHtml(t('route.reports'))}</div>
    ${renderReports(bin.reports)}
  </div>`;
}
