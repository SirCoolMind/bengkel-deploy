# 00 · Mula: akaun GitHub dan Codespace anda

**Pendaftaran** · 09:30 – 10:00 · 30 minit

Pada akhir bahagian ini, anda ada:
- akaun GitHub,
- repo anda sendiri (salinan projek bengkel),
- Codespace: komputer Linux di *cloud* yang menjadi *server* anda pagi ini. Ia dibuka dalam *browser*,
  jadi tiada apa-apa perlu di-*install* pada laptop anda.

> 💡 **Cara paling mudah membaca panduan ini:** buka panduan ini di github.com. Setiap kotak kod di GitHub ada
> butang **salin** (ikon dua segi empat) di sebelah kanan. Klik butang itu, kemudian *paste* dalam *terminal*.
> - **Sebelum Langkah 2:** buka `url.unijaya.com/bengkel-deploy-template` (repo templat) → folder `checkpoints` → `00-mula` → `README.md`.
> - **Selepas Langkah 2:** baca di repo **anda** (folder yang sama).

---

## Langkah 1: daftar akaun GitHub (~10 minit)

*Sudah ada akaun GitHub? Log masuk, kemudian terus ke Langkah 2.*

1. Buka https://github.com/signup dalam Chrome atau Edge.
2. Masukkan e-mel anda. **Gunakan e-mel peribadi** (contoh Gmail): e-mel pejabat kadang-kadang lambat
   menerima kod daripada GitHub.
3. Cipta kata laluan, kemudian pilih *username* (nama pengguna). Contoh: `aminah-jkr`. Ingat *username* ini.
4. GitHub mungkin meminta anda menyelesaikan teka-teki (*puzzle*) untuk membuktikan anda manusia. Ikut arahan di skrin.
5. GitHub menghantar **kod 8 digit** ke e-mel anda. Buka e-mel, salin kod itu, masukkan di skrin GitHub.
6. Jika GitHub bertanya soalan tentang diri anda, klik **Skip**. Jika diminta memilih pelan, pilih **Free**.

✔ **Berjaya jika:** anda nampak halaman utama GitHub, dan gambar profil anda di penjuru kanan atas.

| Masalah | Penyelesaian |
|---|---|
| Kod tidak sampai ke e-mel | Semak folder **Spam**. Tunggu 2 minit. Masih tiada? Daftar semula dengan e-mel peribadi lain. |
| *Username* sudah digunakan | Tambah nombor atau nama jabatan, contoh `aminah-jkr-2` |

---

## Langkah 2: cipta repo anda daripada templat bengkel (~3 minit)

*Repo* (*repository*) = folder projek anda di GitHub. Kita salin projek bengkel ke dalam akaun anda.

1. Dalam *browser* laptop anda (Chrome atau Edge), klik *address bar* (kotak alamat di bahagian paling atas),
   taip `url.unijaya.com/bengkel-deploy-template`, kemudian tekan **Enter**. *Link* ini juga tertulis di skrin.

   Anda akan nampak halaman repo **SirCoolMind/bengkel-deploy** di GitHub. Ini repo templat bengkel.
2. Klik butang hijau **Use this template** (kanan atas), kemudian pilih **Create a new repository**.

   > ⚠ **Jangan** pilih **Open in a codespace**. Pilihan itu membuka templat fasilitator, bukan repo anda.

3. Isi borang:
   - **Owner**: *username* anda (sudah dipilih).
   - **Repository name**: taip `bengkel-deploy`
   - Pilih **Private** (hanya anda yang boleh melihat repo ini).
4. Klik **Create repository**. Tunggu beberapa saat.

✔ **Berjaya jika:** di kiri atas halaman tertulis `username-anda/bengkel-deploy`, dengan label **Private**,
dan di bawahnya *"generated from ..."*.

> ⚠ Semua langkah seterusnya dibuat dalam repo **anda** (nama anda di kiri atas), bukan repo templat.

---

## Langkah 3: jangan biar Codespace "tertidur" (~1 minit)

Codespace berhenti sendiri selepas 30 minit tanpa aktiviti. Kita panjangkan kepada 4 jam.
**Buat langkah ini SEBELUM membuka Codespace:** tetapan ini hanya berkesan untuk Codespace yang dicipta selepasnya.

1. Buka tab baharu: https://github.com/settings/codespaces
2. Cari bahagian **Default idle timeout**.
3. Padam nombor yang ada, taip `240` (minit).
4. Klik **Save** (di bawah kotak itu).

---

## Langkah 4: buka Codespace (~3 – 5 minit, kebanyakannya menunggu)

1. Kembali ke tab repo anda (`username-anda/bengkel-deploy`).
2. Klik butang hijau **Code** (di atas senarai fail).
3. Klik tab **Codespaces** (sebelah tab **Local**).
4. Klik **Create codespace on main**.
5. Tab baharu dibuka: *"Setting up your codespace"*. Tunggu 1 – 3 minit.
6. Skrin seperti VS Code muncul. Ia ada tiga bahagian utama:
   - **Kiri:** senarai fail (*Explorer*).
   - **Tengah:** fail yang dibuka (panduan `README.md` dibuka sendiri).
   - **Bawah:** *terminal*, tempat anda menaip *command*.
7. Codespace masih menyediakan dirinya selama lebih kurang **1 minit lagi** (*install* Nginx, PM2 dan *package*).
   Anda mungkin nampak salah satu daripada ini:
   - di bawah skrin, tulisan *"Running postCreateCommand..."* dengan ikon berpusing, atau
   - dalam *terminal*, baris `▶ 1/4 Install Nginx` hingga `✔ Codespace sedia!`

   Tunggu sehingga ikon berpusing hilang, atau anda nampak `✔ Codespace sedia!`. Kemudian terus ke Langkah 5.
   *Mahu lihat butiran?* Tekan **Ctrl + Shift + P**, taip `creation log`, pilih **Codespaces: View Creation Log**.

| Masalah | Penyelesaian |
|---|---|
| Tiada tab **Codespaces** atau butang **Create codespace** | Semak kiri atas halaman: mesti tertulis `username-anda/bengkel-deploy`. Jika nama lain, anda di repo templat: ulang Langkah 2 |
| Skrin *"Oh no, it looks like you are offline"* | Internet terputus. *Refresh* halaman (tekan F5) |
| Tiada *terminal* di bawah | Tekan **Ctrl + `** (kekunci di kiri nombor 1), atau menu ☰ (kiri atas) → **Terminal** → **New Terminal** |

---

## Langkah 5: semak Codespace anda (~2 minit)

1. Klik di dalam *terminal* (bahagian bawah skrin). Anda nampak baris seperti
   `@username-anda ➜ /workspaces/bengkel-deploy (main) $`. Ini dipanggil *prompt*: tempat anda menaip.
   *Terminal itu tertulis "Press any key to close the terminal"?* Klik di dalamnya dan tekan mana-mana kekunci,
   kemudian buka *terminal* baharu (**Ctrl + `**).
2. Taip *command* ini (atau salin dan *paste*), kemudian tekan **Enter**:

   ```bash
   npm run semak
   ```

   > Cara *paste* dalam *terminal*: **Ctrl + V**, atau klik kanan → **Paste**.
   > Kali pertama, Chrome mungkin bertanya *"See text and images copied to the clipboard"*: klik **Allow**.

3. Anda patut nampak:

   ```
   Semakan bengkel deploy   (✔ berjalan · ✘ ada masalah · "·" belum, kita sampai nanti)

     ✔ Node.js          versi 22...
     ✔ Package projek   sudah di-install
     ✔ Repo GitHub      https://github.com/username-anda/bengkel-deploy
     · 1 · PM2          belum: checkpoints/01-pm2/README.md
     · 2 · Nginx        belum: checkpoints/02-nginx/README.md
     · 3 · Docker       Docker sedia. Belum: checkpoints/03-docker/README.md
     · 4 · CI           belum: checkpoints/04-ci/README.md
     · 5 · CD (runner)  belum: checkpoints/05-cd/README.md
   ```

   Tiga tanda ✔ hijau di atas = **siap**. Tanda `·` bermaksud "belum": kita buat langkah itu nanti. Itu betul.

| Masalah | Penyelesaian |
|---|---|
| `✘ Package projek` atau `npm: command not found` | Persediaan belum habis. Tunggu 1 minit, cuba lagi. Masih ✘? Taip `npm ci`, tekan Enter, tunggu sehingga selesai |
| `✘ Repo GitHub` | Codespace ini dibuka daripada repo templat. Kembali ke Langkah 2, cipta repo anda, buka Codespace daripada repo anda |
| `✘ 3 · Docker` | Tunggu 1 minit, cuba lagi. Masih ✘? Tekan **Ctrl + Shift + P**, taip `Rebuild Container`, pilih **Codespaces: Rebuild Container**, tunggu 5 minit |

> **Codespace berhenti atau anda tutup tab?** Buka https://github.com/codespaces dan klik nama Codespace anda.
> Tunggu **1 minit** selepas ia terbuka: semua yang anda sudah buat (Nginx, PM2, Docker, *runner*) dihidupkan
> semula sendiri. Kemudian `npm run semak`.

---

## Langkah 6 (pilihan): lihat aplikasi dalam mod *development*

Ini aplikasi **Inventori Aset ICT** dari Bengkel Vue. Pagi ini kita akan *deploy* aplikasi ini.

1. Dalam *terminal*, taip dan tekan **Enter**:

   ```bash
   npm start
   ```

2. Tunggu sehingga anda nampak:

   ```
     ✔ Aplikasi (mod development): https://....app.github.dev
   ```

3. Di penjuru kanan bawah skrin, kotak kecil muncul: *"Your application running on port 41730 is available"*.
   Klik **Open in Browser**.
   *Tiada kotak itu?* Klik tab **PORTS** (sebelah tab **TERMINAL** di bawah), letak *mouse* di atas baris
   port `41730`, klik ikon 🌐 (*Open in Browser*).
4. Tab baharu dibuka: senarai 48 aset. Di bawah sekali (*footer*): `Versi 0.0.1 · commit ... · Development`.
5. Kembali ke tab Codespace. Klik dalam *terminal*, tekan **Ctrl + C** untuk berhenti.
   *Prompt* `$` muncul semula: *terminal* sedia untuk *command* seterusnya.

| Masalah | Penyelesaian |
|---|---|
| Tab baharu kosong atau *error* 502 | Aplikasi belum sedia. Tunggu 5 saat, kemudian *refresh* (F5) |
| *"Port 41730 is already in use"* | `npm start` sudah berjalan dalam *terminal* lain. Pergi ke *terminal* itu dan tekan Ctrl + C |

---

## Semak kerja anda

- [ ] Saya boleh log masuk ke GitHub.
- [ ] Repo `username-saya/bengkel-deploy` (Private) wujud.
- [ ] *Default idle timeout* = 240 minit (dibuat sebelum Codespace dicipta).
- [ ] Codespace terbuka, dan `npm run semak` menunjukkan tiga ✔ di atas.

## Kamus ringkas

| Perkataan | Maksud |
|---|---|
| **Repo** | Folder projek anda di GitHub, dengan sejarah setiap perubahan |
| **Codespace** | Komputer Linux di *cloud* untuk repo anda, dibuka dalam *browser* |
| ***Terminal*** | Tempat menaip *command* (arahan) kepada komputer |
| ***Command*** | Satu arahan yang ditaip, contoh `npm run semak`. Tekan **Enter** untuk menjalankannya |
| **Port** | "Pintu" bernombor di komputer. Setiap program mendengar di port sendiri, contoh 41730 |

## Fail yang berubah

Tiada. Bahagian ini hanya menyediakan akaun dan Codespace.
