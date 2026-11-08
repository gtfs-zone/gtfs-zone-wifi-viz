/** The right panel: route and station lists, a route's strip and a station's checklist. */

import { formatDate } from 'gtfs-zone-web-common/i18n/fmt';
import { SELECTED_ROW_CLASS } from 'gtfs-zone-web-common/ui/selectable-row';
import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import type { DataIndex, RouteFile, Station } from '../data/artifacts';
import { dataUrl } from '../data/artifacts';
import { t } from '../i18n/messages';
import type { View } from './hash-state';
import { metricColor, metricValue, type Metric } from './metric';
import { renderRouteStrip } from './route-strip';
import {
  formatPercent,
  renderChecklist,
  renderMeasures,
  renderReports,
} from './values';

/** What the route view shows while its file loads or after it failed. */
export type RouteState =
  | { status: 'loading' }
  | { status: 'error'; reason: string }
  | { status: 'ready'; route: RouteFile };

export interface PanelState {
  index: DataIndex;
  stations: Station[];
  view: View;
  metric: Metric;
  route: RouteState | null;
  /** The bin row last clicked in the route view. */
  selectedBin: string | null;
}

const ODBL = 'https://opendatacommons.org/licenses/odbl/1-0/';
const TRANSITOUS = 'https://transitous.org';
const TRANSITOUS_SOURCES = 'https://transitous.org/sources/';
const OSM = 'https://www.openstreetmap.org/copyright';

function link(href: string, text: string): string {
  return `<a class="link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
}

function swatch(color: string): string {
  return `<span class="inline-block w-3 h-3 rounded-sm flex-shrink-0" style="background:${color}"></span>`;
}

function heading(text: string): string {
  return `<h3 class="font-semibold mt-4 mb-1">${escapeHtml(text)}</h3>`;
}

function backButton(label: string, nav: string): string {
  return `<button class="btn btn-ghost btn-sm -ml-2 mb-2" data-nav="${nav}">&lsaquo; ${escapeHtml(label)}</button>`;
}

function tabs(active: 'routes' | 'stations'): string {
  const tab = (id: 'routes' | 'stations', text: string) =>
    `<button role="tab" class="tab${active === id ? ' tab-active' : ''}" data-nav="${id}">${escapeHtml(text)}</button>`;
  return `<div role="tablist" class="tabs tabs-box tabs-sm mb-3">${tab('routes', t('tab.routes'))}${tab('stations', t('tab.stations'))}</div>`;
}

function listRow(
  attrs: string,
  selected: boolean,
  color: string,
  title: string,
  subtitle: string,
  value: string
): string {
  return `<li><button ${attrs} class="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-base-200 ${selected ? SELECTED_ROW_CLASS : ''}">
    ${swatch(color)}
    <span class="flex-1 min-w-0"><span class="block truncate font-medium">${escapeHtml(title)}</span><span class="block truncate text-xs opacity-60">${escapeHtml(subtitle)}</span></span>
    <span class="text-xs tabular-nums">${escapeHtml(value)}</span>
  </button></li>`;
}

function renderRouteList(s: PanelState): string {
  if (!s.index.routes.length) {
    return `<p class="text-sm opacity-60">${escapeHtml(t('routes.empty'))}</p>`;
  }
  return `<ul class="space-y-0.5">${s.index.routes
    .map((r) =>
      listRow(
        `data-route-key="${escapeHtml(r.route_key)}"`,
        false,
        'transparent',
        r.name,
        `${r.agency} - ${t('routes.sessions', { count: r.session_count })}, ${t('routes.bins', { count: r.bin_count })}`,
        ''
      )
    )
    .join('')}</ul>`;
}

function renderStationList(s: PanelState): string {
  if (!s.stations.length) {
    return `<p class="text-sm opacity-60">${escapeHtml(t('stations.empty'))}</p>`;
  }
  return `<ul class="space-y-0.5">${s.stations
    .map((st) =>
      listRow(
        `data-station-key="${escapeHtml(st.station_key)}"`,
        false,
        metricColor(s.metric, metricValue(s.metric, st)),
        st.name,
        t('routes.sessions', { count: st.session_count }),
        formatPercent(st.wifi_working_share)
      )
    )
    .join('')}</ul>`;
}

function renderRoute(s: PanelState, route_key: string): string {
  const back = backButton(t('route.back'), 'routes');
  const summary = s.index.routes.find((r) => r.route_key === route_key);
  if (!summary) {
    return `${back}<p class="text-sm">${escapeHtml(t('route.unknown'))}</p>`;
  }
  const head = `${back}<h2 class="text-lg font-bold">${escapeHtml(summary.name)}</h2>
    <p class="text-sm opacity-70">${escapeHtml(summary.agency)} - ${escapeHtml(t('routes.sessions', { count: summary.session_count }))}</p>`;
  const st = s.route;
  if (!st || st.status === 'loading') {
    return `${head}<div class="flex justify-center py-6"><span class="loading loading-spinner"></span></div>`;
  }
  if (st.status === 'error') {
    return `${head}<p class="text-sm text-error mt-3">${escapeHtml(t('route.failed', { reason: st.reason }))}</p>`;
  }
  const route = st.route;
  const bins = route.bins
    .map((b) =>
      listRow(
        `data-bin-id="${escapeHtml(b.bin_id)}"`,
        s.selectedBin === b.bin_id,
        metricColor(s.metric, metricValue(s.metric, b)),
        t('route.binRange', {
          from: (b.from_m / 1000).toFixed(1),
          to: (b.to_m / 1000).toFixed(1),
        }),
        t('routes.sessions', { count: b.session_count }),
        formatPercent(b.wifi_working_share)
      )
    )
    .join('');
  return `${head}
    <p class="text-sm opacity-70">${escapeHtml(t('route.length', { km: (route.length_m / 1000).toFixed(1) }))}</p>
    ${heading(t('route.along'))}
    <p class="text-xs opacity-60">${escapeHtml(t('route.alongHint'))}</p>
    ${renderRouteStrip(route, s.metric)}
    ${heading(t('route.reports'))}
    ${renderReports(route.reports)}
    ${heading(t('route.bins'))}
    <ul class="space-y-0.5">${bins}</ul>`;
}

function renderStation(s: PanelState, station_key: string): string {
  const back = backButton(t('station.back'), 'stations');
  const st = s.stations.find((x) => x.station_key === station_key);
  if (!st) {
    return `${back}<p class="text-sm">${escapeHtml(t('station.unknown'))}</p>`;
  }
  return `${back}<h2 class="text-lg font-bold">${escapeHtml(st.name)}</h2>
    ${heading(t('station.checklist'))}
    ${renderChecklist(st.checklist)}
    ${heading(t('station.values'))}
    ${renderMeasures(st)}`;
}

function renderFooter(index: DataIndex): string {
  const updated = formatDate(new Date(index.updated_at), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const license = t('footer.license', {
    odbl: link(ODBL, 'ODbL 1.0'),
    transitous: link(TRANSITOUS, 'Transitous'),
    sources: link(TRANSITOUS_SOURCES, t('footer.sources')),
    osm: link(OSM, '© OpenStreetMap'),
  });
  return `<footer class="mt-6 pt-3 border-t border-base-300 text-xs opacity-70 space-y-1">
    <p>${escapeHtml(t('footer.updated', { date: updated }))}</p>
    <p>${license} ${link(dataUrl('LICENSE'), t('footer.licenseFile'))}</p>
  </footer>`;
}

/** The panel's markup for the current state. */
export function renderPanel(s: PanelState): string {
  let body: string;
  switch (s.view.type) {
    case 'route':
      body = renderRoute(s, s.view.route_key);
      break;
    case 'station':
      body = renderStation(s, s.view.station_key);
      break;
    case 'stations':
      body = tabs('stations') + renderStationList(s);
      break;
    default:
      body = tabs('routes') + renderRouteList(s);
  }
  return body + renderFooter(s.index);
}
