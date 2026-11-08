/** The panel view in the URL hash: `#route=<key>`, `#station=<key>` or `#stations`. */

export type View =
  | { type: 'routes' }
  | { type: 'stations' }
  | { type: 'route'; route_key: string }
  | { type: 'station'; station_key: string };

export function readHash(hash: string = location.hash): View {
  const params = new URLSearchParams(hash.slice(1));
  const route = params.get('route');
  if (route) {
    return { type: 'route', route_key: route };
  }
  const station = params.get('station');
  if (station) {
    return { type: 'station', station_key: station };
  }
  return params.has('stations') ? { type: 'stations' } : { type: 'routes' };
}

export function hashFor(view: View): string {
  switch (view.type) {
    case 'route':
      return `#${new URLSearchParams({ route: view.route_key })}`;
    case 'station':
      return `#${new URLSearchParams({ station: view.station_key })}`;
    case 'stations':
      return '#stations';
    default:
      return '';
  }
}

/** Adds a history entry, so the browser's back button returns to the last view. */
export function pushHash(view: View): void {
  history.pushState(
    null,
    '',
    `${location.pathname}${location.search}${hashFor(view)}`
  );
}
