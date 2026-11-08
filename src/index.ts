// Mounts the shell markup; must stay the first import.
import './shell';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  renderAutoZoomControl,
  syncAutoZoomControl,
  wireAutoZoomControl,
} from 'gtfs-zone-web-common/map/auto-zoom';
import {
  setHelpPages,
  showHelpModal,
  showHelpPageOnce,
} from 'gtfs-zone-web-common/ui/help-modal';
import {
  HELP_GROUP_ORDER,
  setHelpRuntimeData,
} from 'gtfs-zone-web-common/ui/help-pages';
import { notify } from 'gtfs-zone-web-common/ui/notification-system';
import {
  PanelResizer,
  restorePanelWidth,
} from 'gtfs-zone-web-common/ui/panel-resizer';
import { BottomSheetController } from 'gtfs-zone-web-common/ui/bottom-sheet';
import { ThemeController } from 'gtfs-zone-web-common/ui/theme-controller';
import {
  renderDockIcons,
  renderNavbarActions,
} from 'gtfs-zone-web-common/ui/navbar-actions';
import { CONFIG } from './config';
import {
  dataUrl,
  fetchIndex,
  fetchRoute,
  fetchStations,
  type DataIndex,
  type Station,
} from './data/artifacts';
import { t } from './i18n/messages';
import { MapController } from './map-controller';
import { renderBinPopup } from './modules/bin-popup';
import { pushHash, readHash, type View } from './modules/hash-state';
import { HELP_PAGES } from './modules/help-pages';
import { isMetric, type Metric } from './modules/metric';
import { wireMetricControl } from './modules/metric-control';
import { DOCK_ICONS, NAVBAR_ACTIONS } from './modules/navbar-action-list';
import { renderPanel, type PanelState } from './modules/panel-view';

// --- Shell -------------------------------------------------------------------

renderNavbarActions(document.getElementById('navbar-actions')!, NAVBAR_ACTIONS);
renderDockIcons(DOCK_ICONS);
document.title = t('app.title');

const appContainer = document.querySelector<HTMLElement>('.app-container')!;
restorePanelWidth(appContainer);
notify.initialize();
new ThemeController().initialize();

const mapCtrl = new MapController();
try {
  mapCtrl.initialize('map');
} catch (e) {
  console.error('[map] failed to initialize:', e);
  document.getElementById('map')!.innerHTML =
    `<div class="h-full flex items-center justify-center p-6 text-center text-sm opacity-70">${t('app.noWebgl')}</div>`;
}
new PanelResizer(appContainer, mapCtrl);

document.getElementById('auto-zoom-mount')!.innerHTML = renderAutoZoomControl();
syncAutoZoomControl(mapCtrl.isAutoZoomEnabled());
wireAutoZoomControl(mapCtrl.getAutoZoom());

const bottomSheet = new BottomSheetController(
  document.getElementById('right-panel')!,
  [
    { id: 'dock-browse' },
    { id: 'dock-help', snap: null, onSelect: () => void showHelpModal() },
  ]
);
bottomSheet.onSnapChange((covered) => mapCtrl.setBottomPadding(covered));

setHelpPages(HELP_PAGES, HELP_GROUP_ORDER);
setHelpRuntimeData({ version: __APP_VERSION__, shortcuts: [] });
document.getElementById('app-version')!.textContent = __APP_VERSION__;
document
  .getElementById('help-btn')!
  .addEventListener('click', () => void showHelpModal());

// --- State -------------------------------------------------------------------

function storedMetric(): Metric {
  try {
    const v = localStorage.getItem(CONFIG.METRIC_KEY);
    return isMetric(v) ? v : 'wifi';
  } catch {
    return 'wifi';
  }
}

const panel = document.getElementById('panel-content')!;
let state: PanelState | null = null;
/** Bumped per route load, so a slow response for an old route is dropped. */
let routeGen = 0;

function render(patch: Partial<PanelState> = {}): void {
  if (!state) {
    return;
  }
  state = { ...state, ...patch };
  panel.innerHTML = renderPanel(state);
}

async function loadRoute(route_key: string): Promise<void> {
  const gen = ++routeGen;
  render({ route: { status: 'loading' } });
  try {
    const route = await fetchRoute(route_key);
    if (gen === routeGen) {
      render({ route: { status: 'ready', route } });
    }
  } catch (err) {
    if (gen === routeGen) {
      const reason = err instanceof Error ? err.message : String(err);
      render({ route: { status: 'error', reason } });
    }
  }
}

/** Shows `view` in the panel and on the map. */
function show(view: View): void {
  if (!state) {
    return;
  }
  render({ view, selectedBin: null });
  mapCtrl.closePopup();
  if (view.type === 'route') {
    if (state.index.routes.some((r) => r.route_key === view.route_key)) {
      void loadRoute(view.route_key);
    }
    mapCtrl.focus({ type: 'route', route_key: view.route_key });
  } else if (view.type === 'station') {
    mapCtrl.focus({ type: 'station', station_key: view.station_key });
  } else {
    routeGen++;
    mapCtrl.focus({ type: 'home' });
  }
  panel.scrollTop = 0;
}

function navigate(view: View): void {
  pushHash(view);
  show(view);
}

window.addEventListener('popstate', () => show(readHash()));

function routeName(route_key: string): string {
  return (
    state?.index.routes.find((r) => r.route_key === route_key)?.name ??
    route_key
  );
}

function openBinPopup(
  props: Record<string, unknown>,
  at: Parameters<MapController['showPopup']>[0]
): void {
  mapCtrl.showPopup(at, renderBinPopup(props, routeName), (el) => {
    el.addEventListener('click', (e) => {
      const key = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-route-key]'
      )?.dataset.routeKey;
      if (key) {
        navigate({ type: 'route', route_key: key });
      }
    });
  });
}

mapCtrl.onBinClick = (props, at) => openBinPopup(props, at);
mapCtrl.onStationClick = (station_key) =>
  navigate({ type: 'station', station_key });

panel.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>(
    '[data-nav], [data-route-key], [data-station-key], [data-bin-id]'
  );
  if (!el) {
    return;
  }
  const { nav, routeKey, stationKey, binId } = el.dataset;
  if (nav === 'routes' || nav === 'stations') {
    navigate({ type: nav });
  } else if (routeKey) {
    navigate({ type: 'route', route_key: routeKey });
  } else if (stationKey) {
    navigate({ type: 'station', station_key: stationKey });
  } else if (binId) {
    render({ selectedBin: binId });
    const hit = mapCtrl.focusBin(binId);
    if (hit) {
      openBinPopup(hit.props, hit.at);
    }
  }
});

// --- Boot --------------------------------------------------------------------

async function boot(): Promise<void> {
  const metric = storedMetric();
  mapCtrl.setMetric(metric);
  wireMetricControl(metric, (next) => {
    try {
      localStorage.setItem(CONFIG.METRIC_KEY, next);
    } catch {
      // The choice just won't persist.
    }
    mapCtrl.setMetric(next);
    render({ metric: next });
  });

  let index: DataIndex;
  let stations: Station[];
  try {
    [index, { stations }] = await Promise.all([fetchIndex(), fetchStations()]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    notify.error(t('app.loadFailed', { reason }));
    panel.innerHTML = `<p class="text-sm text-error text-center py-8">${t('app.loadFailed', { reason })}</p>`;
    return;
  }
  state = {
    index,
    stations,
    view: { type: 'routes' },
    metric,
    route: null,
    selectedBin: null,
  };
  if (index.bin_count > 0) {
    mapCtrl.showBins(dataUrl('bins.pmtiles'));
  }
  mapCtrl.showStations(stations);
  show(readHash());
  await showHelpPageOnce('welcome', { continueLabel: t('help.welcome.start') });
}

void boot();
