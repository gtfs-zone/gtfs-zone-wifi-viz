/** Renders a bin's or station's values: measures, cell per technology and reports. */

import { formatNumber } from 'gtfs-zone-web-common/i18n/fmt';
import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import type { CellValues, Measures, ReportCounts } from '../data/artifacts';
import { en } from '../i18n/catalog.en';
import { t } from '../i18n/messages';

type Key = Parameters<typeof t>[0];

const DASH = '-';

function pct(v: number | null): string {
  return v === null ? DASH : formatNumber(v, { style: 'percent' });
}

function num(v: number | null, unit = ''): string {
  return v === null
    ? DASH
    : `${formatNumber(v, { maximumFractionDigits: 1 })}${unit}`;
}

/** A label from the catalog when it has one, else the raw value. */
function label(prefix: string, value: string): string {
  const key = `${prefix}.${value}`;
  return key in en ? t(key as Key) : value;
}

function row(name: string, value: string): string {
  return `<tr><th class="font-normal opacity-70 pr-3">${escapeHtml(name)}</th><td class="text-right tabular-nums">${escapeHtml(value)}</td></tr>`;
}

function table(rows: string[]): string {
  return `<table class="table table-xs w-full"><tbody>${rows.join('')}</tbody></table>`;
}

function cellRows(cell: Record<string, CellValues>): string[] {
  return Object.entries(cell).map(([tech, c]) =>
    row(
      t('values.cellTech', { tech: tech.toUpperCase() }),
      t('values.cellTechValue', {
        samples: c.samples,
        dbm: num(c.level_dbm_median),
        level: num(c.level_0_4_median),
      })
    )
  );
}

/** The measure rows of a bin or station. */
export function renderMeasures(m: Measures): string {
  return table([
    row(t('values.sessions'), String(m.session_count)),
    row(t('values.samples'), String(m.samples)),
    row(t('values.wifiWorking'), pct(m.wifi_working_share)),
    row(t('values.wifiConnected'), pct(m.wifi_connected_share)),
    row(t('values.rssi'), num(m.wifi_rssi_median, ' dBm')),
    row(t('values.netTests'), String(m.net_tests)),
    row(t('values.netSuccess'), pct(m.net_test_success_rate)),
    row(t('values.latency'), num(m.latency_ms_median, ' ms')),
    row(t('values.portalTests'), String(m.captive_portal_tests)),
    row(t('values.cellLevel'), num(m.cell_level_0_4_median)),
    ...cellRows(m.cell),
    row(t('values.noCell'), String(m.no_cell_samples)),
  ]);
}

/** Report answers per field, e.g. "Outlets: working 2, none 1". */
export function renderReports(reports: ReportCounts): string {
  const rows = Object.entries(reports)
    .filter(([, answers]) => Object.keys(answers).length > 0)
    .map(([field, answers]) =>
      row(
        label('report', field),
        Object.entries(answers)
          .sort((a, b) => b[1] - a[1])
          .map(([answer, n]) => `${label('answer', answer)} ${n}`)
          .join(', ')
      )
    );
  return rows.length
    ? table(rows)
    : `<p class="text-sm opacity-60">${escapeHtml(t('route.noReports'))}</p>`;
}

/** The station checklist as yes and no counts per item. */
export function renderChecklist(
  checklist: Record<string, { yes: number; no: number }>
): string {
  return table(
    Object.entries(checklist).map(([item, c]) =>
      row(label('checklist', item), t('checklist.counts', c))
    )
  );
}

export const formatPercent = pct;
