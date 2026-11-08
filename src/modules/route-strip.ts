/**
 * The "wifi along this trip" strip: the route's bins as coloured segments
 * placed by distance along its longest shape, with the stops marked.
 */

import { formatNumber } from 'gtfs-zone-web-common/i18n/fmt';
import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import type { RouteFile } from '../data/artifacts';
import { t } from '../i18n/messages';
import { metricColor, metricValue, type Metric } from './metric';

export interface StripSegment {
  bin_id: string;
  /** Left edge and width, in percent of the route length. */
  left: number;
  width: number;
  color: string;
}

export interface StripStop {
  name: string;
  left: number;
}

function percent(m: number, length: number): number {
  return length > 0 ? Math.min(100, Math.max(0, (m / length) * 100)) : 0;
}

/** Segment and stop positions, in percent; pure for testing. */
export function stripLayout(
  route: RouteFile,
  metric: Metric
): { segments: StripSegment[]; stops: StripStop[] } {
  const length = route.length_m;
  return {
    segments: route.bins.map((b) => {
      const left = percent(b.from_m, length);
      return {
        bin_id: b.bin_id,
        left,
        width: percent(b.to_m, length) - left,
        color: metricColor(metric, metricValue(metric, b)),
      };
    }),
    stops: route.stops.map((s) => ({
      name: s.name,
      left: percent(s.m, length),
    })),
  };
}

function km(m: number): string {
  return formatNumber(m / 1000, { maximumFractionDigits: 1 });
}

export function renderRouteStrip(route: RouteFile, metric: Metric): string {
  const { segments, stops } = stripLayout(route, metric);
  const bins = new Map(route.bins.map((b) => [b.bin_id, b]));
  const segs = segments
    .map((s) => {
      const b = bins.get(s.bin_id)!;
      const title = t('route.binRange', { from: km(b.from_m), to: km(b.to_m) });
      return `<button class="absolute inset-y-0 hover:brightness-110 focus:outline-2" style="left:${s.left}%;width:max(${s.width}%,2px);background:${s.color}" title="${escapeHtml(title)}" data-bin-id="${escapeHtml(s.bin_id)}"></button>`;
    })
    .join('');
  const ticks = stops
    .map(
      (s) =>
        `<div class="absolute -top-1 -bottom-1 w-0.5 bg-base-content" style="left:${s.left}%" title="${escapeHtml(s.name)}"></div>`
    )
    .join('');
  // Stop names in a list below, since they would overlap on the bar.
  const names = route.stops
    .map(
      (s) =>
        `<li class="flex justify-between gap-2"><span class="truncate">${escapeHtml(s.name)}</span><span class="tabular-nums opacity-60">${km(s.m)} km</span></li>`
    )
    .join('');
  return `<div class="relative h-6 my-3 rounded bg-base-300">${segs}${ticks}</div>
    <ol class="text-xs space-y-0.5">${names}</ol>`;
}
