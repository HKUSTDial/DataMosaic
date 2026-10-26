import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function dbMosaicDirectory(): Plugin {
  const rewrite = (request: { url?: string; method?: string }, base: string) => {
    if (request.method && request.method !== 'GET' && request.method !== 'HEAD') return;
    const prefix = base === '/' ? '' : base.replace(/\/$/, '');
    const [path, query] = (request.url ?? '').split('?');
    const route = path.startsWith(prefix) ? path.slice(prefix.length) : path;
    if (route !== '/dbmosaic' && route !== '/dbmosaic/') return;
    request.url = `${prefix}/dbmosaic/index.html${query ? `?${query}` : ''}`;
  };
  return {
    name: 'dbmosaic-directory',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        rewrite(request, server.config.base);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        rewrite(request, server.config.base);
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  const ontology = process.env.ONTOLOGY_URL || env.ONTOLOGY_URL || 'http://127.0.0.1:8011';
  return {
    plugins: [dbMosaicDirectory(), react()],
    server: {
      host: '127.0.0.1',
      proxy: { '/ontomosaic-text2sql/api/': ontology, '/ontology/api/': ontology },
    },
  };
});
