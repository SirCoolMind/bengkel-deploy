# Rujukan: *pipeline* yang sama untuk GitLab

Pejabat anda menggunakan GitLab (gitlab.com, atau GitLab sendiri di pusat data)? Semua yang anda belajar
dalam bengkel ini sama: hanya format fail yang berbeza.

`.gitlab-ci.yml` dalam folder ini membuat perkara yang sama seperti `.github/workflows/ci.yml` (checkpoint 05):
*test* dan *build* pada setiap *push* ke `main`, kemudian *deploy* dengan `docker compose` di *server* anda.

## Perkataan yang sama, nama yang berbeza

| GitHub Actions | GitLab CI/CD |
|---|---|
| `.github/workflows/ci.yml` | `.gitlab-ci.yml` (di folder utama repo) |
| *workflow* → *job* → *steps* | *pipeline* → *stage* → *job* → *script* |
| `runs-on: ubuntu-latest` | `image: node:22` pada *shared runner* |
| `runs-on: self-hosted` | GitLab Runner dengan `tags:` |
| `needs: test` | `stages: [test, deploy]` (ikut urutan) |
| `actions/checkout` | automatik |
| *Secrets & variables* | **Settings** → **CI/CD** → **Variables** (*masked*, *protected*) |
| Tab **Actions** | **Build** → **Pipelines** |
| *Pull request* | *Merge request* |
| ghcr.io | GitLab Container Registry (`$CI_REGISTRY_IMAGE`) |

## Daftar GitLab Runner di *server* (ringkas)

1. *Install* GitLab Runner: https://docs.gitlab.com/runner/install/linux-repository/
2. Projek anda di GitLab → **Settings** → **CI/CD** → **Runners** → **New project runner** → *tag* `server` → **Create runner**.
3. Salin *command* yang dipaparkan, contohnya:

   ```bash
   sudo gitlab-runner register --url https://gitlab.com --token glrt-XXXXX
   ```

   Pilih *executor* **shell**, supaya *job* boleh menjalankan `docker compose` terus di *server*.
4. Benarkan pengguna `gitlab-runner` menggunakan Docker:

   ```bash
   sudo usermod -aG docker gitlab-runner
   ```

Sama seperti *runner* GitHub, GitLab Runner hanya membuat sambungan **keluar** ke GitLab, jadi ia berfungsi
untuk *server* di belakang *firewall*.

## Akaun gitlab.com percuma

Semak had semasa di https://about.gitlab.com/pricing/ (minit CI/CD sebulan, pengesahan akaun).
Akaun baharu mungkin perlu mengesahkan identiti (nombor telefon atau kad) sebelum menggunakan *shared runner*.
Untuk GitLab di pusat data sendiri, tanya pasukan infrastruktur anda tentang *runner* yang disediakan.
