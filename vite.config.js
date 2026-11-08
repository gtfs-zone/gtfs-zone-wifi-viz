import { defineConfig } from 'vite';
import { resolve } from 'path';
import { rmSync } from 'fs';
import { execSync } from 'child_process';

let version;
try {
  // Exactly on a tag: use the clean tag name (e.g. "0.3.1").
  version = execSync('git describe --tags --exact-match', { stdio: 'pipe' })
    .toString()
    .trim()
    .replace(/^v/, '');
} catch {
  try {
    // Between tags: tag + commit count + hash (e.g. "0.3.1-2-gabc1234").
    version = execSync('git describe --tags --long --always', { stdio: 'pipe' })
      .toString()
      .trim()
      .replace(/^v/, '');
  } catch {
    version = '0.0.0-development';
  }
}

/** Keeps public/fixtures (dev data) out of the built site. */
const dropFixtures = {
  name: 'drop-fixtures',
  apply: 'build',
  closeBundle() {
    rmSync(resolve(__dirname, 'dist/fixtures'), {
      recursive: true,
      force: true,
    });
  },
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  root: 'src',
  publicDir: '../public',
  envDir: '..',
  plugins: [dropFixtures],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
    },
  },
  server: {
    port: 8091,
    open: true,
    host: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      'gtfs-zone-web-common': resolve(
        __dirname,
        'node_modules/gtfs-zone-web-common/src'
      ),
    },
  },
  worker: {
    format: 'es',
  },
  test: {
    root: '.',
    include: ['tests/**/*.test.ts'],
  },
  optimizeDeps: {
    include: ['maplibre-gl', 'pmtiles'],
    // gtfs-zone-web-common ships raw .ts; let vite transform it as source
    exclude: ['gtfs-zone-web-common'],
  },
});
