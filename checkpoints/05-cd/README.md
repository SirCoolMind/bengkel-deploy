# 05 · CD: GitHub *deploy* bila *test* lulus

**Modul 5** · lebih kurang 30 minit · port `9000`

## Kenapa?

Dalam Modul 3, *deploy* = satu *command*: `docker compose up -d --build`. Tetapi seseorang masih perlu
menaipnya di *server*, setiap kali.

**CD** (*Continuous Deployment*): selepas CI lulus, GitHub sendiri menjalankan *command* itu di *server* anda.
Anda hanya `git push`.

```
git push ──► GitHub: job "Test & build" ✅ ──► job "Deploy ke server" di runner anda ──► port 9000 dikemas kini
```

***Self-hosted runner***: program kecil di *server* anda (Codespace) yang sentiasa bertanya kepada GitHub
*"Ada kerja untuk saya?"*. Bila ada, ia menjalankan kerja itu di *server* anda. Ia hanya membuat sambungan
**keluar** ke GitHub, jadi ia berfungsi untuk *server* di belakang *firewall* pejabat.

## Sebelum mula

- Checkpoint 04 siap: tab **Actions** di GitHub menunjukkan ✅.
- Docker berjalan (Modul 3). Jika belum: taip `docker compose up -d --build` (fail Docker sudah ada sejak checkpoint 03).
- Codespace baru dibuka semula? Tunggu 1 minit, kemudian `npm run semak`.

---

## Bahagian A: *install* *runner* dalam Codespace (~7 minit)

### Langkah A1: buka halaman **Runners** di GitHub

1. Pergi ke tab *browser* repo anda di GitHub (`github.com/username-anda/bengkel-deploy`).
2. Klik tab **Settings** (paling kanan di atas. Tidak nampak? Klik **⋯** dahulu).
3. Di menu kiri, klik **Actions** (ia terbuka), kemudian klik **Runners**.
4. Klik butang hijau **New self-hosted runner**.
5. Di bawah **Runner image**, pilih **Linux**. **Architecture**: **x64**.

### Langkah A2: salin token SAHAJA

Di bahagian **Configure**, ada baris seperti ini:

```
./config.sh --url https://github.com/username-anda/bengkel-deploy --token ABCD1234EFGH5678IJKL9012MN
```

Salin **token sahaja**: perkataan panjang selepas `--token` (contoh `ABCD1234EFGH5678IJKL9012MN`).
Cara mudah: **klik dua kali** pada token itu (ia bertukar biru), kemudian **Ctrl + C**.

> ⚠ **Jangan** jalankan *command* lain di halaman itu (`mkdir`, `curl`, `./config.sh`).
> Skrip bengkel kita membuat semuanya untuk anda.
> Token sah selama **1 jam** sahaja. Jangan kongsi dengan orang lain.

### Langkah A3: jalankan skrip *install*

Dalam *terminal* Codespace, taip `bash scripts/pasang-runner.sh ` (ada **satu ruang** di hujung),
kemudian *paste* token (**Ctrl + V**), dan tekan **Enter**. Contoh:

```bash
bash scripts/pasang-runner.sh ABCD1234EFGH5678IJKL9012MN
```

Anda patut nampak (lebih kurang 1 – 2 minit):

```
▶ Download runner versi 2.338.1 (~220 MB, lebih kurang 1 minit)
▶ Daftar runner untuk repo username-anda/bengkel-deploy
...
√ Connected to GitHub
√ Runner successfully added
√ Settings Saved.
✔ Runner berjalan (log: /home/node/actions-runner/runner.log)
✔ Runner sedia. Semak di GitHub: Settings → Actions → Runners (status Idle, bulatan hijau).
```

### Langkah A4: semak di GitHub

Kembali ke tab GitHub, klik **Runners** di menu kiri (atau tekan F5).
Anda patut nampak `codespace-...` dengan bulatan hijau dan status **Idle** (menunggu kerja).

| Masalah | Penyelesaian |
|---|---|
| `✘ "./config.sh" bukan token` atau `Hanya satu perkataan...` | Anda menyalin seluruh baris. Salin **token sahaja** (Langkah A2) |
| `Http response code: NotFound` atau `Invalid token` | Token tamat tempoh atau salah salin. Tekan F5 di halaman *New self-hosted runner* untuk token baharu, ulang A3 |
| Status **Offline** di GitHub | Taip `bash scripts/runner.sh mula` |

---

## Bahagian B: tambah *job* *deploy* (~10 minit)

### Langkah B1: ambil fail checkpoint

```bash
npm run checkpoint 05
```

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 05-cd
    BERUBAH  .github/workflows/ci.yml
    sama     ...   (fail lain)
  Panduan langkah demi langkah: checkpoints/05-cd/README.md

  ⚠ GitHub hanya nampak fail dalam .github/ selepas anda commit dan push.
    Ikut langkah commit dan push dalam panduan di atas.
```

Kita buat *commit* dan *push* dalam Langkah B3.

### Langkah B2: baca *job* baharu dalam `ci.yml`

Buka `.github/workflows/ci.yml`. Di bawah *job* `test`, ada *job* baharu `deploy`:

| Baris | Maksud |
|---|---|
| `needs: test` | Hanya selepas *job* `test` lulus. *Test* gagal = **tiada** *deploy* |
| `runs-on: self-hosted` | Berjalan di *runner* **anda** (Codespace), bukan di mesin GitHub |
| `run: docker compose up -d --build --wait` | *Command* yang **sama** seperti Modul 3. `--wait` = tunggu sehingga semua *container* sedia |
| `COMMIT_SHA: ${{ github.sha }}` | Nombor *commit* untuk *footer* aplikasi |
| `curl -fsS http://localhost:9000/version.json` | Semak aplikasi benar-benar menjawab (*smoke test*). Tiada jawapan = ❌ |

### Langkah B3: *commit* dan *push*

```bash
git add -A
git commit -m "Tambah CD"
git push
```

### Langkah B4: lihat *deploy* di GitHub

1. Tab **Actions** → klik **Tambah CD**.
2. Anda nampak dua kotak bersambung: **Test & build** → **Deploy ke server**.
3. **Test & build** berjalan dahulu (~40 saat). Kemudian **Deploy ke server** bermula di *runner* anda
   (kali pertama ~1 – 2 minit).
4. Kedua-duanya ✅. Klik **Deploy ke server** → buka *step* **Semak aplikasi berjalan**:
   anda nampak `"commit": "..."` (7 huruf/nombor).

> *Deploy* ini menggantikan *container* yang anda mulakan dalam Modul 3 (namanya sama: `inventori`).
> Data dalam *volume* kekal.

### Langkah B5: semak aplikasi

Di tab aplikasi port 9000, tekan **F5**. *Footer* kini menunjukkan nombor *commit* yang sama, bukan lagi `docker`.

*Untuk melihat nombor commit terakhir anda dalam terminal:* `git log --oneline -1`

---

## Bahagian C: 🎉 *push*, kemudian lihat aplikasi berubah sendiri (~5 minit)

1. Di *Explorer*, buka `src` → `App.vue`.
2. Tekan **Ctrl + F**, taip `v-app-bar-title`, tekan Enter. Anda jumpa baris:

   ```html
   <v-app-bar-title>Inventori Aset ICT</v-app-bar-title>
   ```

3. Tukar teks di tengah, contohnya dengan nama jabatan anda:

   ```html
   <v-app-bar-title>Inventori Aset ICT · Jabatan Anda</v-app-bar-title>
   ```

4. Tekan **Ctrl + S**.
5. *Commit* dan *push*:

   ```bash
   git add -A
   git commit -m "Tajuk baharu"
   git push
   ```

6. Tab **Actions**: tunggu ✅ **Test & build** dan ✅ **Deploy ke server** (lebih kurang 1 minit).
7. Tab aplikasi port 9000: tekan **F5**. **Tajuk baharu** di atas, **commit baharu** di *footer*.

Berapa *command* yang anda taip di *server*? **Sifar.** Itulah CI/CD.

---

## Bahagian D: rosak selepas *deploy*? *Rollback* (~3 minit)

Katakan tajuk baharu itu salah. Kembalikan versi sebelumnya:

```bash
git revert HEAD --no-edit
```

`git revert HEAD` = cipta *commit* baharu yang **membatalkan** *commit* terakhir. Sejarah kekal lengkap:
semua orang boleh nampak apa yang berlaku. `--no-edit` = guna mesej automatik.

```bash
git push
```

Tab **Actions**: baris baharu **Revert "Tajuk baharu"** → tunggu ✅ → tab aplikasi port 9000, **F5**: tajuk lama kembali.

### 🧪 Jika ada masa: *test* gagal = tiada *deploy*

Ulang Langkah 6 dalam checkpoint 04 (tukar `2` kepada `0` dalam `src/utils/format.js`, *commit*, *push*).
Di tab **Actions**: **Test & build** ❌, dan **Deploy ke server** kelabu (*skipped*). Aplikasi di port 9000
**tidak berubah**: pengguna selamat daripada kod yang rosak. Kemudian betulkan (Langkah 7 checkpoint 04).

---

## Langkah akhir: semak

```bash
npm run semak
```

```
  ✔ 3 · Docker        port 9000, commit ...: https://...-9000.app.github.dev
  ✔ 4 · CI            ci.yml sudah di GitHub: lihat tab Actions repo anda
  ✔ 5 · CD (runner)   runner berjalan, menunggu kerja daripada GitHub
```

## Semak kerja anda

- [ ] Halaman **Runners** di GitHub: `codespace-...` **Idle**, bulatan hijau.
- [ ] *Push* "Tajuk baharu": ✅ **Test & build** → ✅ **Deploy ke server**, dan tajuk baharu di port 9000.
- [ ] `git revert` + `git push` mengembalikan tajuk lama.
- [ ] `npm run semak`: ✔ pada 3, 4 dan 5.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| **Deploy ke server**: *"Waiting for a runner to pick up this job"* | *Runner* tidak berjalan. Taip `bash scripts/runner.sh status`, kemudian `bash scripts/runner.sh mula`. Codespace tertutup? Buka semula |
| **Deploy ke server** ❌ pada *step* **Build & jalankan container** | Klik *step* itu, baca baris merah pertama. Cuba sendiri: `docker compose up -d --build` |
| **Deploy ke server** ❌ pada *step* **Semak aplikasi berjalan** | Aplikasi tidak menjawab di port 9000. Taip `docker compose ps` dan `docker compose logs api` |
| Port 9000 masih tunjuk tajuk lama | Tekan **Ctrl + Shift + R** (*refresh* penuh). Bandingkan nombor *commit* di *footer* dengan tab **Actions** |
| `git push` ditolak: *"refusing to allow ... workflow"* (Langkah B3) | Sama seperti checkpoint 04, bahagian *Jika ada masalah*, tetapi fail sudah ada di GitHub: buka `.github/workflows/ci.yml` di github.com → ikon pensel ✏ (**Edit**) → **Ctrl + A**, kemudian *paste* kandungan baharu → **Commit changes...** → **Commit changes**. Kemudian dalam *terminal*: `git pull --rebase`, kemudian `git push` |
| `git revert` tunjuk *"conflict"* | Taip `git revert --abort`, kemudian minta bantuan fasilitator |

## Apa yang anda belajar

- **CD**: selepas CI lulus, *deploy* secara automatik. `needs: test` = tiada *deploy* jika *test* gagal.
- ***Self-hosted runner***: menjalankan *job* di *server* anda sendiri, dengan sambungan keluar sahaja.
- *Maintenance* (penyelenggaraan):

  | Situasi | Tindakan |
  |---|---|
  | Rosak selepas *deploy* | `git revert HEAD --no-edit` + `git push` |
  | Apa yang berlaku? | `docker compose logs`, `pm2 logs`, sejarah tab **Actions** (siapa *deploy* apa, bila) |
  | *Container* mati sendiri | `restart: unless-stopped` menghidupkannya semula |
  | *Runner* tidak berjalan | `bash scripts/runner.sh status` / `mula` / `log` |

## Selepas bengkel

- **Stop** Codespace di https://github.com/codespaces (klik **⋯** → **Stop codespace**) supaya jam percuma tidak habis.
- Tidak mahu guna *runner* lagi? GitHub → **Settings** → **Actions** → **Runners** → klik nama *runner* → **Remove**,
  salin token, kemudian `bash scripts/runner.sh buang TOKEN`.

## Fail yang berubah

`.github/workflows/ci.yml` (berubah: *job* `deploy` ditambah). Dalam latihan: `src/App.vue` (tajuk).
