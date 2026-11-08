import type { Translation } from 'gtfs-zone-web-common/i18n/index';
import type { en } from './catalog.en';

/** viz.wifi.gtfs.zone's UI strings, in French. */
export const fr: Translation<typeof en> = {
  'app.title': 'viz.wifi.gtfs.zone - Wifi et réseau mobile dans les transports',
  'app.noWebgl':
    'La carte a besoin de WebGL, que ce navigateur a désactivé ou ne prend pas en charge.',
  'app.loadFailed': 'Impossible de charger les données wifi : {reason}',

  'shell.loading': 'Chargement des données',
  'shell.browse': 'Parcourir',
  'shell.help': 'Aide',

  'nav.theme': 'Changer de thème',
  'nav.guide': 'Guide',

  'metric.label': 'Colorer par',
  'metric.wifi': 'Wifi',
  'metric.latency': 'Latence',
  'metric.cell': 'Mobile',
  'metric.wifiLegend': 'Part des mesures avec un wifi fonctionnel',
  'metric.latencyLegend': 'Latence médiane des tests réseau (ms)',
  'metric.cellLegend': 'Niveau médian du signal mobile (0 à 4)',
  'metric.noData': 'aucune donnée',

  'tab.routes': 'Lignes',
  'tab.stations': 'Gares',

  'routes.empty': "Aucune ligne n'a encore de données publiées.",
  'routes.sessions_one': '{count} session',
  'routes.sessions_other': '{count} sessions',
  'routes.bins_one': '{count} segment',
  'routes.bins_other': '{count} segments',
  'route.back': 'Toutes les lignes',
  'route.failed': 'Impossible de charger cette ligne : {reason}',
  'route.unknown': 'Cette ligne ne figure pas dans les données publiées.',
  'route.length': '{km} km',
  'route.along': 'Le wifi le long du trajet',
  'route.alongHint':
    "Chaque segment fait environ 500 m et est placé selon sa distance le long de la ligne. Les trous n'ont pas de données publiées.",
  'route.bins': 'Segments',
  'route.reports': 'Signalements des voyageurs',
  'route.noReports': 'Aucun signalement.',
  'route.binRange': '{from} à {to} km',

  'stations.empty': "Aucune gare n'a encore de données publiées.",
  'station.back': 'Toutes les gares',
  'station.unknown': 'Cette gare ne figure pas dans les données publiées.',
  'station.checklist': 'Se connecter',
  'station.values': 'Mesures',

  'values.sessions': 'Sessions',
  'values.samples': 'Mesures',
  'values.wifiWorking': 'Wifi fonctionnel',
  'values.wifiConnected': 'Connecté au wifi',
  'values.rssi': 'RSSI wifi médian',
  'values.netTests': 'Tests réseau',
  'values.netSuccess': 'Tests réseau réussis',
  'values.latency': 'Latence médiane',
  'values.portalTests': 'Tests derrière un portail captif',
  'values.noCell': 'Mesures sans réseau mobile',
  'values.cellLevel': 'Niveau mobile médian',
  'values.cellTech': 'Mobile {tech}',
  'values.cellTechValue': '{samples} mesures, {dbm} dBm, niveau {level}',
  'values.routes': 'Lignes',
  'values.bin': 'Segment {id}',

  'report.outlets': 'Prises',
  'report.wifi': 'Wifi',
  'report.portal': 'Portail captif',
  'report.data_cap': 'Limite de données',
  'report.vpn_blocked': 'VPN bloqué',
  'answer.none': 'aucun',
  'answer.present': 'présentes',
  'answer.working': 'fonctionnelles',
  'answer.absent': 'absent',
  'answer.broken': 'en panne',
  'answer.works': 'fonctionne',
  'answer.click': 'clic',
  'answer.email': 'e-mail',
  'answer.account': 'compte',
  'answer.sms': 'SMS',
  'answer.password': 'mot de passe',
  'answer.paid': 'payant',
  'answer.true': 'oui',
  'answer.false': 'non',

  'checklist.needed_email': 'Adresse e-mail demandée',
  'checklist.needed_account': 'Compte complet demandé',
  'checklist.needed_sms': 'Code SMS demandé',
  'checklist.needed_checkbox': 'Case à cocher',
  'checklist.needed_password': 'Mot de passe demandé',
  'checklist.needed_payment': 'Paiement demandé',
  'checklist.could_not_connect': 'Connexion impossible',
  'checklist.counts': '{yes} oui, {no} non',

  'footer.updated': 'Données mises à jour le {date}.',
  'footer.license':
    'Données : contributeurs wifi.gtfs.zone, {odbl}. Tracés et arrêts via {transitous} et {sources}. Données cartographiques {osm}.',
  'footer.licenseFile': 'Fichier de licence',
  'footer.sources': 'ses sources GTFS',

  'help.welcome.label': 'Bienvenue',
  'help.welcome.start': 'C’est parti !',
  'help.welcome.title': 'Bienvenue sur viz.wifi.gtfs.zone',
  'help.welcome.lede':
    "Le wifi, le réseau mobile et les prises que les voyageurs ont réellement trouvés dans les transports, relevés avec l'application wifi.gtfs.zone.",
  'help.welcome.map': 'Carte',
  'help.welcome.mapText':
    'Chaque tronçon est un segment de 500 m environ le long de la voie. Colorez-le par wifi fonctionnel, latence ou niveau mobile, et cliquez pour le détail.',
  'help.welcome.route': 'Le wifi le long du trajet',
  'help.welcome.routeText':
    'Choisissez une ligne pour voir ses segments dans l’ordre, du premier arrêt au dernier.',
  'help.welcome.stations': 'Gares',
  'help.welcome.stationsText':
    "Ce qu'il a fallu pour se connecter en gare : e-mail, SMS, compte, paiement.",
  'help.about.blurb':
    'viz.wifi.gtfs.zone cartographie le jeu de données ouvert wifi.gtfs.zone sur la connectivité à bord et en gare, rattachée aux trajets GTFS.',
  'help.about.blurb2':
    "Les voyageurs enregistrent leurs trajets avec l'application Android ; les envois sont anonymes et les données publiées sont sous ODbL.",
  'help.about.subject': 'Retour sur viz.wifi.gtfs.zone',
  'help.about.sibling': 'les flux temps réel sur une carte',
};
