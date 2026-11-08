/**
 * Mounts the shared app shell. Imported first by `index.ts`, so the markup
 * exists before any other module looks up an element id.
 */

import { mountAppShell } from 'gtfs-zone-web-common/ui/app-shell';
import { t } from './i18n/messages';
import { renderMetricControl } from './modules/metric-control';

mountAppShell({
  brandPrefix: 'viz',
  brandSuffix: '.wifi.gtfs.zone',
  mapControlsExtra: renderMetricControl(),
  panelPlaceholder: t('shell.loading'),
  dock: [
    { id: 'dock-browse', label: t('shell.browse'), active: true },
    { id: 'dock-help', label: t('shell.help') },
  ],
});

// There is no feed to search; the metric control takes its place.
document.getElementById('map-search-card')?.classList.add('hidden');
