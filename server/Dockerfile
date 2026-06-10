# Build context is the repo root (see docker-compose: dockerfile server/Dockerfile)
# so we can install the Python deps from the shared requirements.txt — the API
# bundles a Python runtime to run scripts/epub_cli.py as a subprocess (M3).

# --- build stage: compile TypeScript ---
FROM node:20-slim AS build
WORKDIR /app
COPY server/package.json ./
RUN npm install
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

# --- runtime stage: Node + Python ---
FROM node:20-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps for the EPUB generator (scripts/ is bind-mounted at runtime).
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Node production deps + compiled output.
COPY server/package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
