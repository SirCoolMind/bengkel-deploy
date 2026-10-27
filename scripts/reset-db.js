// Pulihkan data asal: salin db.seed.json -> db.json
// Guna: npm run reset-db   (boleh dijalankan walaupun json-server sedang berjalan)
//       node scripts/reset-db.js --jika-tiada   (hanya jika db.json belum ada; digunakan oleh npm run api)
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const jikaTiada = process.argv.includes('--jika-tiada')

if (jikaTiada && existsSync(`${root}db.json`)) process.exit(0)

copyFileSync(`${root}db.seed.json`, `${root}db.json`)
console.log('✔ db.json telah dipulihkan kepada data asal (48 aset).')
