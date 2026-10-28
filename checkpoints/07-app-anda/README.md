# 07 · Bonus: *deploy* aplikasi Bengkel Vue anda sendiri

**Modul bonus** · lebih kurang 15 minit · port `9000` · jika ada masa, atau selepas bengkel

## Kenapa?

Pagi ini kita *deploy* aplikasi Inventori yang disediakan oleh bengkel. Tetapi dalam Bengkel Vue, anda membina
aplikasi Inventori **anda sendiri**, dengan perubahan anda (contohnya medan **Lokasi** daripada cabaran).

*Pipeline* CI/CD tidak peduli aplikasi siapa: ia *test*, *build* dan *deploy* apa sahaja yang anda *push* ke `main`.
Dalam checkpoint ini, anda menukar `src/` dengan kod anda, *push*, dan aplikasi **anda** muncul di port 9000.

Satu perkara perlu ditukar: **alamat API**. Di laptop, `start.bat` memberi aplikasi alamat json-server
(`http://localhost:41780`). Di *server*, alamat itu tiada: Nginx menghantar `/api` kepada API. *Command*
`npm run app-saya` menukarnya untuk anda.

## Sebelum mula

- Checkpoint 05 siap: tab **Actions** menunjukkan ✅ **Test & build** dan ✅ **Deploy ke server**,
  dan *runner* anda **Idle** (bulatan hijau).
- Projek Bengkel Vue anda ada di laptop ini: folder `vue-crud-workshop`, dengan folder `src` di dalamnya.
- Sudah buat CABARAN (checkpoint 06)? Checkpoint 07 mengembalikan `ci.yml` kepada versi checkpoint 05.
  Fail anda disimpan dahulu dalam `backup/`.

---

## Langkah 1: ambil fail checkpoint

Klik dalam *terminal* (bawah skrin), taip, tekan **Enter**:

```bash
npm run checkpoint 07
```

Anda patut nampak:

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 07-app-anda
    BAHARU   app-saya/BACA-SAYA.md
    BERUBAH  .dockerignore
    sama     ...   (fail lain)
  Panduan langkah demi langkah: checkpoints/07-app-anda/README.md
```

- `app-saya` = folder kosong untuk kod anda. Ia muncul di *Explorer* (sebelah kiri).
- `.dockerignore` = Docker tidak perlu folder `app-saya` semasa *build*.

## Langkah 2: cari folder `src` di laptop anda

1. Di laptop, buka **File Explorer** (ikon folder kuning di *taskbar*, atau tekan **Windows + E**).
2. Cari folder projek Bengkel Vue anda, `vue-crud-workshop`. Selalunya di **Desktop**, **Documents** atau
   **Downloads**. Tidak jumpa? Klik kotak carian (kanan atas File Explorer), taip `vue-crud-workshop`, tekan **Enter**.
3. Buka folder itu. Anda nampak folder `src`. Di dalam `src` ada `App.vue` dan `main.js`.

> ⚠ Anda hanya perlukan folder **`src`**. **Jangan** ambil seluruh folder projek: folder `node_modules`
> di dalamnya terlalu besar untuk dihantar.

## Langkah 3: hantar folder `src` ke Codespace

### Cara A: seret (paling mudah)

1. Susun dua tetingkap bersebelahan: klik *browser* Codespace, tekan **Windows + ←**. Kemudian klik File Explorer,
   tekan **Windows + →**.
2. Dalam File Explorer, tekan dan tahan *mouse* pada folder `src`.
3. Seret ke *Explorer* Codespace (sebelah kiri *browser*), dan lepaskan **tepat di atas nama folder `app-saya`**
   (nama itu bertukar warna bila *mouse* di atasnya).
4. Tunggu beberapa saat. Klik anak panah di sebelah `app-saya`: anda patut nampak `app-saya` → `src` → `App.vue`.

> ⚠ Jika keluar soalan *"replace"* atau *"already exists"*: klik **Cancel**. Anda terlepas di tempat lain.
> Ulang langkah 3, lepaskan tepat di atas `app-saya`.

### Cara B: fail zip (jika Cara A tidak berfungsi)

1. Dalam File Explorer, klik kanan folder `src` → **Compress to ZIP file** (Windows 10: **Send to** →
   **Compressed (zipped) folder**). Fail `src.zip` muncul.
2. Dalam *Explorer* Codespace, klik kanan folder `app-saya` → **Upload...**.
3. Pilih `src.zip`, klik **Open**. `src.zip` muncul di bawah `app-saya`. `npm run app-saya` akan membukanya.

## Langkah 4: salin kod anda ke `src/`

```bash
npm run app-saya
```

*Command* ini (1) menyimpan `src/` bengkel dalam `backup/`, (2) menyalin fail anda ke atas `src/`, (3) menukar
alamat API kepada `/api`, dan (4) menjalankan *test* dan *build*, sama seperti CI di GitHub. Anda patut nampak
(lebih kurang 30 saat):

```
✔ Aplikasi anda dijumpai: app-saya/src/ (9 fail)
✔ src/ lama disimpan dalam backup/(tarikh-masa)/src/
✔ Fail anda disalin ke src/:
    BERUBAH  src/App.vue
    BERUBAH  src/services/api.js
    ...
✔ Alamat API kini /api dalam: src/services/api.js
▶ npm test (sama seperti CI)
      Tests  13 passed (13)
▶ npm run build (sama seperti CI)
✓ built in ...
✔ Aplikasi anda lulus test dan build.
```

- `BERUBAH` = fail anda berbeza daripada fail bengkel. `sama` = fail yang sama.
- Fail yang hanya ada dalam bengkel ini (`src/utils/`, `src/build-info.js`) kekal. *Test* memerlukannya.
- Nampak `✘`? Lihat *Jika ada masalah* di bawah. **Jangan** *push* sehingga anda nampak `✔ Aplikasi anda lulus`.

## Langkah 5 (pilihan): cuba dahulu dalam Codespace

```bash
npm start
```

Tunggu sehingga anda nampak `✔ Aplikasi (mod development): https://....app.github.dev`, kemudian klik alamat itu
(**Ctrl** + klik). Anda patut nampak aplikasi **anda**.
Data ialah data bengkel, bukan data dalam laptop anda. Selesai? Klik dalam *terminal*, tekan **Ctrl + C**.

## Langkah 6: *commit* dan *push*

```bash
git add -A
git commit -m "Aplikasi saya"
git push
```

Folder `app-saya` tidak dihantar ke GitHub (ia dalam `.gitignore`). Kod anda sudah ada dalam `src/`.

## Langkah 7: lihat *pipeline* di GitHub

1. Repo anda di GitHub → tab **Actions** → klik **Aplikasi saya**.
2. **Test & build** ✅ (~40 saat), kemudian **Deploy ke server** ✅ (~1 – 2 minit).
3. ❌ pada **Test & build**? Bagus: CI menghalang kod yang gagal *test* daripada sampai ke *server*.
   Port 9000 masih aplikasi lama. Klik *step* merah, baca baris merah, betulkan, *push* semula.

## Langkah 8: lihat aplikasi anda di port 9000

1. Tab **PORTS** → port `9000` → ikon 🌐. Sudah terbuka? Tekan **Ctrl + Shift + R** (*refresh* penuh).
2. Anda patut nampak aplikasi **anda** (contohnya *column* **Lokasi** jika anda buat cabaran Bengkel Vue).
3. *Footer* versi bengkel mungkin tiada (ia dalam `App.vue` bengkel, bukan `App.vue` anda). Untuk melihat
   nombor *commit*: tambah `/version.json` di hujung alamat port 9000, tekan **Enter**. Nombor `commit` sama
   seperti di tab **Actions**.

> Data di port 9000 ialah data *server* (*volume* Docker, Modul 3), bukan data dalam laptop anda. Medan baharu
> anda (contohnya **Lokasi**) kosong untuk aset lama: klik ✏ pada aset untuk mengisinya.

---

## Semak kerja anda

- [ ] `npm run app-saya` menunjukkan `✔ Aplikasi anda lulus test dan build.`
- [ ] Tab **Actions**: **Aplikasi saya** dengan ✅ **Test & build** dan ✅ **Deploy ke server**.
- [ ] Port 9000 menunjukkan aplikasi **anda**, dan `/version.json` menunjukkan *commit* terakhir anda.

## Mahu kembali kepada aplikasi bengkel?

Sama seperti *rollback* dalam Modul 5 (checkpoint 05, Bahagian D):

```bash
git revert HEAD --no-edit
git push
```

Selepas *pipeline* ✅, port 9000 kembali kepada aplikasi bengkel.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| `✘ Folder app-saya tiada.` | Langkah 1 belum dibuat. Taip `npm run checkpoint 07` |
| `✘ App.vue tidak dijumpai dalam folder app-saya.` | Folder `src` belum sampai. Ulang Langkah 3. Semak di *Explorer*: `app-saya` → `src` → `App.vue` |
| Soalan *"replace"* / *"already exists"* semasa menyeret | Klik **Cancel**. Lepaskan tepat di atas nama `app-saya` (Langkah 3) |
| Seret tidak berbuat apa-apa | Gunakan Cara B (fail zip) dalam Langkah 3 |
| `✘ Test gagal.` | `src/services/api.js` anda berbeza daripada versi akhir Bengkel Vue. Kembali kepada aplikasi bengkel: `git checkout -- src`, kemudian minta bantuan fasilitator |
| `✘ Build gagal.` dengan `failed to resolve import "..."` | Aplikasi anda memerlukan *package* lain. Taip `npm install <nama-package>` (nama dalam tanda petik itu), kemudian `npm run build` |
| Port 9000: tiada data, atau mesej *"Failed to fetch"* | Buka `src/services/api.js`. Baris `API_URL` mesti `(import.meta.env.VITE_API_URL \|\| '/api')`. Jika tidak, ulang `npm run app-saya` |
| Port 9000 masih aplikasi lama | Tekan **Ctrl + Shift + R**. Semak tab **Actions**: kedua-dua *job* mesti ✅ |
| **Deploy ke server**: *"Waiting for a runner"* | *Runner* tidak berjalan. Taip `bash scripts/runner.sh mula` |
| `git push` ditolak: *"refusing to allow ... workflow"* | Anda datang dari checkpoint 06, jadi `ci.yml` berubah. Ikut checkpoint 04, bahagian *Jika ada masalah* |

## Apa yang anda belajar

- *Pipeline* yang sama boleh *deploy* aplikasi apa sahaja: ia hanya menjalankan *test*, *build* dan `docker compose`.
- Satu-satunya perbezaan antara laptop dan *server* ialah **alamat API**. Alamat `/api` (tanpa nama *server*)
  berfungsi di kedua-dua tempat: Vite menghantarnya dalam *development*, Nginx dalam *production*.
- *Test* dalam CI melindungi *server*: kod yang gagal *test* tidak pernah di-*deploy*.

## Fail yang berubah

| Fail | Perubahan |
|---|---|
| `.dockerignore` | Tambah `app-saya`: Docker tidak menghantar folder itu semasa *build* |
| `app-saya/BACA-SAYA.md` | BAHARU: folder untuk kod anda, dengan arahan ringkas |
| `src/` | Kod Bengkel Vue anda (melalui `npm run app-saya`, bukan checkpoint) |
