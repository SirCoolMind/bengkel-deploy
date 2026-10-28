# Bengkel: Deployment dan Penyelenggaraan Aplikasi Web

PM2 · Nginx · Docker · **CI/CD dengan GitHub Actions**

Projek bengkel: aplikasi **Inventori Aset ICT** (sama seperti Bengkel Vue CRUD). Pagi ini kita membawanya
dari laptop ke *server*, kemudian membiarkan GitHub men-*test* dan men-*deploy* setiap perubahan untuk kita.

> **Mula di sini:** `checkpoints/00-mula/README.md`. Setiap langkah bengkel ada panduan sendiri dalam
> folder `checkpoints/`, langkah demi langkah.

---

## 1. Keperluan

| Perkara | Nota |
|---|---|
| Laptop dengan Chrome atau Edge | **Tiada apa-apa perlu di-*install*.** |
| Akaun GitHub | Percuma: https://github.com/signup (guna e-mel peribadi) |
| Internet | Ya |

*Server* anda ialah **GitHub Codespace**: komputer Linux di *cloud*, dibuka dalam *browser*, dengan
Node.js, Docker, Nginx dan PM2 sudah tersedia.

## 2. Lima modul pagi ini

Setiap modul mengautomasikan modul sebelumnya.

| | Modul | Masalah yang diselesaikan | *Command* utama | Hasil | Panduan |
|---|---|---|---|---|---|
| 1 | **PM2** | API mati bila *terminal* ditutup | `pm2 start ecosystem.config.cjs` | API sentiasa hidup | `checkpoints/01-pm2` |
| 2 | **Nginx** | Pengguna perlukan satu alamat | `sudo nginx` | Aplikasi di port 8080 | `checkpoints/02-nginx` |
| 3 | **Docker** | *"Di komputer saya boleh!"* | `docker compose up -d --build` | Aplikasi di port 9000 | `checkpoints/03-docker` |
| 4 | **CI** | Kod rosak sampai kepada pengguna | `git push` | ✅ atau ❌ di tab **Actions** | `checkpoints/04-ci` |
| 5 | **CD** | *Deploy* manual, lambat, mudah silap | `git push` | Versi baharu di port 9000 | `checkpoints/05-cd` |

*Footer* aplikasi (bawah sekali) menunjukkan versi yang sedang berjalan, contohnya
`Versi 0.0.1 · commit a1b2c3d · dibina 27 Okt 2026, 11:52 · Production`.

## 3. Panduan asas Codespace

| Saya mahu... | Caranya |
|---|---|
| **Buka *terminal*** | Ia ada di bahagian bawah skrin. Tiada? Tekan **Ctrl + `** (kekunci di kiri nombor 1), atau menu ☰ (kiri atas) → **Terminal** → **New Terminal** |
| **Taip *command*** | Klik dalam *terminal*, taip, tekan **Enter** |
| ***Paste* dalam *terminal*** | **Ctrl + V**, atau klik kanan → **Paste**. Kali pertama, Chrome mungkin bertanya tentang *clipboard*: klik **Allow** |
| **Hentikan program dalam *terminal*** | Klik dalam *terminal*, tekan **Ctrl + C** |
| **Buka fail** | Di sebelah kiri (*Explorer*, ikon dua helai kertas), klik nama fail. Klik nama folder untuk membukanya |
| **Simpan fail** | **Ctrl + S**. Titik putih ● pada tab fail hilang = sudah disimpan |
| **Cari dalam fail** | **Ctrl + F** |
| **Buka aplikasi pada satu port** | Kotak *"Open in Browser"* di kanan bawah muncul sendiri. Atau: tab **PORTS** (sebelah **TERMINAL**) → letak *mouse* di atas baris port → ikon 🌐 |
| **Salin kod dari panduan** | Buka panduan di github.com (repo anda → `checkpoints` → folder → `README.md`). Setiap kotak kod ada butang salin di kanan |
| **Hantar perubahan ke GitHub** | `git add -A`, kemudian `git commit -m "mesej"`, kemudian `git push` (satu demi satu) |
| **Lihat CI/CD berjalan** | Repo anda di github.com → tab **Actions** |
| **Buka semula Codespace** | https://github.com/codespaces → klik nama Codespace anda. Tunggu **1 minit**: Nginx, PM2, Docker dan *runner* dihidupkan semula sendiri |

## 4. Checkpoint: fail untuk setiap langkah

Anda tidak perlu menaip fail konfigurasi. Setiap langkah bermula dengan satu *command*, contohnya:

```bash
npm run checkpoint 03
```

Fail *deploy* dalam projek anda disamakan dengan checkpoint itu, dan fail lama anda disimpan dahulu dalam
folder `backup/`. Kod aplikasi (`src/`) tidak disentuh. *Command* itu menunjukkan fail mana yang
**BAHARU** atau **BERUBAH**: buka fail-fail itu dan baca.

| # | Checkpoint | Fail |
|---|---|---|
| 00 | Mula | (tiada) |
| 01 | PM2 | `ecosystem.config.cjs` |
| 02 | Nginx | `deploy/nginx/inventori.conf` |
| 03 | Docker | `Dockerfile`, `api.Dockerfile`, `compose.yaml`, `.dockerignore`, `deploy/nginx/docker.conf` |
| 04 | CI | `.github/workflows/ci.yml` |
| 05 | CD | `.github/workflows/ci.yml` (+ *job* `deploy`) |
| 06 | Jawapan cabaran | `.github/dependabot.yml`, `ci.yml` |
| 07 | Bonus: aplikasi Bengkel Vue anda | `my-app/` (letak folder `src` anda di sini), `.dockerignore` |

Fail dalam `.github/` hanya berkesan selepas anda *commit* dan *push* (lihat bahagian 3).

## 5. Port dalam Codespace

| Port | Apa |
|---|---|
| `41730` | Mod *development* (`npm start`) |
| `3000` | 1 · API dalam PM2 |
| `8080` | 2 · Nginx |
| `9000` | 3 · Docker, kemudian 5 · CD |

## 6. *Command* berguna

| *Command* | Fungsi |
|---|---|
| `npm run semak` | Apa yang sedang berjalan? ✔ berjalan · ✘ ada masalah · `·` belum |
| `npm run checkpoint` | Senarai checkpoint. `npm run checkpoint 05` = lompat ke checkpoint 05 |
| `npm start` | Mod *development* (API + Vite), port 41730 |
| `npm test` | *Unit test* (sama seperti GitHub Actions) |
| `npm run build` | *Build* aplikasi ke folder `dist/` |
| `npm run reset-db` | Pulihkan data asal (48 aset) untuk mod *development* |
| `npm run slaid` | Buka slaid bengkel di port 41700 |
| `bash scripts/pasang-runner.sh TOKEN` | *Install* *self-hosted runner* (Modul 5) |
| `bash scripts/runner.sh status` | *Runner* berjalan? (juga: `mula`, `henti`, `log`) |
| `npm run my-app` | Salin aplikasi Bengkel Vue anda (dalam `my-app/`) ke `src/`, kemudian *test* dan *build* (checkpoint 07) |

## 7. Struktur folder

```
src/                  ← aplikasi Inventori Aset ICT (tidak berubah sepanjang bengkel)
tests/                ← unit test (npm test), dijalankan oleh CI
checkpoints/          ← fail deploy bagi setiap langkah (00 hingga 07), setiap satu ada README.md (panduan)
scripts/              ← checkpoint.js, semak.js, pasang-runner.sh, runner.sh, ...
.devcontainer/        ← tetapan Codespace (Node.js, Docker, Nginx, PM2)
rujukan/gitlab/       ← pipeline yang sama untuk GitLab
slaid/                ← slaid bengkel (buka slaid/index.html)
db.seed.json          ← data asal (48 aset)
CABARAN.md            ← latihan di rumah
```

Fail *deploy* (`ecosystem.config.cjs`, `deploy/`, `Dockerfile`, `compose.yaml`, `.github/`) muncul selepas anda
menjalankan `npm run checkpoint`.

## 8. Masalah biasa

| Masalah | Penyelesaian |
|---|---|
| Kod pengesahan GitHub tidak sampai | Semak folder **Spam**, atau daftar dengan e-mel peribadi |
| `npm run semak`: ✘ Repo GitHub | Codespace dibuka daripada repo templat, bukan repo anda. Lihat `checkpoints/00-mula`, Langkah 2 |
| `command not found` | Salah taip? Semak huruf besar/kecil dan ruang. Atau persediaan Codespace belum habis: tunggu `✔ Codespace sedia!` |
| Port 8080: **502 Bad Gateway** | API tidak berjalan: `pm2 ls`, kemudian `pm2 start ecosystem.config.cjs` |
| `docker compose up` gagal | Baca baris merah pertama. Fail rosak? `npm run checkpoint 03` untuk ambil fail asal |
| `git push` ditolak (*workflow*) | Lihat `checkpoints/04-ci`, bahagian *Jika ada masalah* |
| *Job* **Deploy ke server**: *"Waiting for a runner"* | *Runner* tidak berjalan: `bash scripts/runner.sh mula`. Codespace tertutup? Buka semula |
| Codespace berhenti selepas 30 minit | https://github.com/settings/codespaces → **Default idle timeout** → `240` → **Save**. Tetapan ini untuk Codespace yang dicipta **selepas** itu. Codespace sekarang berhenti? Buka semula, tunggu 1 minit |
| Baru buka semula Codespace, `npm run semak` tunjuk ✘ | Tunggu 1 minit, kemudian cuba lagi |
| Saya tersesat | `npm run checkpoint NN` (nombor yang disebut fasilitator), kemudian ikut panduan checkpoint itu |

## 9. Selepas bengkel

- Repo dan Codespace ialah milik anda. **Stop** Codespace bila selesai: https://github.com/codespaces →
  **⋯** → **Stop codespace**. Akaun percuma ada 120 *core hours* sebulan (≈ 60 jam penggunaan Codespace 2-core).
- Tidak mahu guna *runner* lagi? Lihat `checkpoints/05-cd`, bahagian *Selepas bengkel*.
- *Deploy* aplikasi Bengkel Vue anda sendiri: `checkpoints/07-app-anda/README.md`.
- Latihan di rumah: `CABARAN.md`.

## 10. Kamus ringkas

| Perkataan | Maksud |
|---|---|
| ***Server*** | Komputer yang menjalankan aplikasi untuk pengguna. Hari ini: Codespace anda |
| ***Browser*** | Chrome atau Edge |
| ***Terminal*** / ***command*** | Tempat menaip arahan / satu arahan yang ditaip |
| **Repo** | Folder projek di GitHub, dengan sejarah setiap perubahan |
| ***Commit*** / ***push*** | Simpan perubahan dalam sejarah git / hantar ke GitHub |
| ***Branch*** | Satu "laluan" sejarah. Kita guna `main` sahaja |
| ***Build*** | Tukar kod Vue kepada fail biasa yang *browser* faham (folder `dist/`) |
| ***Test*** | Kod kecil yang menyemak kod aplikasi berfungsi (folder `tests/`) |
| ***Deploy*** | Pasang versi baharu aplikasi di *server* |
| **Port** | "Pintu" bernombor di komputer. Setiap program mendengar di port sendiri |
| ***Process manager*** | Program yang menjaga program lain (PM2) |
| ***Reverse proxy*** | Pintu masuk yang menghantar permintaan ke program lain (Nginx) |
| ***Image*** / ***container*** | Kotak aplikasi yang siap / kotak itu sedang berjalan (Docker) |
| ***Volume*** | Tempat simpan data di luar *container* |
| **CI** / **CD** | *Test* automatik setiap *push* / *deploy* automatik selepas *test* lulus |
| ***Workflow*** / ***job*** / ***runner*** | Fail arahan GitHub Actions / satu kumpulan langkah / mesin yang menjalankannya |
| ***Maintenance*** | Penyelenggaraan: pastikan aplikasi terus berjalan, tahu apa yang rosak, kemas kini dengan selamat |

## 11. Dokumentasi rasmi

- PM2: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx: https://nginx.org/en/docs/beginners_guide.html
- Docker: https://docs.docker.com/get-started/ · Compose: https://docs.docker.com/compose/
- GitHub Actions: https://docs.github.com/en/actions
- *Self-hosted runner*: https://docs.github.com/en/actions/hosting-your-own-runners
- GitHub Codespaces: https://docs.github.com/en/codespaces
- GitLab CI/CD: https://docs.gitlab.com/ci/ (lihat juga `rujukan/gitlab/`)
