# 01 · PM2: pastikan API sentiasa hidup

**Modul 1** · lebih kurang 8 minit · port `3000`

## Kenapa?

Aplikasi Inventori ada dua bahagian:
- **Web**: halaman yang anda nampak dalam *browser* (Vue).
- **API**: program yang menyimpan dan memberi data aset (json-server, fail `db.json`).

Dalam Bengkel Vue, kita jalankan API dengan `npm run api` dalam *terminal*. Masalahnya: tutup *terminal*,
API berhenti. API rosak, ia terus mati. Di *server*, tiada siapa menjaga *terminal* itu 24 jam.

**PM2** ialah *process manager* (penjaga program): ia menjalankan API di *background*, dan menghidupkannya
semula jika ia mati.

## Sebelum mula

- Codespace anda terbuka, dan `npm run semak` menunjukkan ✔ untuk Node.js, *Package* projek dan Repo GitHub
  (checkpoint 00).
- Jika `npm start` masih berjalan, klik dalam *terminal* itu dan tekan **Ctrl + C**.

---

## Langkah 1: ambil fail checkpoint

Klik dalam *terminal* (bawah skrin), taip, tekan **Enter**:

```bash
npm run checkpoint 01
```

Anda patut nampak:

```
✔ Siap: fail kini sama seperti checkpoint 01-pm2
    BAHARU   ecosystem.config.cjs
  Panduan langkah demi langkah: checkpoints/01-pm2/README.md
```

`BAHARU` = fail ini baru sahaja ditambah ke dalam projek anda.

## Langkah 2: baca fail `ecosystem.config.cjs`

Di sebelah kiri (*Explorer*), klik `ecosystem.config.cjs`. Fail ini memberitahu PM2 **apa** yang perlu dijalankan:

```js
name: 'inventori-api',                         // nama yang dipaparkan dalam "pm2 ls"
script: 'node_modules/json-server/lib/bin.js', // program yang dijalankan (json-server)
args: 'db.json --port 3000',                   // sama seperti: json-server db.json --port 3000
autorestart: true,                             // program mati? PM2 hidupkan semula
max_memory_restart: '300M',                    // guna memori lebih 300 MB? PM2 restart
```

Anda tidak perlu mengubah apa-apa. Fail ini sudah lengkap.

## Langkah 3: mula API dengan PM2

```bash
pm2 start ecosystem.config.cjs
```

Anda patut nampak jadual dengan baris `inventori-api` dan status **online** (hijau). Contoh (beberapa *column* dipendekkan):

```
│ id │ name           │ namespace │ version │ mode │ pid  │ uptime │ ↺ │ status │ cpu │ mem    │
│ 0  │ inventori-api  │ default   │ 1.0.0-… │ fork │ 1918 │ 0s     │ 0 │ online │ 0%  │ 33.3mb │
```

> Kali pertama, PM2 mungkin memaparkan logo besar dahulu. Itu normal.

- **↺** = berapa kali PM2 sudah memulakan semula program ini (sekarang 0).
- **status online** = sedang berjalan.

## Langkah 4: lihat senarai dan log

```bash
pm2 ls
```

Jadual yang sama dipaparkan. Gunakan `pm2 ls` bila-bila masa untuk melihat status.

```bash
pm2 logs inventori-api
```

Anda nampak log (catatan) API. Untuk keluar dari log: tekan **Ctrl + C**.
**API terus berjalan**: Ctrl + C hanya berhenti *membaca* log.

## Langkah 5: 🧪 cuba "rosakkan" API

```bash
kill -9 $(pm2 pid inventori-api)
```

*Command* ini mematikan API dengan paksa, seperti program yang rosak. Sekarang:

```bash
pm2 ls
```

Lihat *column* **↺**: kini **1**, dan status masih **online**. PM2 menghidupkan semula API dalam sesaat.

## Langkah 6: suruh PM2 ingat senarai ini

```bash
pm2 save
```

Anda patut nampak `[PM2] Successfully saved in ...`. Kini, bila Codespace berhenti dan dibuka semula
(contohnya selepas rehat), API dihidupkan semula sendiri.

## Langkah 7: semak

```bash
npm run semak
```

Baris PM2 kini:

```
  ✔ 1 · PM2   inventori-api online di port 3000 (restart 1 kali)
```

---

## Semak kerja anda

- [ ] `pm2 ls` menunjukkan `inventori-api` dengan status **online**.
- [ ] Selepas `kill -9`, *column* ↺ bertambah dan status kembali **online**.
- [ ] `pm2 save` sudah dijalankan.
- [ ] `npm run semak`: ✔ pada baris **1 · PM2**.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| `pm2: command not found` | Taip `npm install -g pm2`, tekan Enter, kemudian ulang Langkah 3 |
| `File ecosystem.config.cjs not found` | Langkah 1 belum dibuat. Taip `npm run checkpoint 01` |
| Status **errored** atau **stopped** | Taip `pm2 logs inventori-api` dan baca baris merah. Selalunya: taip `npm ci`, kemudian `pm2 restart inventori-api` |
| `kill: usage: kill ...` | API tidak berjalan. Ulang Langkah 3 |

## Apa yang anda belajar

- ***Process manager*** (PM2) menjaga program: mula di *background*, hidupkan semula bila mati.
- *Command* penting untuk *maintenance* (penyelenggaraan):

  | *Command* | Bila digunakan |
  |---|---|
  | `pm2 ls` | Apa yang sedang berjalan? |
  | `pm2 logs inventori-api` | Apa yang berlaku? Ada *error*? |
  | `pm2 restart inventori-api` | Selepas kod baharu |
  | `pm2 startup` + `pm2 save` | Supaya PM2 dan API hidup sendiri selepas *server* di-*restart* |

- Codespace tiada `systemd`, jadi `pm2 startup` tidak berfungsi di sini. Codespace kita menjalankan
  `pm2 resurrect` sendiri setiap kali ia bermula semula (`scripts/mula-semula.sh`). Di *server* sebenar, guna `pm2 startup`.

## Fail yang berubah

`ecosystem.config.cjs` (baharu)
