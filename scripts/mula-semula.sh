#!/usr/bin/env bash
# Dijalankan SETIAP KALI Codespace bermula (.devcontainer/devcontainer.json → postStartCommand).
# Codespace berhenti sendiri bila tidak digunakan (contoh: waktu makan). Skrip ini menghidupkan
# semula apa yang anda sudah install, supaya "server" anda kembali seperti sebelum berhenti.
#
# Di server sebenar, kerja ini dibuat oleh systemd:
#   sudo systemctl enable nginx      Nginx bermula sendiri selepas reboot
#   pm2 startup && pm2 save          PM2 + aplikasi bermula sendiri selepas reboot
#   sudo ./svc.sh install            runner GitHub Actions sebagai servis
# Container Docker dengan "restart: unless-stopped" bermula semula sendiri.

if [ -f /etc/nginx/conf.d/inventori.conf ]; then
  sudo nginx 2> /dev/null || sudo nginx -s reload 2> /dev/null || true
fi

if [ -f "$HOME/.pm2/dump.pm2" ]; then
  pm2 resurrect > /dev/null 2>&1 || true
fi

if [ -f "$HOME/actions-runner/.runner" ]; then
  bash "$(dirname "$0")/runner.sh" mula || true
fi
