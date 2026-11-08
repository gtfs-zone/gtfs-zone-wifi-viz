import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DataIndex, RouteFile, StationsFile } from '../src/data/artifacts';

const DIR = resolve(__dirname, '../public/fixtures');

function read<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(DIR, path), 'utf8')) as T;
}

export const index = read<DataIndex>('index.json');
export const stations = read<StationsFile>('stations.json');
/** Read by object key: the `%` in the key is part of the file name. */
export const route = (route_key: string): RouteFile =>
  read<RouteFile>(`routes/${route_key}.json`);
