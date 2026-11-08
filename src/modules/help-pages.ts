/** The help pages: what exists, its grouping, and its copy. */

import { eyebrow, glyphList, lede } from 'gtfs-zone-web-common/ui/help-modal';
import type { AboutApp } from 'gtfs-zone-web-common/ui/about-links';
import {
  aboutPage,
  ICON_CHECK,
  ICON_LEG,
  ICON_MAP,
  type HelpPage,
} from 'gtfs-zone-web-common/ui/help-pages';
import { t } from '../i18n/messages';

const welcomePage: HelpPage = {
  id: 'welcome',
  label: t('help.welcome.label'),
  group: 'Getting Started',
  title: t('help.welcome.title'),
  showOnce: true,
  render: () =>
    [
      eyebrow('GTFS.zone'),
      lede(t('help.welcome.lede')),
      glyphList([
        {
          icon: ICON_MAP,
          term: t('help.welcome.map'),
          description: t('help.welcome.mapText'),
        },
        {
          icon: ICON_LEG,
          term: t('help.welcome.route'),
          description: t('help.welcome.routeText'),
        },
        {
          icon: ICON_CHECK,
          term: t('help.welcome.stations'),
          description: t('help.welcome.stationsText'),
        },
      ]),
    ].join(''),
};

const ABOUT_APP: AboutApp = {
  name: 'viz.wifi.gtfs.zone',
  blurb: [t('help.about.blurb'), t('help.about.blurb2')],
  contactSubject: t('help.about.subject'),
  repo: 'gtfs-zone-wifi-viz',
  sibling: {
    name: 'viz.rt.gtfs.zone',
    href: 'https://viz.rt.gtfs.zone',
    note: t('help.about.sibling'),
  },
};

export const HELP_PAGES: HelpPage[] = [welcomePage, aboutPage(ABOUT_APP)];
