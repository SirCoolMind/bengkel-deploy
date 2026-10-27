# Cabaran: latihan di rumah

Pilihan, selepas bengkel. Setiap cabaran dibina di atas checkpoint 05.
Jawapan: `checkpoints/06-cabaran` (cari tanda `✨ CABARAN` dalam fail).

Untuk setiap cabaran: buka Codespace anda (https://github.com/codespaces → klik nama Codespace), ubah fail,
simpan (**Ctrl + S**), kemudian *commit* dan *push*:

```bash
git add -A
git commit -m "Cabaran 1"
git push
```

---

## Cabaran 1: Dependabot (~10 minit)

**Situasi:** *package* npm, *actions* (contoh `actions/checkout@v7`) dan *image* Docker (contoh `node:22-alpine`)
sentiasa mengeluarkan versi baharu, termasuk pembaikan keselamatan. Tiada siapa ingat untuk menyemaknya.

**Tugasan:** minta GitHub menyemak setiap minggu dan membuka *pull request* secara automatik.

<details>
<summary>Petunjuk (klik untuk buka)</summary>

1. Di *Explorer*, klik kanan pada folder `.github` (bukan `workflows`) → **New File** → taip `dependabot.yml`, tekan Enter.
2. Fail itu bermula dengan `version: 2`, kemudian senarai `updates:`.
3. Satu entri untuk setiap jenis: `npm`, `github-actions`, `docker`. Setiap satu perlu `directory: /` dan
   `schedule:` dengan `interval: weekly`.
4. Contoh lengkap: https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference

</details>

**Semak:** repo anda di GitHub → tab **Insights** → **Dependency graph** → tab **Dependabot**: tiga baris, tiada *error*.

---

## Cabaran 2: *badge* CI dalam README (~5 minit)

**Tugasan:** paparkan status CI/CD (✅ atau ❌) di bahagian atas `README.md` repo anda.

<details>
<summary>Petunjuk (klik untuk buka)</summary>

1. Repo anda di GitHub → tab **Actions** → klik **CI/CD** di menu kiri.
2. Klik butang **⋯** (kanan atas) → **Create status badge** → **Copy status badge Markdown**.
3. Dalam Codespace, buka `README.md` sebagai teks: klik kanan pada `README.md` di *Explorer* →
   **Open With...** → **Text Editor**.
4. *Paste* di baris pertama. Simpan, *commit*, *push*.

Atau tulis sendiri (tukar `username-anda` dan `bengkel-deploy`):

```markdown
![CI/CD](https://github.com/username-anda/bengkel-deploy/actions/workflows/ci.yml/badge.svg)
```

</details>

**Semak:** halaman utama repo anda di GitHub menunjukkan *badge* hijau.

---

## Cabaran 3: lindungi *branch* `main` (~15 minit)

**Situasi:** sesiapa (termasuk anda, pada petang Jumaat) boleh *push* kod rosak terus ke `main`, dan CD akan
cuba *deploy*. Pasukan mahu setiap perubahan melalui ***pull request*** yang di-*test* dahulu.

**Tugasan:**
1. CI men-*test* *pull request* juga, tetapi **tidak** *deploy* *pull request*.
2. `main` tidak boleh diubah tanpa *pull request*, dan *pull request* tidak boleh di-*merge* jika
   **Test & build** gagal.

> ⚠ Peraturan *branch* (*rulesets*) untuk repo **Private** memerlukan GitHub Pro (berbayar). Dengan akaun
> percuma, anda perlu menukar repo kepada **Public**: **Settings** → **General** → bahagian **Danger Zone** →
> **Change visibility**.
>
> **Sebelum** menukar kepada Public: **Settings** → **Actions** → **General** → bahagian
> *Approval for running fork pull request workflows from contributors* → pilih
> **Require approval for all external contributors** → **Save**. Pada repo Public, sesiapa boleh membuka
> *pull request*. Tetapan ini memastikan kod orang lain tidak berjalan di *runner* anda tanpa kebenaran anda.

<details>
<summary>Petunjuk (klik untuk buka)</summary>

- `ci.yml`: tambah `pull_request:` (dengan `branches: [main]`) di bawah `on:`.
- *Job* `deploy`: tambah `if: github.event_name == 'push'`, supaya ia dilangkau untuk *pull request*.
- GitHub → **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**:
  - **Ruleset name**: `lindungi-main`, **Enforcement status**: **Active**
  - **Target branches** → **Add target** → **Include default branch**
  - Tandakan **Require a pull request before merging**
  - Tandakan **Require status checks to pass** → **Add checks** → taip `Test & build` → pilih
  - Klik **Create**

</details>

**Semak:**
- [ ] `git push` terus ke `main` ditolak.
- [ ] *Branch* baharu + *pull request*: **Test & build** berjalan, **Deploy ke server** dilangkau.
- [ ] Pecahkan *test* dalam *pull request* itu: butang **Merge** tidak boleh ditekan.
- [ ] Betulkan, kemudian *merge*: **Deploy ke server** berjalan selepas *merge*.

<details>
<summary>Cara membuat *branch* dan *pull request* dari Codespace</summary>

```bash
git switch -c tajuk-baharu          # cipta branch baharu bernama tajuk-baharu
# ubah fail, Ctrl + S
git add -A
git commit -m "Tukar tajuk"
git push -u origin tajuk-baharu     # hantar branch itu ke GitHub
```

Kemudian di GitHub, kotak kuning *"tajuk-baharu had recent pushes"* muncul → **Compare & pull request** →
**Create pull request**.

</details>

---

Untuk melihat jawapan dalam projek anda:

```bash
npm run checkpoint 06
```
