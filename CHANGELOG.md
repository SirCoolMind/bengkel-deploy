# Changelog

Each version is saved as a zip by `npm run release` in `../vue-deploy-workshop-releases/`.
To make a new version: update `"version"` in `package.json`, add an entry below, then run `npm run release`.

## v0.0.1 (2026-10-26)

First version: a morning workshop (09:30–12:15) on deploying the Inventori Aset ICT app from the Vue CRUD workshop.

- **Five modules, each automating the one before:** PM2 → Nginx → Docker → CI → CD, with 65 minutes on
  CI/CD. 30 minutes of in-room registration (GitHub account + Codespace) at the start, with the opening demo
  presented while Codespaces build.
- **GitHub Actions + Codespaces** as the hands-on platform: every participant gets a Linux server in the browser,
  nothing to install. GitLab covered as a translation: slide 29 and `rujukan/gitlab/.gitlab-ci.yml`.
- **Checkpoints 00–06** hold the deployment files for each step (`npm run checkpoint NN`, with backup).
  06 = homework answers (`CABARAN.md`: Dependabot, CI badge, protect `main`).
- **CD through a self-hosted runner** in the participant's Codespace: the deploy job runs
  `docker compose up -d --build --wait` (the Module 3 command) after the tests pass, then a `curl` smoke test.
- **App changes:** version footer + `/version.json` (commit, build time, dev/production); the app calls `/api`
  (Vite proxy in dev, Nginx on the server); `src/utils/format.js` and `src/utils/rules.js` split out with
  13 Vitest unit tests.
- **Tools:** `npm run semak` (status of every layer), `scripts/pasang-runner.sh` / `runner.sh`, Codespace setup and
  restart scripts, `npm run slaid`.
- **Deck:** 31 slides on the Vue workshop's engine, with YAML/Dockerfile/Nginx highlighting and a 5-step
  progress bar. The band says `Ambil fail: npm run checkpoint NN`.
- **Tested on real GitHub** (private test repo, runner in WSL): CI green/red/green, runner registration, deploy,
  title change live in ~45 s, rollback with `git revert`. Details in the facilitator guide.
- `.gitattributes` keeps every text file LF, so `.sh` scripts still run on Linux after being edited on Windows.
- `scripts/pasang-runner.sh` skips the `sudo` dependency step when `libicu` is already installed.
- `npm start` stops the whole process tree on Windows when one side fails (no orphaned json-server).
- **Beginner rewrite (27 Oct):** every checkpoint README is now a full step-by-step guide (where to click, what to
  type, what you should see, what to do if not), with glossary and troubleshooting tables. Formal Malay terms replaced by
  the common English word in italics (*server*, *browser*, *command*, *build*, *test*, …); wording rules in the
  facilitator guide. CI job names are now **Test & build** and **Deploy ke server**. Reviewed by an independent
  "beginner reader" pass; its blockers are fixed (idle timeout set before creating the Codespace, the
  **Open in a codespace** trap, recovery for a refused workflow push, merged folder rows in the Explorer).
- **Tested in a real Codespace:** set-up script, Modules 1–3, runner + deploy job inside the Codespace, the Vite host
  check, and stop/start recovery (about 1 minute). Fixed: `npm run semak` crashed on PM2's first start.
- `scripts/checkpoint.js` marks each file **BAHARU** / **BERUBAH** / sama (new and changed first), and no longer prints
  a commit command that differs from the tutorials. `scripts/pasang-runner.sh` explains what went wrong when the token
  is pasted wrongly (whole line, too short, placeholder).
- Codespace: "Open in Browser" pop-ups for ports 41730/8080/9000, guides open as formatted pages, one folder per row
  in the Explorer. App footer chip says **Production** / **Development**. Dockerfile build stage renamed `build`.
- **Published (28 Oct):** template repo `github.com/SirCoolMind/bengkel-deploy`, short link
  `url.unijaya.com/bengkel-deploy-template`. Slide 3 and tutorial 00 give that link instead of a QR code (a phone scan
  opens the link on the phone, not the laptop). Title slide date: 28 Oktober 2026.
- GitHub's green **Code** menu no longer has a **Codespaces** tab. Slide 3, tutorial 00 (Langkah 4) and the facilitator
  guide now open the Codespace from `github.com/codespaces/new` → own repo → **Create codespace**.
- `npm run checkpoint NN` is now the first command on each module's slide (terminal box and band), not only at the
  far right of the band: following slide 9 without it gave `File ecosystem.config.cjs not found`. Tutorials 02, 04
  and 05 gained a problem-table row for a skipped checkpoint (01 and 03 already had one).
- Module 5 now takes `npm run checkpoint 05` first (slide 26 and tutorial 05 Langkah 1, before installing the runner),
  like every other module. Tutorial 05 Bahagian B steps renumbered B1–B4.
- **Bonus checkpoint 07: deploy your own Vue workshop app.** `npm run checkpoint 07` adds an `my-app/` folder;
  participants drag their laptop's `src` onto it (or upload `src.zip`) and run `npm run my-app`
  (`scripts/my-app.js`): backs up `src/`, copies their files, switches the API address to `/api`, runs test +
  build. Then commit and push: same pipeline, their app on port 9000. Slide 30 (deck now 32 slides), guide
  `checkpoints/07-app-anda/README.md`. `/my-app/` is git-ignored; checkpoint 07's `.dockerignore` skips it.
- Commit history rewritten without co-author lines (template and test repo).
