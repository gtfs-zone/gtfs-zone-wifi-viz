import { describe, expect, it, vi } from 'vitest';
import { dataUrl, routePath } from '../src/data/artifacts';
import { binFromProps } from '../src/modules/bin-popup';
import { hashFor, readHash } from '../src/modules/hash-state';
import { stripLayout } from '../src/modules/route-strip';
import { index, route } from './fixtures';

describe('artifact paths', () => {
  it('encodes the route key once more for the object key', () => {
    expect(routePath('de-DELFI_de%3AVBB%3A1')).toBe(
      'routes/de-DELFI_de%253AVBB%253A1.json'
    );
  });

  it('resolves relative and absolute data URLs', () => {
    vi.stubGlobal('location', new URL('http://localhost:8091/#stations'));
    expect(dataUrl('index.json', 'https://data.wifi.gtfs.zone')).toBe(
      'https://data.wifi.gtfs.zone/index.json'
    );
    expect(dataUrl('index.json', '/fixtures')).toBe(
      'http://localhost:8091/fixtures/index.json'
    );
    vi.unstubAllGlobals();
  });
});

describe('hash state', () => {
  it('round-trips each view', () => {
    const key = index.routes[0].route_key;
    for (const view of [
      { type: 'routes' } as const,
      { type: 'stations' } as const,
      { type: 'route', route_key: key } as const,
      { type: 'station', station_key: 'de-DELFI_de:11000:900003201' } as const,
    ]) {
      expect(readHash(hashFor(view))).toEqual(view);
    }
  });
});

describe('route strip', () => {
  it('places every bin and stop of a fixture route inside the strip', () => {
    for (const r of index.routes) {
      const file = route(r.route_key);
      const { segments, stops } = stripLayout(file, 'wifi');
      expect(segments).toHaveLength(r.bin_count);
      for (const s of segments) {
        expect(s.left).toBeGreaterThanOrEqual(0);
        expect(s.width).toBeGreaterThan(0);
        expect(s.left + s.width).toBeLessThanOrEqual(100.0001);
      }
      expect(stops[0].left).toBe(0);
      expect(stops[stops.length - 1].left).toBe(100);
    }
  });
});

describe('bin tile properties', () => {
  it('parses the JSON string and list properties', () => {
    const bin = binFromProps({
      bin_id: '0.1.2',
      routes: 'a,b',
      session_count: 2,
      samples: 5,
      wifi_working_share: 0.5,
      cell: '{"lte":{"samples":5,"level_dbm_median":-90,"level_0_4_median":3}}',
      reports: '{"outlets":{"working":1}}',
    });
    expect(bin.routes).toEqual(['a', 'b']);
    expect(bin.measures.cell.lte.samples).toBe(5);
    expect(bin.measures.latency_ms_median).toBeNull();
    expect(bin.reports.outlets.working).toBe(1);
  });
});
