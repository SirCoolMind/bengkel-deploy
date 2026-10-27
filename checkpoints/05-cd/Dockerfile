# Image WEB: build aplikasi Vue, kemudian buka kepada pengguna dengan Nginx.
# Dua stage, sama seperti yang kita buat sendiri dalam Modul 2:

# ---------- Stage 1: build (npm ci + npm run build) ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Commit yang di-build, untuk footer aplikasi (compose.yaml / GitHub Actions mengisinya)
ARG COMMIT_SHA=docker
RUN npm run build

# ---------- Stage 2: Nginx + dist/ ----------
# Image akhir hanya ada Nginx + folder dist/. Node.js dan node_modules ditinggalkan.
FROM nginx:1.30-alpine
COPY deploy/nginx/docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
