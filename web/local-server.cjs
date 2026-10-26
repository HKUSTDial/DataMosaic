const http = require('node:http');
const { createReadStream, existsSync } = require('node:fs');
const { join } = require('node:path');
const { createRequire } = require('node:module');

const [root, docpilotDist, datamosaicBuild, portalBuild] = process.argv.slice(2);
if (!root || !docpilotDist || !datamosaicBuild || !portalBuild) {
  throw new Error('Usage: node local-server.cjs ROOT DOCPILOT_DIST DBMOSAIC_BUILD PORTAL_BUILD');
}

const fromDBMosaic = createRequire(join(root, 'module/DBMosaic/frontend/package.json'));
const serveStatic = fromDBMosaic('serve-static');
const proxy = fromDBMosaic('http-proxy').createProxyServer({ changeOrigin: true, ws: true });
const sites = {
  '/docmosaic': { root: docpilotDist, serve: serveStatic(docpilotDist) },
  '/dbmosaic': { root: datamosaicBuild, serve: serveStatic(datamosaicBuild) },
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
  if (pathname === '/docmosaic' || pathname === '/dbmosaic') {
    response.writeHead(308, { Location: `${pathname}/${new URL(request.url, 'http://localhost').search}` }).end();
  } else if (/^\/(docmosaic|analyze)\/(api|uploads)\//.test(pathname)) {
    request.url = request.url.replace(/^\/(docmosaic|analyze)/, '');
    proxy.web(request, response, { target: 'http://127.0.0.1:8008' });
  } else if (pathname.startsWith('/ontomosaic-text2sql/api/') || pathname.startsWith('/ontology/api/')) {
    proxy.web(request, response, { target: process.env.ONTOLOGY_URL || 'http://127.0.0.1:8011' });
  } else if (pathname.startsWith('/platform/api/')) {
    request.url = request.url.slice('/platform'.length);
    proxy.web(request, response, { target: 'http://127.0.0.1:8001' });
  } else if (pathname.startsWith('/dbmosaic/api/') || pathname.startsWith('/api/')) {
    if (pathname.startsWith('/dbmosaic/')) request.url = request.url.slice('/dbmosaic'.length);
    proxy.web(request, response, { target: 'http://127.0.0.1:5000' });
  } else if (pathname === '/analyze' || pathname.startsWith('/analyze/')) {
    response.writeHead(308, { Location: `/docmosaic${pathname.slice('/analyze'.length) || '/'}${new URL(request.url, 'http://localhost').search}` }).end();
  } else if (pathname === '/extract' || pathname.startsWith('/extract/')) {
    response.writeHead(308, { Location: `/dbmosaic${pathname.slice('/extract'.length) || '/'}${new URL(request.url, 'http://localhost').search}` }).end();
  } else if (pathname.startsWith('/docmosaic/')) {
    serve(sites['/docmosaic'], '/docmosaic', request, response);
  } else if (pathname.startsWith('/dbmosaic/')) {
    serve(sites['/dbmosaic'], '/dbmosaic', request, response);
  } else {
    serve(sites[''], '', request, response);
  }
});

server.on('upgrade', (request, socket, head) => {
  socket.on('error', () => socket.destroy());
  if (!['/dbmosaic/ws', '/extract/ws'].includes(new URL(request.url, 'http://localhost').pathname)) {
    socket.destroy();
    return;
  }
  request.url = '/';
  proxy.ws(request, socket, head, { target: 'ws://127.0.0.1:8765' });
});

const host = process.env.DATAMOSAIC_WEB_BIND || '127.0.0.1';
const port = Number(process.env.DATAMOSAIC_WEB_PORT || 8080);
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`DataMosaic: http://${host}:${port}`));
