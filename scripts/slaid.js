// npm run slaid: buka slaid bengkel (folder slaid/) melalui server kecil di port 41700.
// Berguna dalam Codespace: buka port 41700 dan klik butang "Salin" pada blok kod.
// (Di komputer sendiri, anda juga boleh klik dua kali slaid/index.html.)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../slaid/', import.meta.url))
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}
const port = Number(process.env.PORT) || 41700

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  if (path.endsWith('/')) path += 'index.html'
  const file = normalize(join(dir, path))
  try {
    if (!file.startsWith(dir) || !types[extname(file)]) throw new Error('tiada')
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Tidak dijumpai')
  }
}).listen(port, () => {
  const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: domain } = process.env
  const url = CODESPACE_NAME ? `https://${CODESPACE_NAME}-${port}.${domain || 'app.github.dev'}` : `http://localhost:${port}`
  console.log(`Pembentangan: ${url}   (Ctrl + C untuk berhenti)`)
})
