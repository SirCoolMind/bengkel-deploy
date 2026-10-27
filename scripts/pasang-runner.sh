#!/usr/bin/env bash
# Install GitHub Actions SELF-HOSTED RUNNER dalam Codespace ini (checkpoint 05).
# Runner = program kecil yang bertanya kepada GitHub "ada kerja untuk saya?", kemudian menjalankan kerja
# itu di mesin ini. Ia hanya membuat sambungan KELUAR ke GitHub: server tidak perlu dibuka kepada internet.
#
#   1. GitHub → repo anda → Settings → Actions → Runners → New self-hosted runner → Linux
#   2. Salin token daripada baris:  ./config.sh --url https://github.com/... --token XXXXXXXX
#   3. bash scripts/pasang-runner.sh XXXXXXXX
#
# Token itu sah selama 1 jam sahaja dan hanya boleh mendaftar runner. Jangan kongsi dengan orang lain.
set -euo pipefail

bantuan() {
  echo "✘ $1"
  echo ""
  echo "  Cara guna:  bash scripts/pasang-runner.sh TOKEN"
  echo ""
  echo "  TOKEN ialah perkataan panjang selepas --token pada halaman GitHub:"
  echo "  repo anda → Settings → Actions → Runners → New self-hosted runner → Linux"
  echo "  Salin token SAHAJA (contoh: AB3XYZ...), bukan seluruh baris ./config.sh"
  exit 1
}

TOKEN="${1:-}"
[ -n "$TOKEN" ] || bantuan "Token tiada."
[ $# -eq 1 ] || bantuan "Hanya satu perkataan selepas pasang-runner.sh: token sahaja."
case "$TOKEN" in
  ./* | -* | *config.sh* | *\<* | XXXX*) bantuan "\"$TOKEN\" bukan token." ;;
esac
[ ${#TOKEN} -ge 20 ] || bantuan "Token terlalu pendek. Salin semula keseluruhan token."

VERSI="2.338.1" # https://github.com/actions/runner/releases
PROJEK="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${GITHUB_REPOSITORY:-$(git -C "$PROJEK" remote get-url origin | sed -E 's#.*github\.com[:/]##; s#\.git$##')}"
DIR="$HOME/actions-runner"

mkdir -p "$DIR"
cd "$DIR"

if [ ! -x ./config.sh ]; then
  echo "▶ Download runner versi ${VERSI} (~220 MB, lebih kurang 1 minit)"
  curl -fsSL -o runner.tar.gz "https://github.com/actions/runner/releases/download/v${VERSI}/actions-runner-linux-x64-${VERSI}.tar.gz"
  tar xzf runner.tar.gz
  rm runner.tar.gz
fi

# Keperluan sistem runner (libicu dan lain-lain). Codespace biasanya sudah ada; install hanya jika tiada.
if ! ldconfig -p | grep -q libicu; then
  echo "▶ Install keperluan sistem runner"
  sudo ./bin/installdependencies.sh > /dev/null
fi

echo "▶ Daftar runner untuk repo ${REPO}"
./config.sh --unattended --replace \
  --url "https://github.com/${REPO}" \
  --token "$TOKEN" \
  --name "codespace-${CODESPACE_NAME:-$(hostname)}"

bash "$PROJEK/scripts/runner.sh" mula
echo "✔ Runner sedia. Semak di GitHub: Settings → Actions → Runners (status Idle, bulatan hijau)."
