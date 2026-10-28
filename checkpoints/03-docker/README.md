# 03 · Docker: semua dalam satu kotak, jalan di mana-mana

**Modul 3** · lebih kurang 25 minit · port `9000`

## Kenapa?

Dalam Modul 1 dan 2, *server* perlu Node.js, PM2 dan Nginx yang betul, dan anda menaip banyak *command*.
Di *server* lain, versi mungkin berbeza: *"Di komputer saya boleh!"*

**Docker** memasukkan aplikasi **bersama** semua yang ia perlukan ke dalam satu kotak. Kotak yang sama berjalan
dengan cara yang sama di mana-mana *server*.

## Tiga perkataan

| Perkataan | Maksud | Contoh dalam bengkel |
|---|---|---|
| ***Image*** | Kotak yang siap: aplikasi + *software* + konfigurasi. Resipinya ialah `Dockerfile`. | `inventori-web`, `inventori-api` |
| ***Container*** | *Image* yang sedang berjalan | `inventori-web-1`, `inventori-api-1` |
| **Compose** | Senarai beberapa *container* yang dimulakan bersama. Senarainya ialah `compose.yaml`. | web + api |

```
Browser ──► port 9000 ──► container "web" (Nginx + aplikasi) ──► container "api" (json-server)
                                                                       │
                                                                 volume "data" (db.json)
```

## Sebelum mula

- Codespace anda terbuka. PM2 dan Nginx (Modul 1 dan 2) boleh terus berjalan: Docker guna port 9000, tidak berlaga.

---

## Langkah 1: ambil fail checkpoint

```bash
npm run checkpoint 03
```

Anda patut nampak lima fail `BAHARU` (fail `sama` ialah fail dari Modul 1 dan 2):

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 03-docker
    BAHARU   .dockerignore
    BAHARU   Dockerfile
    BAHARU   api.Dockerfile
    BAHARU   compose.yaml
    BAHARU   deploy/nginx/docker.conf
    sama     ecosystem.config.cjs
    sama     deploy/nginx/inventori.conf
```

*Anda melangkau Modul 1 dan 2?* Anda nampak tujuh fail `BAHARU` dan tiada baris `backup`. Itu juga betul.

## Langkah 2: mula *build* sekarang (ia mengambil masa ~2 minit)

```bash
docker compose up -d --build
```

| Bahagian | Maksud |
|---|---|
| `docker compose up` | Mulakan semua *container* dalam `compose.yaml` |
| `-d` | Berjalan di *background*, *terminal* boleh digunakan semula |
| `--build` | *Build image* dahulu (daripada `Dockerfile`) |

Banyak baris akan muncul. **Sementara menunggu, baca Langkah 3.** Di hujung, anda patut nampak:

```
 ✔ Container inventori-api-1  Healthy
 ✔ Container inventori-web-1  Started
```

## Langkah 3: baca fail sementara menunggu

Klik setiap fail di *Explorer* (kiri):

**`Dockerfile`** (*image* web): dua *stage* (peringkat), sama seperti yang anda taip dalam Modul 2.

| Baris | Maksud | Dalam Modul 2, anda taip |
|---|---|---|
| `FROM node:22-alpine AS build` | *Stage* 1: mula dengan Linux kecil yang ada Node.js | |
| `RUN npm ci` | *Install* *package* | `npm ci` |
| `RUN npm run build` | *Build* aplikasi | `npm run build` |
| `FROM nginx:1.30-alpine` | *Stage* 2: Linux kecil yang ada Nginx | (Nginx sudah di-*install*) |
| `COPY ... docker.conf ...` | Letak konfigurasi Nginx | `sudo cp deploy/nginx/inventori.conf ...` |
| `COPY --from=build /app/dist ...` | Salin hasil *build* ke folder Nginx | `cp -r dist/. /var/www/inventori/` |

**`deploy/nginx/docker.conf`**: konfigurasi Nginx yang sama, tiga baris berbeza:
`listen 80`, folder `/usr/share/nginx/html`, dan `proxy_pass http://api:3000/` (**`api`** = nama *container* API).

**`api.Dockerfile`** (*image* API): Node.js + json-server sahaja, data dalam folder `/data`,
dan `HEALTHCHECK` (Docker menyemak setiap 10 saat sama ada API menjawab).

**`compose.yaml`**: dua *service*:

| Baris | Maksud |
|---|---|
| `ports: - "9000:80"` | Port 9000 Codespace → port 80 dalam *container* web |
| `depends_on: api: condition: service_healthy` | Mula web selepas API "healthy" |
| `volumes: - data:/data` | Data API disimpan dalam *volume* `data`, di luar *container* |
| `restart: unless-stopped` | *Container* mati? Docker hidupkan semula (seperti PM2) |
| (tiada `ports` pada api) | API tidak boleh dibuka dari luar. Hanya *container* web boleh sampai kepadanya |

## Langkah 4: semak status

```bash
docker compose ps
```

Anda patut nampak dua baris (beberapa *column* dipendekkan di bawah). Pada `api`, *column* STATUS tertulis **(healthy)**:

```
NAME              SERVICE   STATUS                    PORTS
inventori-api-1   api       Up 30 seconds (healthy)
inventori-web-1   web       Up 20 seconds             0.0.0.0:9000->80/tcp
```

## Langkah 5: buka aplikasi di port 9000

Kotak di kanan bawah: *"Your application running on port 9000 is available"* → **Open in Browser**.
*Tiada kotak?* Tab **PORTS** → baris `9000` → ikon 🌐.

✔ **Berjaya jika:** 48 aset dipaparkan, dan *footer* menunjukkan `commit docker`.
(Dalam Modul 5, GitHub akan mengisi nombor *commit* yang sebenar.)

## Langkah 6: baca log API

```bash
docker compose logs api
```

Sama seperti `pm2 logs`, tetapi untuk *container*. (Untuk terus memerhati: `docker compose logs -f api`, keluar dengan Ctrl + C.)

## Langkah 7: 🧪 *container* dibuang, data kekal

1. Di tab aplikasi (port 9000), klik **Tambah Aset**. Isi semua kotak, contohnya:
   Nama Aset `Laptop Demo Docker`, Kategori **Komputer Riba**, No. Siri `DEMO12345`, Tarikh Beli hari ini,
   Harga `3000`. Klik **Simpan**. Aset itu muncul di atas senarai.
2. Kembali ke Codespace. Buang kedua-dua *container*:

   ```bash
   docker compose down
   ```

   Port 9000 kini tidak berjalan.
3. Cipta semula:

   ```bash
   docker compose up -d
   ```

4. Tunggu 15 saat. Di tab aplikasi, tekan **F5**. Taip `Demo Docker` dalam kotak carian: aset anda **masih ada**.

*Volume* `data` menyimpan `db.json` di luar *container*. *Container* baharu = data yang sama.

> ⚠ Jangan taip `docker compose down -v` hari ini: `-v` turut memadam *volume* (semua data).

## Langkah 8: semak

```bash
npm run semak
```

```
  ✔ 3 · Docker   port 9000, commit docker: https://...-9000.app.github.dev
```

---

## Semak kerja anda

- [ ] `docker compose ps`: api **(healthy)**, web **Up**.
- [ ] Port 9000 menunjukkan aplikasi, *footer* `commit docker`.
- [ ] Aset baharu saya masih ada selepas `down` dan `up -d`.
- [ ] `npm run semak`: ✔ pada baris **3 · Docker**.

## Jika ada masalah

| Apa yang anda nampak | Apa yang perlu dibuat |
|---|---|
| `Cannot connect to the Docker daemon` | Docker belum sedia. Tunggu 30 saat dan cuba lagi. Masih gagal? Ctrl + Shift + P → **Codespaces: Rebuild Container** |
| `no configuration file provided: not found` | Langkah 1 belum dibuat. Taip `npm run checkpoint 03` |
| Baris merah `failed to solve` semasa *build* | Baca baris merah pertama. Jika anda mengubah fail: `npm run checkpoint 03` untuk ambil fail asal, ulang Langkah 2 |
| `port is already allocated` (9000) | *Container* lama masih berjalan. Taip `docker compose down`, kemudian ulang Langkah 2 |
| Port 9000: kotak merah *"status 502"* | API belum sedia. Tunggu 15 saat, tekan F5. Masih gagal? `docker compose logs api` |

## Apa yang anda belajar

- Kini *deploy* = **satu *command***: `docker compose up -d --build`. Tiada lagi enam langkah.
- *Image* = kotak yang siap, *container* = kotak itu sedang berjalan, Compose = beberapa *container* bersama.
- *Volume* menyimpan data di luar *container*, jadi *container* boleh diganti bila-bila masa.
- Seterusnya: biar GitHub yang menaip *command* ini untuk kita.

## Fail yang berubah

`Dockerfile`, `api.Dockerfile`, `.dockerignore`, `compose.yaml`, `deploy/nginx/docker.conf` (semua baharu)
