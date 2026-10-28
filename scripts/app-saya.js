// Bawa aplikasi Bengkel Vue anda ke dalam projek ini (checkpoint 07).
//
//   npm run app-saya
//
// 1. Cari App.vue anda dalam folder app-saya/ (anda seret folder src ke situ). Fail .zip juga boleh.
// 2. Simpan src/ semasa dalam backup/, kemudian salin fail anda ke atas src/.
//    Fail yang hanya ada dalam bengkel ini (src/utils/, src/build-info.js) kekal, jadi test masih berjalan.
// 3. Tukar alamat API kepada /api. Di laptop, start.bat memberi alamat json-server (VITE_API_URL);
//    di server, Nginx menghantar /api kepada API.
// 4. Jalankan test dan build. Lulus di sini = lulus di GitHub Actions.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const appDir = join(root, 'app-saya')
const srcDir = join(root, 'src')
const rel = (path) => relative(root, path).replaceAll('\\', '/')

function berhenti(...lines) {
  console.error('')
  for (const line of lines) console.error(line)
  console.error('')
  process.exit(1)
}

if (!existsSync(appDir)) {
  berhenti('✘ Folder app-saya tiada.', '  Taip dahulu: npm run checkpoint 07')
}

// Semua fail dalam satu folder (kecuali node_modules, dist, .git), sebagai laluan penuh
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) return []
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

// 1a. Fail .zip dalam app-saya/: buka dahulu (contoh src.zip → app-saya/src/...)
for (const zip of readdirSync(appDir).filter((name) => name.toLowerCase().endsWith('.zip'))) {
  const dest = join(appDir, basename(zip, '.zip').replace(/\.zip$/i, '') + '-zip')
  if (existsSync(dest)) continue
  const python = ['python3', 'python'].find((cmd) => spawnSync(cmd, ['--version']).status === 0)
  const result = python && spawnSync(python, ['-m', 'zipfile', '-e', join(appDir, zip), dest], { stdio: 'inherit' })
  if (!result || result.status !== 0) berhenti(`✘ Tidak dapat membuka ${zip}.`, '  Seret folder src terus ke atas folder app-saya.')
  console.log(`✔ ${zip} dibuka ke ${rel(dest)}/`)
}

// 1b. Cari App.vue. Jika ada lebih daripada satu, ambil yang paling dekat dengan app-saya/
const found = walk(appDir)
  .filter((path) => basename(path) === 'App.vue')
  .sort((a, b) => a.split(/[\\/]/).length - b.split(/[\\/]/).length)

if (!found.length) {
  berhenti(
    '✘ App.vue tidak dijumpai dalam folder app-saya.',
    '  Di laptop, buka folder projek Bengkel Vue anda (vue-crud-workshop).',
    '  Seret folder src ke atas folder app-saya dalam Explorer Codespace, kemudian ulang: npm run app-saya',
  )
}

const from = dirname(found[0])
const incoming = walk(from)
console.log(`✔ Aplikasi anda dijumpai: ${rel(from)}/ (${incoming.length} fail)`)
if (!existsSync(join(from, 'main.js'))) {
  console.log('  ⚠ main.js tiada di sebelah App.vue. Pastikan anda menyeret SELURUH folder src.')
}

// 2. Simpan src/ semasa, kemudian salin fail anda ke atas src/
const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
const backupDir = join(root, 'backup', stamp, 'src')
mkdirSync(dirname(backupDir), { recursive: true })
cpSync(srcDir, backupDir, { recursive: true })
console.log(`✔ src/ lama disimpan dalam ${rel(backupDir)}/`)

const status = []
for (const file of incoming) {
  const dest = join(srcDir, relative(from, file))
  const before = existsSync(dest) ? readFileSync(dest) : null
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(file, dest)
  const label = !before ? 'BAHARU ' : before.equals(readFileSync(dest)) ? 'sama   ' : 'BERUBAH'
  status.push([label, rel(dest)])
}

// 3. Alamat API: import.meta.env.VITE_API_URL → (import.meta.env.VITE_API_URL || '/api')
const patched = []
for (const [, file] of status) {
  if (!/\.(js|vue|ts)$/.test(file)) continue
  const path = join(root, file)
  const before = readFileSync(path, 'utf8')
  const after = before
    .replace(/import\.meta\.env\.VITE_API_URL(?!\s*(\|\||\?\?))/g, "(import.meta.env.VITE_API_URL || '/api')")
    .replace(/(['"`])http:\/\/(localhost|127\.0\.0\.1):41780/g, '$1/api')
  if (after !== before) {
    writeFileSync(path, after)
    patched.push(file)
  }
}

console.log('✔ Fail anda disalin ke src/:')
status.sort((a, b) => (a[0] === 'sama   ') - (b[0] === 'sama   '))
for (const [label, file] of status) console.log(`    ${label}  ${file}`)
if (patched.length) console.log(`✔ Alamat API kini /api dalam: ${patched.join(', ')}`)

// 4. Test dan build: sama seperti job "Test & build" di GitHub Actions
const npm = (args) => spawnSync('npm', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }).status === 0

console.log('\n▶ npm test (sama seperti CI)\n')
if (!npm(['test'])) {
  berhenti(
    '✘ Test gagal. Jika anda push sekarang, CI ❌ dan tiada deploy.',
    '  Baca baris "FAIL" dan "Expected / Received" di atas.',
    '  Selalunya: src/services/api.js anda berbeza daripada versi akhir Bengkel Vue (checkpoint 14).',
    '  Kembali kepada aplikasi bengkel: git checkout -- src',
  )
}

console.log('\n▶ npm run build (sama seperti CI)\n')
if (!npm(['run', 'build'])) {
  berhenti(
    '✘ Build gagal. Baca baris merah pertama di atas.',
    '  "failed to resolve import": aplikasi anda memerlukan package lain. Taip: npm install <nama-package>',
    '  Kembali kepada aplikasi bengkel: git checkout -- src',
  )
}

console.log('')
console.log('✔ Aplikasi anda lulus test dan build.')
console.log('  Seterusnya (panduan: checkpoints/07-app-anda/README.md):')
console.log('    git add -A')
console.log('    git commit -m "Aplikasi saya"')
console.log('    git push')
console.log('')
