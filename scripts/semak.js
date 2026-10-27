// npm run semak: apa yang sedang berjalan dalam Codespace ini?
//   ✔ = berjalan   ✘ = ada masalah (dengan cadangan)   · = belum (kita sampai ke situ nanti)
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: domain } = process.env
const alamat = (port) => (CODESPACE_NAME ? `https://${CODESPACE_NAME}-${port}.${domain || 'app.github.dev'}` : `http://localhost:${port}`)

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000 }).toString().trim()
  } catch {
    return null
  }
}

async function get(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

// Commit yang sedang dipaparkan oleh aplikasi (dari /version.json), atau null
async function commitDi(port) {
  const text = await get(`http://127.0.0.1:${port}/version.json`)
  try {
    return text ? JSON.parse(text).commit : null
  } catch {
    return null
  }
}

const rows = []
const ok = (label, detail = '') => rows.push(['\x1b[32m✔\x1b[0m', label, detail])
const gagal = (label, hint) => rows.push(['\x1b[31m✘\x1b[0m', label, `\x1b[33m${hint}\x1b[0m`])
const belum = (label, hint) => rows.push(['\x1b[90m·\x1b[0m', label, `\x1b[90m${hint}\x1b[0m`])

// ---------- Persediaan ----------
const [major, minor] = process.versions.node.split('.').map(Number)
if (major > 22 || (major === 22 && minor >= 12)) ok('Node.js', `versi ${process.versions.node}`)
else gagal('Node.js', `versi ${process.versions.node}: perlu 22.12 atau lebih baharu`)

if (existsSync(`${root}node_modules/.bin/vite`)) ok('Package projek', 'sudah di-install')
else gagal('Package projek', 'belum di-install: taip  npm ci')

const remote = sh('git remote get-url origin')
if (remote?.includes('github.com')) ok('Repo GitHub', remote.replace(/^https:\/\/[^@]*@/, 'https://'))
else gagal('Repo GitHub', 'tiada repo GitHub anda: lihat checkpoints/00-mula/README.md')

// ---------- 1 · PM2 ----------
// Kali pertama PM2 bermula, ia mencetak logo besar SEBELUM data. Ambil bahagian JSON sahaja.
function senaraiPm2(text) {
  const mula = text.search(/^\[/m)
  try {
    return mula === -1 ? [] : JSON.parse(text.slice(mula))
  } catch {
    return []
  }
}
const pm2 = sh('pm2 jlist')
if (pm2 === null) gagal('1 · PM2', 'PM2 tiada: taip  npm install -g pm2')
else {
  const api = senaraiPm2(pm2).find((p) => p.name === 'inventori-api')
  if (!api) belum('1 · PM2', 'belum: checkpoints/01-pm2/README.md')
  else if (api.pm2_env.status !== 'online') gagal('1 · PM2', `inventori-api "${api.pm2_env.status}": taip  pm2 logs inventori-api`)
  else if (await get('http://127.0.0.1:3000/assets?_per_page=1')) ok('1 · PM2', `inventori-api online di port 3000 (restart ${api.pm2_env.restart_time} kali)`)
  else gagal('1 · PM2', 'online tetapi port 3000 tidak menjawab: taip  pm2 logs inventori-api')
}

// ---------- 2 · Nginx ----------
const commitNginx = await commitDi(8080)
if (commitNginx) {
  if (await get('http://127.0.0.1:8080/api/assets?_per_page=1')) ok('2 · Nginx', `port 8080, commit ${commitNginx}: ${alamat(8080)}`)
  else gagal('2 · Nginx', 'error 502 pada /api: API tidak berjalan? taip  pm2 ls')
} else if (existsSync('/etc/nginx/conf.d/inventori.conf')) {
  gagal('2 · Nginx', 'port 8080 tidak menjawab: ulang Langkah 3-6 dalam checkpoints/02-nginx/README.md')
} else belum('2 · Nginx', 'belum: checkpoints/02-nginx/README.md')

// ---------- 3 · Docker ----------
const enjin = sh('docker info --format "{{.ServerVersion}}"')
if (!enjin) gagal('3 · Docker', 'Docker tidak berjalan: Ctrl+Shift+P → "Codespaces: Rebuild Container"')
else {
  const commitDocker = await commitDi(9000)
  if (commitDocker) ok('3 · Docker', `port 9000, commit ${commitDocker}: ${alamat(9000)}`)
  else if (existsSync(`${root}compose.yaml`)) belum('3 · Docker', 'Docker sedia, aplikasi belum berjalan: taip  docker compose up -d --build')
  else belum('3 · Docker', 'Docker sedia. Belum: checkpoints/03-docker/README.md')
}

// ---------- 4 · CI ----------
if (existsSync(`${root}.github/workflows/ci.yml`)) {
  const dipush = sh('git ls-tree -r --name-only origin/main -- .github/workflows/ci.yml')
  if (dipush) ok('4 · CI', 'ci.yml sudah di GitHub: lihat tab Actions repo anda')
  else belum('4 · CI', 'ci.yml belum di-push: ikut Langkah 4 dalam checkpoints/04-ci/README.md')
} else belum('4 · CI', 'belum: checkpoints/04-ci/README.md')

// ---------- 5 · CD ----------
const runnerDir = `${homedir()}/actions-runner`
if (!existsSync(`${runnerDir}/.runner`)) belum('5 · CD (runner)', 'belum: checkpoints/05-cd/README.md')
else if (sh('pgrep -f Runner.Listener')) ok('5 · CD (runner)', 'runner berjalan, menunggu kerja daripada GitHub')
else gagal('5 · CD (runner)', 'runner tidak berjalan: taip  bash scripts/runner.sh mula')

// ---------- Cetak ----------
const width = Math.max(...rows.map((r) => r[1].length))
console.log('\nSemakan bengkel deploy   (✔ berjalan · ✘ ada masalah · "·" belum, kita sampai nanti)\n')
for (const [mark, label, detail] of rows) console.log(`  ${mark} ${label.padEnd(width)}  ${detail}`)
console.log()
