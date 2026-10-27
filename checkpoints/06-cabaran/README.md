# 06 · Jawapan cabaran

Jawapan untuk `CABARAN.md` (latihan di rumah). Dibina di atas checkpoint 05.

Untuk melihat jawapan dalam projek anda:

```bash
npm run checkpoint 06
```

```
✔ Fail lama anda disimpan dalam backup/(tarikh-masa)/
✔ Siap: fail kini sama seperti checkpoint 06-cabaran
    BAHARU   .github/dependabot.yml
    BERUBAH  .github/workflows/ci.yml
    sama     ...   (fail lain)
  ...
  ⚠ GitHub hanya nampak fail dalam .github/ selepas anda commit dan push.
    Ikut langkah commit dan push dalam panduan di atas.
```

## Apa yang berubah

| Fail | Cabaran | Maksud |
|---|---|---|
| `.github/dependabot.yml` | 1 | Setiap minggu, GitHub menyemak versi baharu untuk *package* npm, *actions* dan *image* Docker, kemudian membuka *pull request* untuk anda |
| `.github/workflows/ci.yml` | 3 | `pull_request:` ditambah, supaya setiap *pull request* (termasuk dari Dependabot) di-*test*. *Job* `deploy` ada `if: github.event_name == 'push'`: *pull request* di-*test* sahaja, *deploy* hanya selepas *merge* |

Cabaran 2 (*badge* CI) ialah satu baris dalam `README.md` anda: lihat `CABARAN.md`.

Cari tanda `✨ CABARAN` dalam fail-fail di atas.

Untuk GitHub melihat fail-fail ini:

```bash
git add -A
git commit -m "Jawapan cabaran"
git push
```

## Fail yang berubah

`.github/dependabot.yml` (baharu), `.github/workflows/ci.yml` (berubah)
