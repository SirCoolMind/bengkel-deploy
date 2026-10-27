// npm start: jalankan aplikasi dalam mod development (API + Vite) dengan satu command.
// Sama seperti dua terminal: "npm run api" dan "npm run dev". Ctrl + C menghentikan kedua-duanya.
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(name, args) {
  const child = spawn(npm, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' })
  const prefix = name === 'api' ? '\x1b[35m[api]\x1b[0m ' : '\x1b[36m[web]\x1b[0m '
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (data) => {
      for (const line of data.toString().split('\n')) if (line.trim()) console.log(prefix + line)
    })
  }
  child.on('exit', (code) => {
    if (!stopping) {
      console.log(`${prefix}berhenti (kod ${code}). Menghentikan yang satu lagi...`)
      stop(code ?? 1)
    }
  })
  return child
}

let stopping = false
const children = [run('api', ['run', 'api']), run('web', ['run', 'dev', '--', '--strictPort'])]

// Hentikan npm DAN program yang dimulakannya (json-server, vite)
function killTree(child) {
  if (child.exitCode !== null) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill()
}

function stop(code = 0) {
  stopping = true
  for (const child of children) killTree(child)
  process.exit(code)
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

// Dalam GitHub Codespaces, port dibuka melalui alamat https://<nama>-<port>.app.github.dev
const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: domain } = process.env
const url = CODESPACE_NAME ? `https://${CODESPACE_NAME}-41730.${domain || 'app.github.dev'}` : 'http://localhost:41730'
setTimeout(() => {
  console.log(`\n  ✔ Aplikasi (mod development): ${url}`)
  console.log('    Atau: tab PORTS → port 41730 → ikon 🌐 (Open in Browser)')
  console.log('    Untuk berhenti: klik dalam terminal ini, tekan Ctrl + C\n')
}, 1500)
