# 02 · Nginx: satu alamat untuk pengguna

**Modul 2** · lebih kurang 12 minit · port `8080`

## Kenapa?

Pengguna membuka **satu alamat** dalam *browser*. Di belakang alamat itu, mereka perlukan dua perkara:
1. **Fail aplikasi** (HTML, JavaScript, CSS), hasil `npm run build`.
2. **API** (data aset), yang kini berjalan dalam PM2 di port 3000.

**Nginx** ialah pintu masuk: ia menghantar fail aplikasi kepada *browser*, dan menghantar setiap permintaan `/api/...` ke API.

```
Browser ──► Nginx (port 8080) ──┬──► /            fail dalam /var/www/inventori
                                └──► /api/...     API dalam PM2 (port 3000)
```

## Sebelum mula

- Checkpoint 01 siap: `pm2 ls` menunjukkan `inventori-api` **online**.
  *Belum?* Taip `npm run checkpoint 01`, kemudian `pm2 start ecosystem.config.cjs`.

---

## Langkah 1: ambil fail checkpoint

```bash
npm run checkpoint 02
```

Anda patut nampak:

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 02-nginx
    BAHARU   deploy/nginx/inventori.conf
    sama     ecosystem.config.cjs
```

## Langkah 2: baca fail `deploy/nginx/inventori.conf`

Di kiri (*Explorer*), klik folder `deploy`, kemudian `nginx`, kemudian `inventori.conf`. Ada **tiga perkara** sahaja:

| Baris | Maksud |
|---|---|
| `root /var/www/inventori;` | Fail aplikasi ada dalam folder ini |
| `location /api/ { proxy_pass http://127.0.0.1:3000/; }` | Alamat `/api/...` dihantar ke API dalam PM2. `/` di hujung membuang `/api`: `/api/assets` → `/assets` |
| `try_files $uri $uri/ /index.html;` | Alamat yang bukan fail sebenar → `index.html` (Vue yang paparkan halaman itu) |

## Langkah 3: *build* aplikasi

```bash
npm run build
```

*Build* = tukar kod Vue (`src/`) kepada fail biasa yang *browser* faham. Anda patut nampak di hujung:

```
✓ built in ...
```

Folder baharu `dist/` muncul di *Explorer*. Itulah aplikasi yang siap untuk *server*.

## Langkah 4: salin fail ke folder Nginx

```bash
cp -r dist/. /var/www/inventori/
```

Tiada mesej = berjaya. Untuk semak:

```bash
ls /var/www/inventori
```

Anda patut nampak: `assets  favicon.svg  index.html  version.json`

## Langkah 5: pasang konfigurasi Nginx

```bash
sudo cp deploy/nginx/inventori.conf /etc/nginx/conf.d/
```

Tiada mesej = berjaya.

> `sudo` = jalankan sebagai *admin*. Folder `/etc/nginx` hanya boleh diubah oleh *admin*.
> Dalam Codespace, `sudo` tidak meminta kata laluan.

## Langkah 6: semak konfigurasi

```bash
sudo nginx -t
```

Anda patut nampak dua baris ini:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Sentiasa jalankan `sudo nginx -t` dahulu.** Jika ada salah taip, ia memberitahu baris mana, sebelum laman web anda rosak.

## Langkah 7: mula Nginx

```bash
sudo nginx
```

Tiada mesej = berjaya. (Di *server* sebenar: `sudo systemctl start nginx`.)

## Langkah 8: buka aplikasi di port 8080

Kotak kecil muncul di kanan bawah: *"Your application running on port 8080 is available"* → klik **Open in Browser**.

*Tiada kotak?* Klik tab **PORTS** (sebelah **TERMINAL**, bawah skrin) → letak *mouse* di atas baris port `8080`
→ klik ikon 🌐 (*Open in Browser*).

✔ **Berjaya jika:** senarai 48 aset dipaparkan, dan *footer* (bawah sekali) menunjukkan **Production**.

## Langkah 9: 🧪 cuba "rosakkan" API

1. Dalam *terminal* Codespace:

   ```bash
   pm2 stop inventori-api
   ```

2. Kembali ke tab aplikasi (port 8080), tekan **F5** (*refresh*).
   Anda nampak kotak merah: *"Gagal memuatkan data (Aplikasi membalas status 502)..."*.
3. **502 Bad Gateway** bermaksud: Nginx berjalan, tetapi program **di belakangnya** (API) tidak menjawab.
   Lihat catatan Nginx sendiri:

   ```bash
   sudo tail -n 3 /var/log/nginx/error.log
   ```

   Anda nampak `connect() failed (111: Connection refused) while connecting to upstream`.
   *Upstream* = program di belakang Nginx, iaitu API kita.
4. Hidupkan semula API:

   ```bash
   pm2 start inventori-api
   ```

5. Tekan **F5** di tab aplikasi. Data kembali.

## Langkah 10: semak

```bash
npm run semak
```

```
  ✔ 1 · PM2     inventori-api online di port 3000 (restart ...)
  ✔ 2 · Nginx   port 8080, commit ...: https://...-8080.app.github.dev
```

---

## Semak kerja anda

- [ ] `sudo nginx -t` menunjukkan *"syntax is ok"* dan *"test is successful"*.
- [ ] Port 8080 menunjukkan aplikasi dengan *footer* **Production**.
- [ ] Saya nampak *error* 502 bila API dihentikan, dan aplikasi pulih bila API dihidupkan semula.
- [ ] `npm run semak`: ✔ pada baris **2 · Nginx**.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| `sudo nginx -t` tunjuk `[emerg]` dan nombor baris | Fail konfigurasi rosak. Taip `npm run checkpoint 02` untuk ambil fail asal, ulang Langkah 5 dan 6 |
| `bind() to 0.0.0.0:8080 failed (98: Address already in use)` | Nginx sudah berjalan. Taip `sudo nginx -s reload` |
| Port 8080: *"403 Forbidden"* atau *"500 Internal Server Error"* | Fail aplikasi belum disalin. Ulang Langkah 3 dan 4 |
| Kotak merah *"status 502"* | API tidak berjalan. Taip `pm2 ls`; jika tiada atau *stopped*: `pm2 start ecosystem.config.cjs` |
| Port 8080 tiada dalam tab **PORTS** | Taip `sudo nginx` (Langkah 7). Masih tiada? Klik **Forward a Port**, taip `8080`, tekan Enter |

## Apa yang anda belajar

- ***Reverse proxy***: Nginx menerima semua permintaan, kemudian menghantar `/api` ke program lain.
- Aplikasi sentiasa memanggil `/api/...`. Semasa *development*, Vite yang menghantarnya ke json-server
  (`vite.config.js`); di *server*, Nginx. Kod aplikasi tidak berubah.
- *Command* untuk *maintenance*:

  | *Command* | Bila digunakan |
  |---|---|
  | `sudo nginx -t` | Selepas mengubah konfigurasi, **sebelum** *reload* |
  | `sudo nginx -s reload` | Baca semula konfigurasi tanpa memutuskan pengguna |
  | `sudo tail /var/log/nginx/error.log` | Ada *error* 502 atau 404? Lihat sebabnya |

## Setiap versi baharu…

Setiap kali kod berubah, anda perlu mengulang **enam langkah**: ambil kod (`git pull`), `npm ci`, `npm test`,
`npm run build`, salin `dist/`, `pm2 restart`. Lupa satu langkah = *server* rosak atau masih versi lama.
Modul 3 hingga 5 akan mengautomasikan semua ini.

## Fail yang berubah

`deploy/nginx/inventori.conf` (baharu)
