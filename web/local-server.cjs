const http = require('node:http');
const { createReadStream, existsSync } = require('node:fs');
const { join } = require('node:path');
const { createRequire } = require('node:module');

const [root, docpilotDist, datamosaicBuild, portalBuild] = process.argv.slice(2);
if (!root || !docpilotDist || !datamosaicBuild || !portalBuild) {
  throw new Error('Usage: node local-server.cjs ROOT DOCPILOT_DIST DATAMOSAIC_BUILD PORTAL_BUILD');
}

const fromDataMosaic = createRequire(join(root, '.local/DataMosaic/frontend/package.json'));
const serveStatic = fromDataMosaic('serve-static');
const proxy = fromDataMosaic('http-proxy').createProxyServer({ changeOrigin: true, ws: true });
const sites = {
  '/analyze': { root: docpilotDist, serve: serveStatic(docpilotDist) },
  '/extract': { root: datamosaicBuild, serve: serveStatic(datamosaicBuild) },
  '': { root: portalBuild, serve: serveStatic(portalBuild) },
};
for (const site of Object.values(sites)) {
  if (!existsSync(join(site.root, 'index.html'))) {
    throw new Error(`Missing frontend build: ${site.root}`);
  }
}

proxy.on('error', (_error, _request, response) => {
  if (typeof response.writeHead === 'function' && !response.headersSent) {
    response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Backend unavailable');
  } else {
    response.destroy();
  }
});

function serve(site, prefix, request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  request.url = request.url.slice(prefix.length) || '/';
  site.serve(request, response, () => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    createReadStream(join(site.root, 'index.html')).on('error', () => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
    }).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/analyze' || pathname === '/extract') {
    response.writeHead(308, { Location: `${pathname}/${new URL(request.url, 'http://localhost').search}` }).end();
  } else if (pathname.startsWith('/analyze/api/') || pathname.startsWith('/analyze/uploads/')) {
    request.url = request.url.slice('/analyze'.length);
    proxy.web(request, response, { target: 'http://127.0.0.1:8008' });
  } else if (pathname.startsWith('/platform/api/')) {
    request.url = request.url.slice('/platform'.length);
    proxy.web(request, response, { target: 'http://127.0.0.1:8001' });
  } else if (pathname.startsWith('/api/')) {
    proxy.web(request, response, { target: 'http://127.0.0.1:5000' });
  } else if (pathname.startsWith('/analyze/')) {
    serve(sites['/analyze'], '/analyze', request, response);
  } else if (pathname.startsWith('/extract/')) {
    serve(sites['/extract'], '/extract', request, response);
  } else {
    serve(sites[''], '', request, response);
  }
});

server.on('upgrade', (request, socket, head) => {
  socket.on('error', () => socket.destroy());
  if (new URL(request.url, 'http://localhost').pathname !== '/extract/ws') {
    socket.destroy();
    return;
  }
  request.url = '/';
  proxy.ws(request, socket, head, { target: 'ws://127.0.0.1:8765' });
});

const host = process.env.DOCSENSA_WEB_BIND || '127.0.0.1';
const port = Number(process.env.DOCSENSA_WEB_PORT || 8080);
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`DocSensaAI: http://${host}:${port}`));
