#!/usr/bin/env bash
# Urus self-hosted runner yang di-install oleh scripts/pasang-runner.sh
#
#   bash scripts/runner.sh mula     mula runner (ia terus berjalan di background)
#   bash scripts/runner.sh henti    hentikan runner
#   bash scripts/runner.sh status   adakah runner sedang berjalan?
#   bash scripts/runner.sh log      baca log runner (tekan Ctrl + C untuk keluar)
#   bash scripts/runner.sh buang TOKEN
#                                   buang runner dari GitHub (selepas bengkel). TOKEN di sini ialah token
#                                   "remove": GitHub → Settings → Actions → Runners → klik nama runner → Remove
#
# Di server sebenar, runner di-install sebagai servis systemd: sudo ./svc.sh install && sudo ./svc.sh start
set -euo pipefail

DIR="$HOME/actions-runner"
LOG="$DIR/runner.log"

berjalan() { pgrep -f "Runner.Listener" > /dev/null; }

case "${1:-status}" in
  mula)
    [ -f "$DIR/.runner" ] || { echo "✘ Runner belum di-install. Ikut checkpoints/05-cd/README.md, Bahagian A."; exit 1; }
    if berjalan; then echo "✔ Runner sudah berjalan"; exit 0; fi
    (cd "$DIR" && setsid nohup ./run.sh >> "$LOG" 2>&1 < /dev/null &)
    sleep 3
    berjalan && echo "✔ Runner berjalan (log: $LOG)" || { echo "✘ Runner gagal bermula. Baca log: bash scripts/runner.sh log"; exit 1; }
    ;;
  henti)
    pkill -f "Runner.Listener" && echo "✔ Runner dihentikan" || echo "· Runner memang tidak berjalan"
    ;;
  status)
    berjalan && echo "✔ Runner berjalan" || echo "· Runner tidak berjalan. Untuk mula: bash scripts/runner.sh mula"
    ;;
  log)
    tail -f "$LOG"
    ;;
  buang)
    TOKEN="${2:-}"
    if [ -z "$TOKEN" ]; then
      echo "✘ Token tiada. Cara guna: bash scripts/runner.sh buang TOKEN"
      echo "  Token: GitHub → Settings → Actions → Runners → klik nama runner → Remove → salin token"
      exit 1
    fi
    pkill -f "Runner.Listener" || true
    (cd "$DIR" && ./config.sh remove --token "$TOKEN")
    ;;
  *)
    echo "Cara guna: bash scripts/runner.sh mula | henti | status | log | buang TOKEN"
    exit 1
    ;;
esac
