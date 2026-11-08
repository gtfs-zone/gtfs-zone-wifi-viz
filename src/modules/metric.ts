/** The values the map and route strip colour by, and their colour scales. */

import type { ExpressionSpecification } from 'maplibre-gl';
import type { Measures } from '../data/artifacts';

export type Metric = 'wifi' | 'latency' | 'cell';

export const METRICS: Metric[] = ['wifi', 'latency', 'cell'];

type MetricProp =
  'wifi_working_share' | 'latency_ms_median' | 'cell_level_0_4_median';

interface MetricDef {
  prop: MetricProp;
  /** Value and colour pairs, ascending by value. */
  stops: [number, string][];
}

const GOOD = '#16a34a';
const FAIR = '#eab308';
const BAD = '#dc2626';
export const NO_DATA = '#9ca3af';

export const METRIC_DEFS: Record<Metric, MetricDef> = {
  wifi: {
    prop: 'wifi_working_share',
    stops: [
      [0, BAD],
      [0.5, FAIR],
      [1, GOOD],
    ],
  },
  latency: {
    prop: 'latency_ms_median',
    stops: [
      [100, GOOD],
      [400, FAIR],
      [1000, BAD],
    ],
  },
  cell: {
    prop: 'cell_level_0_4_median',
    stops: [
      [0, BAD],
      [2, FAIR],
      [4, GOOD],
    ],
  },
};

export function isMetric(v: unknown): v is Metric {
  return METRICS.includes(v as Metric);
}

export function metricValue(
  m: Metric,
  values: Partial<Measures>
): number | null {
  const v = values[METRIC_DEFS[m].prop];
  return typeof v === 'number' ? v : null;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb: number[]): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** The colour of a value: linear between stops, clamped at the ends. */
export function metricColor(m: Metric, value: number | null): string {
  if (value === null) {
    return NO_DATA;
  }
  const stops = METRIC_DEFS[m].stops;
  if (value <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i];
    if (value <= v1) {
      const [v0, c0] = stops[i - 1];
      const f = (value - v0) / (v1 - v0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return rgbToHex(a.map((x, k) => x + (b[k] - x) * f));
    }
  }
  return stops[stops.length - 1][1];
}

/** The same scale as a MapLibre expression over a feature's properties. */
export function metricColorExpression(m: Metric): ExpressionSpecification {
  const { prop, stops } = METRIC_DEFS[m];
  return [
    'case',
    ['has', prop],
    [
      'interpolate',
      ['linear'],
      ['to-number', ['get', prop]],
      ...stops.flat(),
    ] as unknown as ExpressionSpecification,
    NO_DATA,
  ];
}
