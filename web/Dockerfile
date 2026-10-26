FROM node:20-alpine AS docpilot-ui
WORKDIR /app
COPY module/DocPilot/demo/chat/frontend/package*.json ./
RUN npm ci
COPY module/DocPilot/demo/chat/frontend/ ./
COPY web/patch-docpilot-api.mjs /tmp/patch-docpilot-api.mjs
RUN node /tmp/patch-docpilot-api.mjs /app/src/api.ts && npm run build -- --base=/docmosaic/

FROM node:20-alpine AS datamosaic-ui
WORKDIR /app
COPY module/DBMosaic/frontend/package*.json ./
RUN npm ci
COPY module/DBMosaic/frontend/ ./
ENV PUBLIC_URL=/dbmosaic REACT_APP_WEBSOCKET_URL=/dbmosaic/ws
RUN npm run build

FROM node:20-alpine AS portal-ui
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
COPY assets/ /assets/
RUN npm run build

FROM nginx:1.27-alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=portal-ui /app/dist/ /usr/share/nginx/html/
COPY --from=docpilot-ui /app/dist/ /usr/share/nginx/html/docmosaic/
# The portal build includes the DBMosaic product page at /dbmosaic/.
# The full deployment serves the engine UI at that same path.
RUN rm -rf /usr/share/nginx/html/dbmosaic
COPY --from=datamosaic-ui /app/build/ /usr/share/nginx/html/dbmosaic/
