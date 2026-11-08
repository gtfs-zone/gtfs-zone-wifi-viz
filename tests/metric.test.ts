import { describe, expect, it } from 'vitest';
import {
  METRIC_DEFS,
  METRICS,
  NO_DATA,
  metricColor,
  metricColorExpression,
  metricValue,
} from '../src/modules/metric';
import { stations } from './fixtures';

describe('metricColor', () => {
  it('hits each stop exactly and clamps outside', () => {
    for (const m of METRICS) {
      const stops = METRIC_DEFS[m].stops;
      for (const [v, c] of stops) {
        expect(metricColor(m, v)).toBe(c);
      }
      expect(metricColor(m, stops[0][0] - 1000)).toBe(stops[0][1]);
      expect(metricColor(m, stops[stops.length - 1][0] + 1000)).toBe(
        stops[stops.length - 1][1]
      );
    }
  });

  it('interpolates between stops', () => {
    // Halfway from #dc2626 to #eab308.
    expect(metricColor('wifi', 0.25)).toBe('#e36d17');
  });

  it('greys out missing values', () => {
    expect(metricColor('latency', null)).toBe(NO_DATA);
    expect(metricValue('latency', { latency_ms_median: null })).toBeNull();
  });

  it('reads the flat cell level the pipeline publishes', () => {
    expect(metricValue('cell', stations.stations[0])).toBe(4);
  });

  it('builds a case expression over the same property and stops', () => {
    const expr = metricColorExpression('wifi');
    expect(expr[0]).toBe('case');
    expect(expr[1]).toEqual(['has', 'wifi_working_share']);
    expect(JSON.stringify(expr)).toContain('"#16a34a"');
    expect(expr[3]).toBe(NO_DATA);
  });
});
