import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// ---------- Maklumat build: versi mana yang sedang berjalan? ----------
// Dipaparkan di footer aplikasi dan dalam /version.json, supaya kita boleh semak
// sama ada deploy terbaharu benar-benar sampai ke server.
//   APP_VERSION / COMMIT_SHA  diisi oleh Docker (build-arg) atau GitHub Actions
//   GITHUB_SHA                diisi sendiri oleh GitHub Actions
//   git rev-parse             bila anda build sendiri dalam folder git
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

function commitPendek() {
  const sha = process.env.COMMIT_SHA || process.env.GITHUB_SHA
  if (sha) return sha.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'tempatan'
  }
}

// Hanya nama bermula VITE_ boleh dibaca oleh kod aplikasi (import.meta.env.VITE_...)
process.env.VITE_APP_VERSION ??= process.env.APP_VERSION || pkg.version
process.env.VITE_COMMIT_SHA ??= commitPendek()
process.env.VITE_BUILD_TIME ??= new Date().toISOString()

// npm run build → dist/version.json
function failVersi() {
  return {
    name: 'fail-versi',
    apply: 'build',
    generateBundle() {
      const info = {
        version: process.env.VITE_APP_VERSION,
        commit: process.env.VITE_COMMIT_SHA,
        builtAt: process.env.VITE_BUILD_TIME,
      }
      this.emitFile({ type: 'asset', fileName: 'version.json', source: `${JSON.stringify(info, null, 2)}\n` })
    },
  }
}

// ---------- /api → json-server ----------
// Aplikasi sentiasa memanggil /api/... (lihat src/services/api.js).
//   Semasa development: Vite menghantar /api ke json-server (port 41780).
//   Di server:          Nginx yang menghantar /api ke API (PM2 atau Docker).
// Kod aplikasi tidak berubah antara laptop dan server.
const proksiApi = {
  '/api': {
    target: 'http://127.0.0.1:41780',
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [
    vue(),
    // Komponen Vuetify (v-btn, v-card, ...) diimport secara automatik bila digunakan dalam <template>
    vuetify({ autoImport: true }),
    failVersi(),
  ],

  // Sediakan komponen Vuetify sebaik sahaja `npm run dev` dimulakan, supaya halaman
  // tidak "reload" sendiri bila komponen baharu mula digunakan.
  optimizeDeps: {
    include: [
      'vuetify/components/VAlert',
      'vuetify/components/VApp',
      'vuetify/components/VAppBar',
      'vuetify/components/VBtn',
      'vuetify/components/VCard',
      'vuetify/components/VChip',
      'vuetify/components/VDataTable',
      'vuetify/components/VDialog',
      'vuetify/components/VFooter',
      'vuetify/components/VForm',
      'vuetify/components/VGrid',
      'vuetify/components/VIcon',
      'vuetify/components/VMain',
      'vuetify/components/VSelect',
      'vuetify/components/VSnackbar',
      'vuetify/components/VTextField',
    ],
  },

  server: {
    port: 41730,
    proxy: proksiApi,
    // GitHub Codespaces membuka port melalui alamat https://<nama>-41730.app.github.dev
    allowedHosts: ['.app.github.dev'],
  },

  // npm run preview: lihat hasil "npm run build" (dist/) sebelum deploy. BUKAN server production.
  preview: {
    port: 41740,
    proxy: proksiApi,
    allowedHosts: ['.app.github.dev'],
  },

  // npm test (Vitest)
  test: {
    include: ['tests/**/*.test.js'],
    env: { TZ: 'Asia/Kuala_Lumpur' },
  },
})
