# Build context is ./web-ui (see docker-compose frontend.build.context).

# --- build stage: produce the static SPA bundle ---
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage: nginx serving the bundle + proxying /api ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
