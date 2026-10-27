# Facilitator Guide

**Deployment dan Penyelenggaraan Aplikasi Web: PM2, Nginx, Docker, CI/CD**: morning workshop, 09:30–12:15.

This file is for you, not the participants (everything participant-facing is in BM).

---

## The idea in one line

> **Each module automates the one before it.** PM2 keeps the API alive → Nginx serves the app → Docker packs both
> into one command → CI tests every push → CD runs that one command on the server after the tests pass.

Participants deploy the **Inventori Aset ICT** app from the Vue CRUD workshop (checkpoint 14), so there's no new app
code. A footer in the app shows what's running (`Versi 0.0.1 · commit a1b2c3d · dibina … · Production`), so every
deploy is visible. The payoff at ~12:00: change the title, `git push`, refresh, new title and commit.

---

## What's in the box

| Path | What it is |
|---|---|
| `src/`, `index.html`, `public/` | The app (Vue workshop checkpoint 14) + the version footer (`src/build-info.js`). `formatPrice`/`formatDate` and the form rules moved to `src/utils/` so they can be tested. The app calls `/api/...` everywhere: Vite proxies it in dev, Nginx in production. |
| `tests/` | 13 Vitest unit tests (format, validation rules, API service with a fake `fetch`). CI runs them. |
| `checkpoints/00…06/` | Each folder holds **all** deployment files at that step + a BM `README.md`. Participants don't type config files; they run `npm run checkpoint NN` and read/run. |
| `scripts/checkpoint.js` | Backs up the current deployment files to `backup/<time>/`, removes them (and emptied folders), copies the checkpoint's files. Managed files = every file that appears in any checkpoint. Never touches `src/`. Reminds them to commit & push when `.github/` files change. |
| `scripts/semak.js` | `npm run semak`: ✔/✘/· status for Node, packages, GitHub remote, then one line per module (PM2 on 3000, Nginx on 8080, Docker on 9000 with the served commit, ci.yml pushed, runner running). `·` = "not there yet", not an error. |
| `scripts/pasang-runner.sh` | Downloads actions/runner 2.338.1, installs its dependencies, registers it for the repo (`$GITHUB_REPOSITORY` in Codespaces) with the token they paste, and starts it. |
| `scripts/runner.sh` | `mula` / `henti` / `status` / `log` / `buang <TOKEN>` for the runner (no systemd in Codespaces). |
| `.devcontainer/devcontainer.json` | Codespace: `javascript-node:1-22-bookworm` + Docker-in-Docker + GitHub CLI, 2 cores. `postCreateCommand` → `scripts/sediakan-codespace.sh` (apt nginx, `pm2@7.1.1`, `npm ci`, `/var/www/inventori`). `postStartCommand` → `scripts/mula-semula.sh` (restarts Nginx, `pm2 resurrect`, runner after the Codespace wakes up). |
| `scripts/start.js` | `npm start`: json-server (41780) + Vite (41730) together, prints the Codespace URL. |
| `scripts/slaid.js` | `npm run slaid`: serves `slaid/` on port 41700, so participants can open the deck in their Codespace and use the **Salin** buttons. |
| `rujukan/gitlab/` | The checkpoint 05 pipeline as `.gitlab-ci.yml` + a BM README (term mapping, registering a GitLab Runner). Reference only. |
| `slaid/` | The deck: 31 slides, BM, English speaker notes. Same engine as the Vue workshop. |
| `CABARAN.md` | Homework (Dependabot, CI badge, protect `main`). Answers in checkpoint 06. |
| `RANGKA-KANDUNGAN.md` | The approved content outline (v3). This guide supersedes it where they differ. |
| `scripts/release.js` | `npm run release` → `../vue-deploy-workshop-releases/vue-deploy-workshop-v<version>.zip` |

**Pinned versions:** Node 22 (Codespace, Docker, CI) · Vue 3.5.44 · Vuetify 4.3.0 · Vite 8.3.4 · Vitest 5.0.5 ·
json-server 1.0.0-beta.15 · PM2 7.1.1 · `node:22-alpine` · `nginx:1.30-alpine` · actions/checkout@v7 ·
actions/setup-node@v7 · actions/runner 2.338.1.

`json-server` is the only runtime `dependency`: the API image installs it with `npm ci --omit=dev`. Everything
the browser needs is bundled at build time, so it's in `devDependencies`.

---

## Why GitHub Actions (and not GitLab) for teaching

- **Codespaces** gives every participant a free Linux server in the browser (120 core-hours/month on a free account),
  with Docker and `sudo`. Nothing to install on locked-down office laptops. GitLab has no free equivalent.
- No phone or credit-card verification to run pipelines. New gitlab.com accounts may need it for shared runners.
- 2,000 free Actions minutes/month on private repos; a full workshop uses ~20–30.

GitLab still gets one slide (29) and `rujukan/gitlab/`, because many government data centres run self-managed GitLab.
Check gitlab.com/pricing before quoting GitLab numbers.

**Private repos** for participants: nobody else can trigger their self-hosted runner. Everything in the session works
on a private repo with a free account. Only homework 3 (rulesets) needs a public repo; `CABARAN.md` covers the
fork-PR approval setting to turn on first.

---

## Timetable ↔ checkpoints ↔ slides

| Time | Session | Checkpoint | Slides | Result |
|---|---|---|---|---|
| 09:30–10:00 | **Pendaftaran & pembukaan** | 00 | 1–7 | `npm run semak` green |
| 10:00–10:08 | **1 · PM2** | 01 | 8–10 | API survives `kill -9` |
| 10:08–10:20 | **2 · Nginx** | 02 | 11–14 | App on 8080, 502 demo |
| 10:20–10:45 | **3 · Docker** | 03 | 15–19 | App on 9000, data survives `down`/`up` |
| 10:45–11:00 | Rehat | | 20 | |
| 11:00–11:35 | **4 · CI** | 04 | 21–24 | ✅, then ❌ → ✅ |
| 11:35–12:05 | **5 · CD & penyelenggaraan** | 05 | 25–29 | `git push` → live on 9000 |
| 12:05–12:15 | **Penutup** | | 30–31 | |

Type the slide number + `Enter` to jump.

**If registration runs over:** start Module 1 anyway; latecomers catch up with `npm run checkpoint 02` and the
commands in its README. **If you run late later:** demo Nginx on the projector (participants run checkpoint 02 at the
break), then shorten the ❌ → ✅ exercise. **Never cut Module 5.**

### Registration (30 min): present while Codespaces build

| Min | Participants | You |
|---|---|---|
| 0–10 | Sign up at github.com/signup, enter the e-mail code | Slide 3. Press `Q` for QR codes: first `github.com/signup`, then the template repo |
| 10–15 | Use this template → Private; **idle timeout 240** at github.com/settings/codespaces; then Create codespace | Walk the room. Watch for **Open in a codespace** (wrong: opens the template) |
| 15–25 | Codespace builds (~3 – 5 min) | Slides 4–6: what deployment is, **live demo**, the five modules |
| 25–30 | `npm run semak`: three ✔ | Slide 7. Pair anyone stuck with a neighbour |

The idle timeout must be set **before** the Codespace is created: GitHub applies the default only to Codespaces
created after the change. With the 15-minute break, the default 30 minutes is also enough for this morning.

---

## Before the workshop

### 2–3 weeks before: publish the template repo
1. In this folder: `npm run checkpoint 00` (root must have **no** deployment files: participants add them step by step,
   and a root `.github/workflows/` would run on the template itself).
2. Create the repo and mark it as a template:

   ```bash
   git init -b main
   git add -A
   git commit -m "Bengkel deploy v0.0.1"
   gh repo create <organisasi>/bengkel-deploy --public --source . --push
   gh repo edit <organisasi>/bengkel-deploy --template
   ```

   The template must be **public** (or participants must have access) so "Use this template" works.
3. Make a short link for slide 3's QR code (e.g. `bit.ly/...`): short links scan more easily.

### 1–2 weeks before: full dry run on a fresh GitHub account
Do the whole morning as a participant would, on a **new** account, from a Windows office laptop if you can.
Almost everything has been run in a real Codespace (see "How this version was verified" below). Two things need
a person signed in to GitHub in a browser, so check them in your dry run:

- [ ] **`git push` of `.github/workflows/ci.yml` from the Codespace terminal is accepted.** The Codespace token is
      documented as "read/write" on its own repo, but GitHub doesn't say explicitly that this covers workflow files.
      If it's refused, the fallback in tutorial 04 (*Jika ada masalah*) is to create the file in the GitHub web editor,
      then `git pull --rebase` and `git push`.
- [ ] The **Open in Browser** pop-ups for ports 41730, 8080 and 9000 appear, and each opens the app.
- [ ] While you're there: how the first-start set-up looks in the browser (a terminal with `▶ 1/4 …` lines, or only
      a "Running postCreateCommand" spinner). Tutorial 00 describes both.

### 1 week before: send the setup email
> Sila daftar akaun GitHub percuma di https://github.com/signup dan sahkan e-mel anda sebelum bengkel.
> Gunakan e-mel peribadi jika e-mel pejabat lambat menerima kod. Bawa laptop dengan Chrome atau Edge.
> Tiada perisian perlu dipasang.

Everyone who does this saves ~10 minutes, and accounts created in advance are less likely to trip GitHub's spam checks
than 20 sign-ups from one venue IP in five minutes.

### Day before
- Test the **venue Wi-Fi**: `github.com`, `*.github.dev`, `*.app.github.dev` (Codespaces ports),
  `ghcr.io`/`registry.npmjs.org`/Docker Hub (Codespace build). Have a phone hotspot as a fallback for yourself.
- Edit the title slide: `[tarikh bengkel]` in `slaid/index.html` (first `<section>`).
- **Your demo repo** (for slide 5): your own repo from the template, at checkpoint 05, runner **Idle**, port 9000 open
  in a browser tab, `src/App.vue` open in the editor. Set your Codespace idle timeout to 240 minutes too.

---

## The slide deck

Same engine as the Vue workshop (`slaid/deck.js`, `deck.css`): double-click `slaid/index.html`, or `npm run slaid`.
Keys: `→`/`←`, number + `Enter`, `M` menu, `P` presenter view, `Q` QR code, `B` black screen, `F` full screen,
`D` dark mode, `?` help. Printing (`Ctrl+P`) gives a 16:9 PDF handout.

Changes from the Vue deck:
- Code highlighting for `yaml`, `docker` and `nginx` (`data-lang`).
- The checkpoint badge's progress bar has 5 steps (01–05).
- **The band at the bottom** says `Ambil fail: npm run checkpoint NN` (where the files come from), not "Tak sempat?". In this
  workshop the checkpoint is how everyone gets the files. 🧪 *Cuba sendiri* bands show no checkpoint.
- No Vue Playground buttons or live Vue demos.
- The schedule (`<script id="jadual">` at the top) drives the agenda, the break slide and the module time pills.

---

## Module notes

### 1 · PM2 (8 min, slides 8–10)
- One file, three commands, one demo. `ecosystem.config.cjs` = "what to run, and what to do when it dies".
- `kill -9 $(pm2 pid inventori-api)` → `pm2 ls` shows ↺ 1. That's the moment.
- `pm2 logs`: Ctrl+C stops watching the log, not the API. People always worry about this.
- `pm2 startup` needs systemd, which Codespaces doesn't have; the Codespace runs `pm2 resurrect` on start instead.
  The process only comes back after a Codespace restart if they ran `pm2 save`.

### 2 · Nginx (12 min, slides 11–14)
- Three ideas only: `root`, `location /api/` + `proxy_pass` (the trailing `/` strips `/api`), `try_files … /index.html`.
- **502 demo:** `pm2 stop inventori-api` → refresh → 502 → "Nginx is fine, the thing behind it isn't" → `pm2 start`.
  The most common production error they'll meet. First places to look: `pm2 ls`, then `/var/log/nginx/error.log`.
- Real servers: `systemctl start/reload nginx`. Always `nginx -t` first.
- Slide 14 (six manual steps) is the bridge to everything after the break.

### 3 · Docker (25 min, slides 15–19)
- Have everyone run `npm run checkpoint 03` and `docker compose up -d --build` **at slide 16**: the first build takes
  ~2 minutes, so explain the files while it runs.
- `Dockerfile` = Module 2 as a recipe: stage 1 is `npm run build`, stage 2 copies `dist/` into Nginx.
  `docker.conf` = the same Nginx file with three lines changed.
- The API has no `ports:`; only `web` can reach it, by service name (`http://api:3000`).
- Volume demo: add an asset → `down` → `up -d` → still there. Warn: `down -v` deletes the data.
- The footer says commit `docker` here; in Module 5 GitHub fills in the real commit.

### 4 · CI (35 min, slides 21–24)
- Read `ci.yml` with the BILA / DI MANA / APA labels. Steps 3–5 are what they'd type themselves.
- Wait for the first green run together and open the logs. The job takes ~15 s; the whole run ~30–40 s.
- GitHub may show an annotation that `ubuntu-latest` is moving to Ubuntu 26. It's informational: ignore it.
- **❌ → ✅ exercise (12 min), everyone does it:** `src/utils/format.js`, `2` → `0` on both lines. Three tests fail;
  the log shows `Expected: "4,850.00"` / `Received: "4,850"`. Point out the e-mail GitHub sends and the red X on the
  repo page. Fix, push, green.
- If a push is refused for "workflow" permission: web editor fallback (see the dry run checklist).

### 5 · CD & penyelenggaraan (30 min, slides 25–29)
- **Runner (slide 26):** Settings → Actions → Runners → New self-hosted runner → Linux → copy only the token →
  `bash scripts/pasang-runner.sh <TOKEN>`. Status **Idle**. The token lasts one hour and can only register a runner.
- The runner connects **out** to GitHub; nothing connects in. That's why it works behind an office firewall, where
  GitHub can't SSH in.
- **Deploy job (slide 27):** three lines carry the idea: `needs: test`, `runs-on: self-hosted`, and the Module 3
  command. `--wait` + the `curl` smoke test turn the run red if the app doesn't come up.
- The deploy runs in the runner's own checkout (`~/actions-runner/_work/…`), but `compose.yaml` has `name: inventori`,
  so it replaces the containers they started by hand in Module 3 and keeps the same volume (same data).
- Wait until the whole room has the new title. "How many manual steps on the server?" Zero.
- **Penyelenggaraan (slide 28):** rollback = `git revert HEAD --no-edit && git push`. Do it live if time allows.
  Combine with Module 4: break a test and push; Deploy is skipped and production stays on the last good version.

---

## Gotchas already handled

| Gotcha | Where handled |
|---|---|
| The browser in a Codespace can't reach `localhost:41780` (json-server) | The app calls `/api`; Vite proxies it (`vite.config.js`), Nginx in production |
| Vite blocks unknown hosts (`*.app.github.dev`) | `server.allowedHosts` / `preview.allowedHosts` |
| "Which version is running?" | Footer + `/version.json` (Vite plugin in `vite.config.js`); `COMMIT_SHA` from compose/Actions |
| Nginx keeps the old API container IP after the API is replaced → 502 | `depends_on: api: restart: true` restarts `web` when `api` is recreated (tested) |
| Named volume owned by root → json-server can't write | `api.Dockerfile` creates `/data` owned by `node`; the volume copies the seed on first use |
| Codespace stops at lunch/idle → Nginx, PM2 and runner gone | `postStartCommand` → `scripts/mula-semula.sh`; idle timeout 240 min in the setup steps |
| No systemd in Codespaces (`systemctl`, `pm2 startup`, runner `svc.sh`) | `sudo nginx`, `pm2 resurrect`, `scripts/runner.sh` instead, and each slide mentions the real-server command |
| `db.json` changes constantly in dev → noisy commits | `db.json` is gitignored and created from `db.seed.json` (`npm run api` / setup script) |
| Switching checkpoint back leaves empty `.github/`, `deploy/` | `scripts/checkpoint.js` removes emptied folders |
| Self-hosted runner on a public repo can run strangers' PR code | Participants use **private** repos; `CABARAN.md` covers the approval setting before going public |

---

## Troubleshooting on the day

| Symptom | Fix |
|---|---|
| GitHub sign-up code doesn't arrive | Spam folder, or sign up with a personal e-mail |
| `npm run semak`: ✘ Repo GitHub | They opened a Codespace on the **template**, not their own copy. Use this template first. |
| Codespace build fails / Docker ✘ | `Ctrl+Shift+P` → **Codespaces: Rebuild Container**. Still failing: delete the Codespace and create a new one. |
| Port 8080: 502 | `pm2 ls` → `pm2 start inventori-api` |
| Port 8080: nothing / 404 | `sudo nginx -t`, `sudo nginx`; `dist/` copied to `/var/www/inventori`? |
| `docker compose up` fails | First red line. Most common: a typo after editing a file → `npm run checkpoint 03` restores it |
| `git push` rejected (workflow permission) | Web editor: Add file → Create new file → `.github/workflows/ci.yml` → paste → Commit → `git pull` |
| `git push` rejected (non-fast-forward) | They edited on github.com too: `git pull --rebase`, then push |
| Deploy: "Waiting for a runner to pick up this job" | `bash scripts/runner.sh status` / `mula`. Codespace stopped? Reopen it. |
| Runner registration fails | Token expired (1 hour) or copied with spaces: get a new one from the same page |
| Deploy green but port 9000 shows the old title | Hard refresh (`Ctrl+Shift+R`); check `/version.json` commit vs the Actions run |

---

## After the workshop

Tell participants: **Stop** the Codespace at github.com/codespaces (saves their free hours), and remove the runner
(Settings → Actions → Runners) if they won't use it again.

---

## Versions and packaging

`npm run release` zips the folder into `../vue-deploy-workshop-releases/vue-deploy-workshop-v<version>.zip`
(or `RELEASE_OUT_DIR`), leaving out `node_modules/`, `.git/`, `backup/`, `dist/`, `db.json` and logs. It refuses to
overwrite an existing version. There's no Windows offline zip: participants work in Codespaces.

To make a new version:
1. `npm run checkpoint 00` so the root has no deployment files.
2. Bump `"version"` in `package.json` and add an entry to `CHANGELOG.md`.
3. `npm run release`, and push the same commit to the template repo.

### How this version was verified (26 Oct 2026)
- `npm test` (13 tests) and `npm run build` on Windows and in a clean `node:22` Linux container.
- `scripts/sediakan-codespace.sh` in the Codespaces base image; Module 1–2 commands there: PM2 restart after
  `kill -9`, Nginx serving the app and `/api`, SPA fallback, the 502 demo, `mula-semula.sh` after a restart.
- Checkpoint 03/05 stack with Docker: both images build, API healthy, `/api` through Nginx, volume survives
  `down`/`up`, API runs as `node`; two simulated CD redeploys (web-only change; API image change) with no 502.
- All workflow versions pass actionlint 1.7.12. `scripts/checkpoint.js` switching up and back down to 00.
- **On real GitHub** (private test repo, free account, runner in WSL instead of a Codespace), the exact participant flow:
  - checkpoint 04: CI ✅ (job 15 s) → `formatPrice` 2 → 0: ❌ with the same `Expected`/`Received` lines as slide 24
    → fixed: ✅;
  - `scripts/pasang-runner.sh <TOKEN>` registered the runner (online, labels `self-hosted, Linux, X64`);
  - checkpoint 05: Test & build ✅ → Deploy ke server ✅ (55 s first time, 26 s after); port 9000 served the pushed commit,
    `/api` healthy; the title change was live ~45 s after `git push`; the footer showed the new commit;
  - rollback: `git revert` + push redeployed the previous version;
  - `npm run semak` reported Docker (with the live commit), CI and the runner correctly;
    `scripts/runner.sh buang <TOKEN>` unregistered the runner.
- Not verified: the two items in the dry run checklist above that need a person signed in to GitHub in a browser.

**In a real Codespace** (27 Oct 2026, private test repo, 2-core machine; the only change was the `sshd` feature so
the commands could be run remotely):
- First start: provisioning ~2 minutes, then `sediakan-codespace.sh` finished in **17 s** (`✔ Codespace sedia!`).
- Every command in tutorials 00–03 gave the output the tutorial shows: `npm run semak`, PM2 (restart after
  `kill -9`, `pm2 save`), Nginx (`nginx -t`, port 8080, the 502 demo and its `connect() failed (111 …)` log line),
  Docker (both images built in 47 s, API healthy, demo asset survives `down`/`up`).
- `pasang-runner.sh` registered the runner from inside the Codespace; the checkpoint 05 deploy job ran **on the
  Codespace** (53 s), served the pushed commit on 9000, and kept the Module 3 data (same compose project).
- Vite accepts the `<codespace>-41730.app.github.dev` host and refuses unknown hosts; `/api` works through it.
  Port labels from `devcontainer.json` appear in the Ports list.
- Stop → start: about **1 minute** after waking, PM2's API (`pm2 resurrect`), Nginx, both containers and the runner
  were all back without any action. The tutorials tell participants to wait 1 minute.
- Found and fixed: `npm run semak` crashed on PM2's very first start (PM2 prints a big logo before its JSON).

## Wording rules (participant material)

Participant text is BM. Where a formal Malay term is rarely used in everyday speech, use the common English word in
*italics* instead: *server* (not pelayan), *browser* (pelayar), *command* (arahan, for terminal commands), *build*
(bina), *test* (uji), *deploy*, *push*, *commit*, *branch* (cabang), *image* (imej), *container*, *footer* (kaki
halaman), *refresh* (muat semula), *error* (ralat), *package* (pakej), *install* (pasang), *background* (latar
belakang), *development* / *production* (pembangunan / produksi), *maintenance* (penyelenggaraan, kept only in the
workshop title), *column* (lajur), *mouse* (tetikus), *link* (pautan). Product names (Docker, Nginx, GitHub,
Codespace), UI labels (**bold**, exactly as on screen) and code (`backticks`) are not italicised. CI job names are
English: **Test & build**, **Deploy ke server**. Every tutorial step says where to click, what to type, what you
should see, and what to do if you see something else.

### Testing outside Codespaces (WSL, your own Linux box)
- On some WSL setups, Alpine containers can't resolve `registry.npmjs.org` (`npm ci` fails after ~75 s with
  `EAI_AGAIN`), because WSL's DNS proxy answers IPv6 lookups with NXDOMAIN and Alpine's resolver gives up. Codespaces
  and GitHub's runners are not affected. Workaround for a WSL runner only: a compose override with
  `build: extra_hosts: ["registry.npmjs.org:<IP>"]` for `web` and `api`, and in `~/actions-runner/.env`:
  `COMPOSE_FILE=compose.yaml:/home/<you>/actions-runner/uji-dns.yaml`, then restart the runner.
- `wsl -e …` commands that start the runner don't return, because WSL hands every process two terminal handles.
  Run `bash scripts/runner.sh mula 7>&- 10>&-` from `wsl -e`, or just use an interactive WSL terminal.
- `pasang-runner.sh` only runs the `sudo installdependencies.sh` step when `libicu` is missing, so it works where
  `sudo` needs a password.
