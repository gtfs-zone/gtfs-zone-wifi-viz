/** The map's metric picker and its legend. */

import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import { t } from '../i18n/messages';
import {
  METRIC_DEFS,
  METRICS,
  NO_DATA,
  metricColor,
  type Metric,
} from './metric';

const LABEL: Record<Metric, Parameters<typeof t>[0]> = {
  wifi: 'metric.wifi',
  latency: 'metric.latency',
  cell: 'metric.cell',
};

const LEGEND: Record<Metric, Parameters<typeof t>[0]> = {
  wifi: 'metric.wifiLegend',
  latency: 'metric.latencyLegend',
  cell: 'metric.cellLegend',
};

function tickLabel(m: Metric, v: number): string {
  return m === 'wifi' ? `${Math.round(v * 100)}%` : String(v);
}

function renderLegend(m: Metric): string {
  const stops = METRIC_DEFS[m].stops;
  const lo = stops[0][0];
  const hi = stops[stops.length - 1][0];
  const gradient = Array.from({ length: 11 }, (_, i) =>
    metricColor(m, lo + ((hi - lo) * i) / 10)
  ).join(',');
  return `<div class="text-xs opacity-80 mb-1">${escapeHtml(t(LEGEND[m]))}</div>
    <div class="h-2 rounded" style="background:linear-gradient(to right,${gradient})"></div>
    <div class="flex justify-between text-[10px] tabular-nums opacity-70">${stops
      .map(([v]) => `<span>${tickLabel(m, v)}</span>`)
      .join('')}</div>
    <div class="flex items-center gap-1 text-[10px] opacity-70"><span class="inline-block w-3 h-2 rounded-sm" style="background:${NO_DATA}"></span>${escapeHtml(t('metric.noData'))}</div>`;
}

export function renderMetricControl(): string {
  const buttons = METRICS.map(
    (m) =>
      `<input class="join-item btn btn-xs" type="radio" name="metric" value="${m}" aria-label="${escapeHtml(t(LABEL[m]))}" />`
  ).join('');
  return `<div class="card card-bordered bg-base-100 shadow-lg p-2 pointer-events-auto w-56">
    <div class="join w-full" role="radiogroup" aria-label="${escapeHtml(t('metric.label'))}">${buttons}</div>
    <div id="metric-legend" class="mt-2"></div>
  </div>`;
}

/** Checks `metric` and draws its legend; `onChange` fires on a pick. */
export function wireMetricControl(
  metric: Metric,
  onChange: (m: Metric) => void
): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="metric"]'
  );
  const legend = document.getElementById('metric-legend')!;
  const sync = (m: Metric) => {
    inputs.forEach((i) => (i.checked = i.value === m));
    legend.innerHTML = renderLegend(m);
  };
  sync(metric);
  inputs.forEach((i) =>
    i.addEventListener('change', () => {
      const m = i.value as Metric;
      sync(m);
      onChange(m);
    })
  );
}
