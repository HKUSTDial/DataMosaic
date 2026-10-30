import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function productDirectories(): Plugin {
  const rewrite = (request: { url?: string; method?: string }, base: string, response: { writeHead: (status: number, headers: Record<string, string>) => unknown; end: () => unknown }) => {
    if (request.method && request.method !== 'GET' && request.method !== 'HEAD') return;
    const prefix = base === '/' ? '' : base.replace(/\/$/, '');
    const [path, query] = (request.url ?? '').split('?');
    const route = path.startsWith(prefix) ? path.slice(prefix.length) : path;
    const product = /^\/(dbmosaic|structmosaic)\/?$/.exec(route)?.[1];
    if (!product) return;
    if (route === '/structmosaic') {
      response.writeHead(308, { Location: `${prefix}/structmosaic/${query ? `?${query}` : ''}` });
      response.end();
      return true;
    }
    request.url = `${prefix}/${product}/index.html${query ? `?${query}` : ''}`;
  };
  return {
    name: 'product-directories',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (rewrite(request, server.config.base, _response)) return;
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (rewrite(request, server.config.base, _response)) return;
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  const ontology = process.env.ONTOLOGY_URL || env.ONTOLOGY_URL || 'http://127.0.0.1:8011';
  return {
    plugins: [productDirectories(), react()],
    server: {
      host: '127.0.0.1',
      proxy: { '/ontomosaic-text2sql/api/': ontology, '/ontology/api/': ontology },
    },
  };
});
