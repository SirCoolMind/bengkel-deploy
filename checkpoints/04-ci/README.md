# 04 · CI: GitHub *test* setiap perubahan

**Modul 4** · lebih kurang 35 minit

## Kenapa?

Kod yang rosak boleh sampai kepada pengguna jika tiada siapa yang men-*test*-nya.
**CI** (*Continuous Integration*): setiap kali anda *push* kod ke GitHub, GitHub sendiri menjalankan
`npm ci`, `npm test` dan `npm run build` pada mesin yang bersih, dan memberitahu anda: ✅ lulus atau ❌ gagal.

```
Anda: git push ──► GitHub nampak .github/workflows/ci.yml ──► mesin Linux GitHub menjalankan langkah ──► ✅ / ❌
```

## Perkataan baharu

| Perkataan | Maksud |
|---|---|
| ***Workflow*** | Fail arahan untuk GitHub, dalam folder `.github/workflows/` |
| ***Job*** | Satu kumpulan langkah yang berjalan pada satu mesin |
| ***Step*** | Satu langkah: satu *command*, atau satu *action* siap guna |
| ***Runner*** | Mesin yang menjalankan *job*. Modul ini: mesin GitHub. Modul 5: Codespace anda |
| ***Commit*** | Simpan satu set perubahan dalam sejarah git, dengan mesej |
| ***Push*** | Hantar *commit* dari Codespace ke GitHub |

## Sebelum mula

- Codespace anda terbuka. Modul 1 hingga 3 tidak wajib untuk modul ini.

---

## Langkah 1: ambil fail checkpoint

```bash
npm run checkpoint 04
```

Anda patut nampak:

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 04-ci
    BAHARU   .github/workflows/ci.yml
    sama     ...   (fail lain dari Modul 1 hingga 3)
  Panduan langkah demi langkah: checkpoints/04-ci/README.md

  ⚠ GitHub hanya nampak fail dalam .github/ selepas anda commit dan push.
    Ikut langkah commit dan push dalam panduan di atas.
```

Kita buat *commit* dan *push* dalam Langkah 4.

## Langkah 2: baca fail `.github/workflows/ci.yml`

Di *Explorer* (kiri), klik `.github` → `workflows` → `ci.yml`. Baca dengan tiga soalan:

| Soalan | Baris | Maksud |
|---|---|---|
| **BILA?** | `on: push: branches: [main]` | Setiap kali anda *push* ke *branch* `main` |
| **DI MANA?** | `runs-on: ubuntu-latest` | Mesin Linux baharu daripada GitHub, setiap kali |
| **APA?** | `steps:` | Langkah yang sama seperti yang anda taip sendiri |

Langkah-langkahnya:

| *Step* | Maksud |
|---|---|
| `Ambil kod (checkout)` → `uses: actions/checkout@v7` | Salin kod repo anda ke mesin GitHub. `uses:` = *action* siap guna |
| `Sediakan Node.js` → `uses: actions/setup-node@v7` | *Install* Node.js versi 22 |
| `Install package` → `run: npm ci` | `run:` = *command* biasa, sama seperti dalam *terminal* |
| `Test` → `run: npm test` | 13 *unit test* dalam folder `tests/` |
| `Build` → `run: npm run build` | *Build* aplikasi |

## Langkah 3: *test* sendiri dahulu (pilihan, 10 saat)

```bash
npm test
```

Anda patut nampak `Tests  13 passed (13)`. Inilah yang GitHub akan jalankan.

## Langkah 4: *commit* dan *push*

Taip satu demi satu, tekan **Enter** selepas setiap baris:

```bash
git add -A
```

Pilih **semua** fail yang berubah untuk *commit* ini. Tiada mesej = berjaya.

```bash
git commit -m "Tambah CI"
```

Simpan perubahan dalam sejarah git, dengan mesej `Tambah CI`. Anda patut nampak `1 file changed` (atau lebih).

```bash
git push
```

Hantar ke GitHub. Anda patut nampak di hujung: `main -> main`.

> Dalam Codespace, `git push` tidak meminta kata laluan: Codespace sudah log masuk sebagai anda.

## Langkah 5: lihat CI berjalan di GitHub

1. Pergi ke tab *browser* repo anda di GitHub (`github.com/username-anda/bengkel-deploy`).
   *Sudah tertutup?* Buka https://github.com dan klik `bengkel-deploy` di kiri.
2. Klik tab **Actions** (atas, antara *Pull requests* dan *Projects*).
3. Anda nampak satu baris: **Tambah CI**, dengan bulatan kuning 🟡 (sedang berjalan).
4. Tunggu lebih kurang 40 saat. Bulatan bertukar ✅ hijau.
5. Klik **Tambah CI**, kemudian klik kotak **Test & build**.
6. Anda nampak setiap *step* dengan ✅. Klik **Test** untuk membukanya: anda nampak `Tests  13 passed (13)`,
   sama seperti dalam *terminal* anda.

> GitHub mungkin menunjukkan nota kuning tentang *"ubuntu-latest ... Ubuntu 26"*. Itu makluman sahaja: abaikan.

## Langkah 6: 🧪 pecahkan *build* (semua peserta buat)

**Situasi:** pengurus mahu harga dipaparkan tanpa sen.

1. Di *Explorer*, buka `src` → `utils` → `format.js`.
2. Cari dua baris ini (baris 7 dan 8):

   ```js
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
   ```

3. Tukar kedua-dua `2` kepada `0`:

   ```js
       minimumFractionDigits: 0,
       maximumFractionDigits: 0,
   ```

4. Tekan **Ctrl + S** untuk simpan. (Titik putih ● pada nama tab hilang = sudah disimpan.)
5. *Commit* dan *push*:

   ```bash
   git add -A
   git commit -m "Harga tanpa sen"
   git push
   ```

6. Tab **Actions** di GitHub: baris baharu **Harga tanpa sen**. Selepas ~40 saat: ❌ merah.
   GitHub juga menghantar e-mel kepada anda: *"Run failed"*.
7. Klik **Harga tanpa sen** → klik **Test & build** → *step* **Test** terbuka sendiri (ada ❌). Cari baris merah:

   ```
   × harga dipaparkan dengan sen: 4850 jadi 4,850.00
   ...
   Expected: "4,850.00"
   Received: "4,850"
   ```

   Maksudnya: *test* mengharapkan `4,850.00`, tetapi fungsi kini memberi `4,850`.

**Pengajaran:** *test* menangkap perubahan ini **sebelum** ia sampai kepada pengguna. Jika perubahan itu
memang dikehendaki, anda kemas kini *test* juga (`tests/format.test.js`).

## Langkah 7: betulkan

1. Dalam `src/utils/format.js`, tukar kedua-dua `0` kembali kepada `2`. Tekan **Ctrl + S**.
2. *Test* sendiri dahulu:

   ```bash
   npm test
   ```

   Anda patut nampak `Tests  13 passed (13)`.
3. *Commit* dan *push*:

   ```bash
   git add -A
   git commit -m "Kembalikan harga dengan sen"
   git push
   ```

4. Tab **Actions**: **Kembalikan harga dengan sen** → ✅ hijau.

## Langkah 8: semak

```bash
npm run semak
```

```
  ✔ 4 · CI   ci.yml sudah di GitHub: lihat tab Actions repo anda
```

---

## Semak kerja anda

- [ ] Tab **Actions** menunjukkan tiga *run*: ✅ **Tambah CI**, ❌ **Harga tanpa sen**, ✅ **Kembalikan harga dengan sen**.
- [ ] Saya boleh mencari baris `Expected` dan `Received` dalam log *step* **Test**.
- [ ] `npm run semak`: ✔ pada baris **4 · CI**.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| `nothing to commit, working tree clean` | Langkah 1 belum dibuat: taip `npm run checkpoint 04`. Atau fail belum disimpan: tekan **Ctrl + S** pada fail itu. Kemudian ulang `git add -A` dan `git commit` |
| Tab **COMMIT_EDITMSG** terbuka selepas `git commit` | Anda terlupa `-m "mesej"`. Tulis mesej di baris pertama tab itu, tekan Ctrl + S, kemudian tutup tab itu |
| `git push` ditolak: *"refusing to allow ... workflow"* | Codespace tidak dibenarkan menghantar fail *workflow*. Gunakan laman GitHub: (1) dalam Codespace, buka `ci.yml`, tekan **Ctrl + A** kemudian **Ctrl + C**; (2) repo anda di github.com → **Add file** → **Create new file**; (3) di kotak nama fail, taip `.github/workflows/ci.yml`; (4) klik dalam kotak besar, tekan **Ctrl + V**; (5) klik **Commit changes...**, kemudian **Commit changes**. Kemudian dalam *terminal*: `git pull --rebase`, kemudian `git push` |
| `git push` ditolak: *"rejected ... fetch first"* | Ada perubahan di GitHub yang belum ada dalam Codespace. Taip `git pull --rebase`, kemudian `git push` |
| Tab **Actions** kosong | Fail `ci.yml` belum di-*push*. Ulang Langkah 4. Pastikan anda di repo **anda** |
| ❌ pada *step* **Install package** | `package-lock.json` diubah? Tanya fasilitator |

## Apa yang anda belajar

- **CI**: setiap *push* di-*test* secara automatik pada mesin yang bersih.
- *Workflow* (fail) → *job* → *steps*. *Runner* = mesin yang menjalankannya.
- `uses:` = *action* siap guna. `run:` = *command* biasa.
- Membaca log CI: buka *step* yang ❌, cari baris merah pertama.

## Fail yang berubah

`.github/workflows/ci.yml` (baharu). Dalam latihan: `src/utils/format.js` (diubah, kemudian dikembalikan).
