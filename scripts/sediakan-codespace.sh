#!/usr/bin/env bash
# Dijalankan SEKALI bila Codespace dicipta (.devcontainer/devcontainer.json → postCreateCommand).
# Codespace ini menjadi "server" anda sepanjang bengkel: Linux, Node.js, Docker, Nginx dan PM2.
set -euo pipefail

echo "▶ 1/4 Install Nginx"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx > /dev/null
# Laman contoh Nginx (port 80) tidak diperlukan: kita guna port 8080 (deploy/nginx/inventori.conf)
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -s stop 2> /dev/null || true

echo "▶ 2/4 Install PM2"
npm install -g pm2@7.1.1 --silent --no-fund --no-audit

echo "▶ 3/4 Install package projek (npm ci)"
npm ci --no-fund --no-audit
node scripts/reset-db.js --jika-tiada

echo "▶ 4/4 Sediakan folder web /var/www/inventori"
sudo mkdir -p /var/www/inventori
sudo chown "$(id -un)" /var/www/inventori

echo ""
echo "✔ Codespace sedia! Klik dalam terminal di bawah, taip:  npm run semak"
