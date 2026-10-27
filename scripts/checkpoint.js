// Lompat ke mana-mana checkpoint bengkel.
//
//   npm run checkpoint          -> senarai semua checkpoint
//   npm run checkpoint 05       -> fail deploy (Dockerfile, compose.yaml, .github/...) disamakan dengan checkpoint 05
//
// Setiap folder checkpoints/NN-.../ mengandungi SEMUA fail deploy pada langkah itu.
// Fail deploy anda yang sedia ada disimpan dahulu dalam folder backup/, jadi kerja anda tidak hilang.
// Kod aplikasi (folder src/) tidak disentuh.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const checkpointsDir = join(root, 'checkpoints')

const checkpoints = readdirSync(checkpointsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
  .map((entry) => entry.name)
  .sort()

// Semua fail dalam satu folder checkpoint (kecuali README.md), sebagai laluan relatif
function filesOf(name) {
  const dir = join(checkpointsDir, name)
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .filter((file) => file !== 'README.md')
}

function titleOf(name) {
  const readme = join(checkpointsDir, name, 'README.md')
  if (!existsSync(readme)) return ''
  return readFileSync(readme, 'utf8').split('\n')[0].replace(/^#\s*/, '')
}

const arg = process.argv[2]

if (!arg) {
  console.log('\nCheckpoint yang ada:\n')
  for (const name of checkpoints) console.log(`  ${name.padEnd(24)} ${titleOf(name)}`)
  console.log('\nContoh: npm run checkpoint 05\n')
  process.exit(0)
}

const wanted = arg.padStart(2, '0')
const target = checkpoints.find((name) => name.startsWith(`${wanted}-`) || name === arg)

if (!target) {
  console.error(`✘ Checkpoint "${arg}" tiada. Taip "npm run checkpoint" untuk melihat senarai.`)
  process.exit(1)
}

// Fail yang diuruskan oleh checkpoint = gabungan fail daripada SEMUA checkpoint
const managed = [...new Set(checkpoints.flatMap(filesOf))].sort()
const existing = managed.filter((file) => existsSync(join(root, file)))
const before = new Map(existing.map((file) => [file, readFileSync(join(root, file), 'utf8')]))

// 1. Simpan fail deploy semasa ke backup/<tarikh-masa>/
if (existing.length) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  for (const file of existing) {
    const dest = join(root, 'backup', stamp, file)
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(join(root, file), dest)
    rmSync(join(root, file))
  }
  // Buang folder yang kini kosong (contoh .github/workflows/, deploy/nginx/)
  const folders = [...new Set(existing.map((file) => dirname(file)))].filter((dir) => dir !== '.')
  for (const dir of folders.sort((a, b) => b.length - a.length)) {
    for (let d = dir; d !== '.'; d = dirname(d)) {
      const path = join(root, d)
      if (!existsSync(path) || readdirSync(path).length) break
      rmSync(path, { recursive: true })
    }
  }
  console.log(`✔ Fail lama anda disimpan dalam backup/${stamp}/`)
}

// 2. Salin fail checkpoint
const files = filesOf(target)
for (const file of files) {
  mkdirSync(dirname(join(root, file)), { recursive: true })
  cpSync(join(checkpointsDir, target, file), join(root, file))
}

console.log(`✔ Siap: fail kini sama seperti checkpoint ${target}`)
if (!files.length) console.log('    (tiada fail deploy pada checkpoint ini)')
// Tandakan fail yang baharu atau berubah (disenaraikan dahulu), supaya anda tahu fail mana yang perlu dibaca
const statusOf = (file) => {
  const now = readFileSync(join(root, file), 'utf8')
  return !before.has(file) ? 'BAHARU ' : before.get(file) !== now ? 'BERUBAH' : 'sama   '
}
const listed = files.map((file) => [statusOf(file), file]).sort((a, b) => (a[0] === 'sama   ') - (b[0] === 'sama   '))
for (const [status, file] of listed) console.log(`    ${status}  ${file}`)
console.log(`  Panduan langkah demi langkah: checkpoints/${target}/README.md`)
if (files.some((file) => file.startsWith('.github/'))) {
  console.log('')
  console.log('  ⚠ GitHub hanya nampak fail dalam .github/ selepas anda commit dan push.')
  console.log('    Ikut langkah commit dan push dalam panduan di atas.')
}
