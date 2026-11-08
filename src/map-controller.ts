import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import * as maplibregl from 'maplibre-gl';
import { Protocol, PMTiles } from 'pmtiles';
import type { MapFocusTarget } from 'gtfs-zone-web-common/map/layer-manager';
import { RtMapController } from 'gtfs-zone-web-common/map/rt-map-controller';
import { CONFIG } from './config';
import type { Station } from './data/artifacts';
import { metricColorExpression, type Metric } from './modules/metric';

/** What the map highlights: nothing, a route's bins or a station. */
export type MapFocus =
  | { type: 'home' }
  | { type: 'route'; route_key: string }
  | { type: 'station'; station_key: string };

const BINS = 'wifi-bins';
const BINS_LINE = 'wifi-bins-line';
const BINS_CASING = 'wifi-bins-casing';
const STATIONS = 'wifi-stations';
const STATIONS_CIRCLE = 'wifi-stations-circle';

const ATTRIBUTION = [
  '<a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a> wifi.gtfs.zone contributors',
  '<a href="https://transitous.org/sources/" target="_blank" rel="noopener noreferrer">Transitous sources</a>',
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">&copy; OpenStreetMap</a>',
].join(', ');

const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

/** Comma-joined route keys hold `key` as a whole item. */
function routeMatch(route_key: string): maplibregl.ExpressionSpecification {
  return ['in', `,${route_key},`, ['concat', ',', ['get', 'routes'], ',']];
}

function hasStoredView(): boolean {
  try {
    return localStorage.getItem(CONFIG.MAP_VIEW_KEY) !== null;
  } catch {
    return false;
  }
}

/** The bins from bins.pmtiles and the stations, on the shared shell map. */
export class MapController extends RtMapController<MapFocus> {
  private metric: Metric = 'wifi';
  private binsUrl: string | null = null;
  private stations: Station[] = [];
  private focused: MapFocus = { type: 'home' };
  private popup: maplibregl.Popup | null = null;

  /** Bin clicked: its tile properties and where. */
  onBinClick:
    ((props: Record<string, unknown>, at: maplibregl.LngLat) => void) | null =
    null;
  onStationClick: ((station_key: string) => void) | null = null;

  constructor() {
    super(
      {
        viewKey: CONFIG.MAP_VIEW_KEY,
        appearanceKey: CONFIG.MAP_APPEARANCE_KEY,
        workerUrl: maplibreWorkerUrl,
      },
      { type: 'home' }
    );
  }

  override initialize(container: string): void {
    super.initialize(container);
    const pointer = (on: boolean) => () => {
      this.map.getCanvas().style.cursor = on ? 'pointer' : '';
    };
    for (const layer of [BINS_LINE, STATIONS_CIRCLE]) {
      this.map.on('mouseenter', layer, pointer(true));
      this.map.on('mouseleave', layer, pointer(false));
    }
    this.map.on('click', STATIONS_CIRCLE, (e) => {
      const key = e.features?.[0]?.properties?.station_key;
      if (typeof key === 'string') {
        this.onStationClick?.(key);
      }
    });
    this.map.on('click', BINS_LINE, (e) => {
      // A station on top of the bin wins.
      if (
        this.map.queryRenderedFeatures(e.point, { layers: [STATIONS_CIRCLE] })
          .length
      ) {
        return;
      }
      const f = e.features?.[0];
      if (f) {
        this.onBinClick?.(f.properties, e.lngLat);
      }
    });
  }

  /** The bins layer; fits the data the first time when no view is stored. */
  showBins(url: string): void {
    this.binsUrl = `pmtiles://${url}`;
    const archive = new PMTiles(url);
    protocol.add(archive);
    this.whenLoaded(() => this.addBins());
    if (!hasStoredView()) {
      void archive.getHeader().then((h) => {
        this.whenLoaded(() =>
          this.fitFocusBounds([
            [h.minLon, h.minLat],
            [h.maxLon, h.maxLat],
          ])
        );
      });
    }
  }

  showStations(stations: Station[]): void {
    this.stations = stations;
    this.whenLoaded(() => this.addStations());
  }

  setMetric(metric: Metric): void {
    this.metric = metric;
    this.whenLoaded(() => {
      const color = metricColorExpression(metric);
      if (this.map.getLayer(BINS_LINE)) {
        this.map.setPaintProperty(BINS_LINE, 'line-color', color);
      }
      if (this.map.getLayer(STATIONS_CIRCLE)) {
        this.map.setPaintProperty(STATIONS_CIRCLE, 'circle-color', color);
      }
    });
  }

  /** Opens a popup; links in it are wired by the caller through `onOpen`. */
  showPopup(
    at: maplibregl.LngLatLike,
    html: string,
    onOpen: (el: HTMLElement) => void
  ): void {
    this.popup?.remove();
    this.popup = new maplibregl.Popup({ maxWidth: '20rem' })
      .setLngLat(at)
      .setHTML(html)
      .addTo(this.map);
    onOpen(this.popup.getElement());
  }

  closePopup(): void {
    this.popup?.remove();
    this.popup = null;
  }

  /** Frames one bin by id, if its tile is loaded, and returns its properties and centre. */
  focusBin(
    bin_id: string
  ): { props: Record<string, unknown>; at: maplibregl.LngLat } | null {
    const features = this.map.querySourceFeatures(BINS, {
      sourceLayer: 'bins',
      filter: ['==', ['get', 'bin_id'], bin_id],
    });
    const bounds = this.boundsOf(features);
    if (!bounds) {
      return null;
    }
    this.fitFocusBounds(
      bounds.toArray() as [[number, number], [number, number]]
    );
    return { props: features[0].properties, at: bounds.getCenter() };
  }

  protected targetState(_target: MapFocusTarget): MapFocus | null {
    // No GTFS feed is loaded, so LayerManager has nothing to select.
    return null;
  }

  protected applyFocus(state: MapFocus): void {
    this.focused = state;
    this.applyHighlight();
    if (state.type === 'route') {
      this.fitRoute(state.route_key, true);
    } else if (state.type === 'station') {
      const s = this.stations.find((x) => x.station_key === state.station_key);
      if (s) {
        const d = 0.004;
        this.fitFocusBounds([
          [s.lon - d, s.lat - d],
          [s.lon + d, s.lat + d],
        ]);
      }
    }
  }

  /** Frames the route's loaded bins; with none loaded yet, tries once more when the map is idle. */
  private fitRoute(route_key: string, retry: boolean): void {
    const bounds = this.boundsOf(
      this.map.querySourceFeatures(BINS, {
        sourceLayer: 'bins',
        filter: routeMatch(route_key),
      })
    );
    if (bounds) {
      this.fitFocusBounds(
        bounds.toArray() as [[number, number], [number, number]]
      );
    } else if (retry) {
      this.map.once('idle', () => {
        const f = this.focused;
        if (f.type === 'route' && f.route_key === route_key) {
          this.fitRoute(route_key, false);
        }
      });
    }
  }

  protected override onStyleRebuilt(): void {
    this.addBins();
    this.addStations();
  }

  private boundsOf(
    features: { geometry: GeoJSON.Geometry }[]
  ): maplibregl.LngLatBounds | null {
    const bounds = new maplibregl.LngLatBounds();
    for (const f of features) {
      if (f.geometry.type === 'LineString') {
        for (const c of f.geometry.coordinates) {
          bounds.extend(c as [number, number]);
        }
      } else if (f.geometry.type === 'MultiLineString') {
        for (const line of f.geometry.coordinates) {
          for (const c of line) {
            bounds.extend(c as [number, number]);
          }
        }
      }
    }
    return bounds.isEmpty() ? null : bounds;
  }

  /** Dims the bins and stations outside the focused route or station. */
  private applyHighlight(): void {
    const f = this.focused;
    if (this.map.getLayer(BINS_LINE)) {
      const opacity: maplibregl.ExpressionSpecification | number =
        f.type === 'route' ? ['case', routeMatch(f.route_key), 1, 0.25] : 1;
      this.map.setPaintProperty(BINS_LINE, 'line-opacity', opacity);
      this.map.setPaintProperty(BINS_CASING, 'line-opacity', opacity);
    }
    if (this.map.getLayer(STATIONS_CIRCLE)) {
      this.map.setPaintProperty(
        STATIONS_CIRCLE,
        'circle-stroke-width',
        f.type === 'station'
          ? ['case', ['==', ['get', 'station_key'], f.station_key], 4, 1.5]
          : 1.5
      );
    }
  }

  private addBins(): void {
    if (!this.binsUrl || this.map.getSource(BINS)) {
      return;
    }
    this.map.addSource(BINS, {
      type: 'vector',
      url: this.binsUrl,
      attribution: ATTRIBUTION,
    });
    const width: maplibregl.ExpressionSpecification = [
      'interpolate',
      ['linear'],
      ['zoom'],
      5,
      2,
      12,
      5,
      16,
      10,
    ];
    this.map.addLayer({
      id: BINS_CASING,
      type: 'line',
      source: BINS,
      'source-layer': 'bins',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#1f2937',
        'line-width': ['+', width, 2],
      },
    });
    this.map.addLayer({
      id: BINS_LINE,
      type: 'line',
      source: BINS,
      'source-layer': 'bins',
      layout: { 'line-cap': 'butt', 'line-join': 'round' },
      paint: {
        'line-color': metricColorExpression(this.metric),
        'line-width': width,
      },
    });
    // Stations draw over the bins once both exist.
    if (this.map.getLayer(STATIONS_CIRCLE)) {
      this.map.moveLayer(STATIONS_CIRCLE);
    }
    this.applyHighlight();
  }

  private addStations(): void {
    if (!this.stations.length || this.map.getSource(STATIONS)) {
      return;
    }
    this.map.addSource(STATIONS, {
      type: 'geojson',
      attribution: ATTRIBUTION,
      data: {
        type: 'FeatureCollection',
        features: this.stations.map((s) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
          properties: {
            station_key: s.station_key,
            name: s.name,
            ...Object.fromEntries(
              Object.entries(s).filter(([, v]) => typeof v === 'number')
            ),
          },
        })),
      },
    });
    this.map.addLayer({
      id: STATIONS_CIRCLE,
      type: 'circle',
      source: STATIONS,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 14, 9],
        'circle-color': metricColorExpression(this.metric),
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    });
    this.applyHighlight();
  }
}
