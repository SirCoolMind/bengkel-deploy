# Content outline (for review): Deployment dan Penyelenggaraan, PM2 · Nginx · Docker · CI/CD

**Status: approved v3 (26 Oct 2026) and built.** Morning only: **09:30–12:15** (2 h 45 min), including 30 minutes of
registration in the room and one 15-minute break. `FACILITATOR-GUIDE.md` is the up-to-date reference where the two differ.

Same format as `vue-crud-workshop`: BM for participants, English for the facilitator guide and speaker notes,
numbered checkpoints, a slide deck in `slaid/`, and `npm run release` zipping a versioned snapshot into
`../vue-deploy-workshop-releases/`.

---

## 1. The whole morning in one picture

Each module **automates the one before it**. That's the logic participants should leave with.

```
 1. PM2      "Pastikan API sentiasa hidup"           pm2 start            → API berjalan, hidup semula bila mati
 2. Nginx    "Hidangkan aplikasi kepada pengguna"    sudo nginx           → aplikasi di port 8080
 3. Docker   "Semua dalam satu kotak, jalan di mana-mana"  docker compose up    → aplikasi di port 9000
 4. CI       "GitHub uji setiap perubahan"           git push             → ✅ atau ❌
 5. CD       "GitHub deploy bila ujian lulus"        git push             → aplikasi baharu di port 9000
```

**One sentence per module, one main command, one visible result.** Participants deploy the **same Inventori Aset ICT
app** they built in the Vue workshop, so there's no new app code to learn.

**The payoff they can see:** a footer in the app shows what's running:
`Versi 0.0.1 · commit a1b2c3d · dibina 26 Okt 2026, 10:42 · [Produksi]`.
In Module 5 they change the app title, `git push`, wait ~2 minutes, refresh: new title, new commit. No manual step.

---

## 2. GitHub Actions or GitLab CI? → **GitHub Actions**

| What matters for free teaching | GitHub (Actions) | GitLab.com (CI/CD) |
|---|---|---|
| Sign-up friction | Email only | New accounts may have to verify with a **phone number or credit card** before shared runners run pipelines |
| A Linux "server" for each participant | **Codespaces**: free 120 core-hours/month, Docker + `sudo`, runs in the browser | No free equivalent |
| CI minutes on the free plan | Unlimited (public repos), 2,000/month (private) | 400 compute minutes/month |
| Common in Malaysian government data centres | GitHub Enterprise is rare | **Self-managed GitLab CE is common** |

**Recommendation:** hands-on with GitHub Actions + Codespaces (nothing to install on office laptops).
GitLab gets **one slide** mapping the terms (workflow → pipeline, pull request → merge request, runner → GitLab Runner…)
and a reference file `rujukan/gitlab/.gitlab-ci.yml` with the same pipeline, for participants whose office uses GitLab.
Check GitLab's current numbers on gitlab.com/pricing before quoting them. The search turned up mostly secondary sources for them.

---

## 3. Registration: 30 minutes in the session (09:30–10:00)

Everyone signs up and creates their Codespace **in the room**. While the Codespaces build (3–5 minutes, plus ~2 minutes
installing Nginx/PM2), the facilitator runs the opening on the projector, so the waiting time isn't lost.

| Min | Participants | Facilitator (projector) |
|---|---|---|
| 0–10 | Create a GitHub account at github.com/signup, enter the code sent to their email | Welcome. Both links are on slide 3: the sign-up link and the template repo (`url.unijaya.com/bengkel-deploy-template`) |
| 10–15 | Template repo → **Use this template** → **Private** repo → **github.com/codespaces/new → own repo → Create codespace** | Walk the room, help with email codes |
| 15–25 | (Codespace is building, nothing to do) | **Opening demo**: push a change → live in 2 minutes. The 5-step picture. |
| 25–30 | Terminal: `npm run semak` → green ticks. Settings → Codespaces → idle timeout **240 minutes** | Hands up when green. Pair anyone stuck with a neighbour |

**Still send a short setup email one week before**: "please create a GitHub account and verify your email".
Everyone who does it saves 10 minutes, and it surfaces problems early:
- Office email that delays or blocks GitHub's verification code (use a personal email instead).
- Many sign-ups from one venue IP can trip GitHub's spam checks, so accounts made in advance are safer.
- Office networks that block `github.com` or `*.app.github.dev` (Codespaces ports). Test the venue Wi-Fi the day before.

**Fallback:** anyone without a working Codespace by 10:00 pairs with a neighbour and catches up later with
`npm run checkpoint NN`. **Nothing to install, browser only.**

---

## 4. Timetable

| Time | Module | Checkpoint | Result on screen |
|---|---|---|---|
| 09:30–10:00 | **Pendaftaran & pembukaan**: sign up, create Codespace; opening demo while it builds | 00 | `npm run semak` all green |
| 10:00–10:20 | **1 · PM2** and **2 · Nginx** | → 01 → 02 | App on port 8080 |
| 10:20–10:45 | **3 · Docker** | → 03 | App on port 9000, in containers |
| 10:45–11:00 | Rehat | | |
| 11:00–11:35 | **4 · CI** with GitHub Actions | → 04 | Green ✅, then a red ❌ they fix |
| 11:35–12:05 | **5 · CD** and penyelenggaraan | → 05 | `git push` deploys by itself |
| 12:05–12:15 | **Penutup**: recap, next steps, Q&A | | |

**CI/CD gets 65 minutes**, plus the opening demo. PM2 + Nginx get 20 minutes, Docker 25.

**If registration runs over:** start Module 1 anyway and have latecomers catch up with `npm run checkpoint 02`.
**If you run late later:** show Nginx on the projector instead of everyone typing it (checkpoint 02 catches them up),
then shorten the ❌ → ✅ exercise in CI. Never cut Module 5: it's the payoff.

---

## 5. Modules in detail

### Pendaftaran & pembukaan (30 min, see section 3)
- Live demo on the facilitator's repo, while participants' Codespaces build: change the app title → `git push` →
  Actions tab (✅ Uji, ✅ Deploy) → refresh → new footer.
- "Deployment = getting code from my laptop onto a server. Maintenance (penyelenggaraan) = keeping it running,
  knowing what's wrong, and fixing it safely."
- The 5-step picture from section 1. Rules as in the Vue workshop (checkpoints, read the error message).

### 1 · PM2: "Pastikan API sentiasa hidup" (8 min)
- **Problem:** `npm run api` dies when you close the terminal or it crashes.
- **Hands-on (checkpoint 01, `ecosystem.config.cjs`, 6 lines):** `pm2 start ecosystem.config.cjs` → `pm2 ls` → `pm2 logs`.
- **Demo moment:** kill the process → `pm2 ls` shows it back up, restart count 1.
- **Maintenance:** `pm2 logs`, `pm2 restart`, and `pm2 startup` (start again after the server reboots).

### 2 · Nginx: "Hidangkan aplikasi kepada pengguna" (12 min)
- **Problem:** the browser needs the app files (`npm run build` → `dist/`) **and** the API, on one address.
- **Hands-on (checkpoint 02, `deploy/nginx/inventori.conf`):** `npm run build` → copy `dist/` to `/var/www/inventori` →
  copy the config → `sudo nginx -t` → `sudo nginx` → open port 8080.
- **Only three ideas in the config:** `root` = where the files are · `location /api/` → `proxy_pass` to PM2 ·
  `try_files … /index.html` for the app's pages.
- **Demo moment:** `pm2 stop` → refresh → **502 Bad Gateway** → "Nginx is fine, the API behind it isn't" → `pm2 start`.
- **Wrap-up line:** "Every new version means: pull, install, test, build, copy, restart. Six manual steps. Let's automate that."

### 3 · Docker: "Semua dalam satu kotak, jalan di mana-mana" (25 min)
- **Problem:** "It works on my machine." The server needs exactly the right Node, Nginx and config.
- **Ideas:** image = a packed box (recipe: `Dockerfile`) · container = the box running · Compose = several boxes started together.
- **Hands-on (checkpoint 03):**
  - `Dockerfile` for the web: **step 1** build with Node, **step 2** copy `dist/` into Nginx (same config as Module 2, two lines changed).
  - `api.Dockerfile`: Node + json-server, data in `/data`.
  - `compose.yaml`: `web` (port 9000) + `api` (no public port) + volume `data`.
  - `docker compose up -d --build` → open port 9000 → `docker compose ps` → `docker compose logs api`.
- **Demo moment:** add an asset → `docker compose down` → `up -d` → the asset is still there (volume).
- **Wrap-up line:** "Now deploying = one command: `docker compose up -d --build`. Next: let GitHub type it for us."

*(Break, 15 min)*

### 4 · CI: "GitHub uji setiap perubahan" (35 min)
- **Ideas:** CI = every push is tested automatically on a clean machine. Workflow → job → steps. Runner = the machine that runs them.
- **Hands-on (checkpoint 04, `.github/workflows/ci.yml`, ~25 lines):** the same commands they'd type by hand:
  checkout → setup Node → `npm ci` → `npm test` → `npm run build`. Commit, push, watch the **Actions** tab, open the logs.
- **Demo moment, everyone does it:** the manager wants prices without sen → change `formatPrice` → push → **❌ red**
  → read which test failed and why → fix → push → **✅ green**.
- **Point to make:** the test caught an unintended change before it reached users.

### 5 · CD and penyelenggaraan: "GitHub deploy bila ujian lulus" (30 min)
- **Ideas:** CD = after CI passes, deploy automatically. The deploy job runs **on our server** through a *self-hosted runner*:
  a small program on the server that asks GitHub "any work for me?". Outbound only, so it works behind an office firewall.
- **Hands-on (checkpoint 05):**
  1. GitHub → Settings → Actions → Runners → copy the token → `bash scripts/pasang-runner.sh <TOKEN>` (one command).
  2. Add a `deploy` job to `ci.yml`: `needs: uji` (only after tests pass) · `runs-on: self-hosted` ·
     `docker compose up -d --build` (exactly the Module 3 command) · `curl` to check it's live.
  3. Change the app title → push → watch both jobs → refresh port 9000 → new title, new commit in the footer. 🎉
- **Penyelenggaraan in 5 minutes:**
  - Something broke after a deploy? **Rollback = `git revert` + push** → CI/CD deploys the previous version.
  - What's happening? `docker compose logs`, `pm2 logs`, the Actions history (who deployed what, when).
  - Crashed? `restart: unless-stopped` and PM2 bring it back by themselves.
  - Updates: Dependabot (in the homework).

### Penutup (10 min)
- The 5-step picture again, each with its command.
- GitLab slide: same ideas, different file.
- Next steps: a real server with a domain + HTTPS, storing images in a registry (ghcr.io), protecting `main` with pull requests.
- Homework: `CABARAN.md`.

---

## 6. Checkpoints (each folder holds all deployment files at that step)

`npm run checkpoint 03` backs up the current deployment files to `backup/` and copies checkpoint 03's.
The app code (`src/`) never changes. `.github/` files take effect only after `git commit` + `git push` (the script says so).

| # | Folder | Adds |
|---|---|---|
| 00 | `00-mula` | Nothing: the app runs in dev mode (`npm start`) |
| 01 | `01-pm2` | `ecosystem.config.cjs` |
| 02 | `02-nginx` | `deploy/nginx/inventori.conf` |
| 03 | `03-docker` | `Dockerfile`, `api.Dockerfile`, `.dockerignore`, `deploy/nginx/docker.conf`, `compose.yaml` |
| 04 | `04-ci` | `.github/workflows/ci.yml` (test + build) |
| 05 | `05-cd` | `ci.yml` + `deploy` job on the self-hosted runner |
| 06 | `06-cabaran` | Homework answers: `.github/dependabot.yml`, `ci.yml` (+ pull request trigger) |

**Ports in the Codespace:** 41730 dev · 3000 API (PM2) · 8080 Nginx · 9000 Docker / production.

### Simplified from draft v1 to keep the logic easy to follow

| Removed / simplified | Why |
|---|---|
| Container registry (ghcr.io), matrix builds, image tags | CD runs `docker compose up -d --build` on the server instead: the **same command** they typed in Module 3. Registry becomes a "next step". |
| Separate `scripts/deploy.sh` | The deploy is 3 commands, written directly in the YAML where they can see it |
| Rollback workflow | Rollback = `git revert` + push. No new concept. |
| Scheduled backup, release tags, branch protection | Moved to homework or "next steps" |
| Entrypoint script for the API container | The volume is filled from the image the first time, so no script is needed |
| PM2 "listen on 127.0.0.1 only" workaround | Left out of the code. One sentence about firewalls instead |
| Manual deploy script checkpoint | Becomes one slide ("six manual steps") |

---

## 7. Homework: `CABARAN.md` (optional, after the session)

1. **Dependabot:** add `.github/dependabot.yml` so GitHub opens weekly update pull requests, which CI tests for you.
2. **Status badge:** show the CI ✅/❌ badge in `README.md`.
3. **Protect `main`** (needs a public repo): require a pull request and a green CI before merging.

Answers in checkpoint 06 + `CABARAN.md` hints.

---

## 8. What's in the box

| Path | What |
|---|---|
| `src/`, `index.html`, `public/` | The Inventori app (Vue checkpoint 14) + the version footer |
| `tests/` | 13 Vitest unit tests (price/date format, form rules, API service) |
| `checkpoints/00…06/` | Deployment files per step + a BM `README.md` each |
| `.devcontainer/` | Codespace: Node 22, Docker, GitHub CLI; Nginx + PM2 installed automatically |
| `scripts/` | `checkpoint.js`, `semak.js` (✔/✘ status of PM2, Nginx, Docker, runner), `pasang-runner.sh`, `start.js`, `reset-db.js`, `release.js` |
| `rujukan/gitlab/` | The same pipeline for GitLab + a short README |
| `slaid/` | Deck, same engine as the Vue workshop: **31 slides**, BM, English notes |
| `README.md` · `FACILITATOR-GUIDE.md` · `CABARAN.md` · `CHANGELOG.md` | As before |

---

## 9. Out of scope (say so on the day)
Kubernetes · cloud VPS, domain and HTTPS setup · container registries · real databases · monitoring stacks.

---

## 10. Decisions I need from you

1. **Break at 10:45–11:00** (15 min). OK, or no break / a different time?
2. **Private repos** for participants. Safer with a self-hosted runner (nobody else can trigger it), and enough for
   everything in the session. Only homework 3 needs a public repo.
3. **Event details** for the title slide: date, organiser (still Unijaya Resources Sdn Bhd?).

---

## 11. Decisions taken

Break 10:45–11:00 · private repos · organiser Unijaya Resources Sdn Bhd · date still to fill in on the title slide.
The lockfile concern turned out to be a local WSL issue: `npm ci` works in a clean Linux container.
