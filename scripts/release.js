// Facilitator tool: zip the whole training material as one versioned snapshot.
//
//   npm run release   ->  ../vue-deploy-workshop-releases/vue-deploy-workshop-v<version>.zip
//
// Participants don't get this zip: they work in their own GitHub repo created from the
// template repo (see FACILITATOR-GUIDE.md). The zip is the archive, and what you push to
// GitHub as the template.
//
// The version comes from package.json. Bump it there before releasing a new snapshot.
// node_modules/, backup/, dist/, db.json and logs are always left out.
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '')
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const folder = basename(root)
// Save somewhere else (e.g. a USB stick): set RELEASE_OUT_DIR=E:\bengkel before npm run release
const outDir = process.env.RELEASE_OUT_DIR || join(dirname(root), `${folder}-releases`)
const outFile = join(outDir, `${folder}-v${version}.zip`)

if (existsSync(outFile)) {
  console.error(`✘ ${outFile} already exists. Bump "version" in package.json first.`)
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

// bsdtar can write .zip files. It ships with Windows 10+ and macOS.
// (Git Bash's GNU tar cannot, so use the Windows one explicitly.)
const tar = process.platform === 'win32' ? join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar'
const exclude = ['node_modules', '.git', 'backup', 'dist', '.vite', '*.log', `${folder}/db.json`]

const result = spawnSync(tar, ['-a', '-c', '-f', outFile,
  ...exclude.flatMap((p) => ['--exclude', p]),
  '-C', dirname(root), folder], { stdio: 'inherit' })
if (result.status !== 0) {
  console.error('✘ Zip failed. On Linux, use: zip -r <file>.zip vue-deploy-workshop -x "*/node_modules/*"')
  process.exit(1)
}
console.log(`✔ v${version} saved to ${outFile} (${(statSync(outFile).size / 1024 / 1024).toFixed(1)} MB)`)
