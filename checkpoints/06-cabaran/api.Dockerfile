# Image API: json-server, dengan data dalam folder /data (volume dalam compose.yaml).
FROM node:22-alpine
WORKDIR /app

# Install json-server sahaja ("dependencies"). Vue, Vite dan lain-lain hanya untuk build web.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Data permulaan. Kali pertama, Docker menyalin fail ini ke dalam volume "data".
RUN mkdir /data && chown node:node /data
COPY --chown=node:node db.seed.json /data/db.json

# Jangan jalankan sebagai root (admin)
USER node

# Docker menyemak setiap 10 saat: adakah API menjawab? (docker compose ps → "healthy")
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:3000/assets?_per_page=1" > /dev/null || exit 1

CMD ["node", "node_modules/json-server/lib/bin.js", "/data/db.json", "--port", "3000"]
