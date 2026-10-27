// Semua panggilan ke API diletakkan di SATU tempat.
// Komponen tidak perlu tahu tentang URL, header atau kaedah HTTP —
// mereka hanya panggil assetApi.list(), assetApi.create(...), dan seterusnya.
//
// Jika suatu hari backend bertukar (contoh: Laravel), hanya fail ini yang perlu diubah.

// Alamat API. Lalai: /api pada pelayan yang sama.
//   npm run dev → Vite menghantar /api ke json-server (vite.config.js)
//   pelayan     → Nginx menghantar /api ke API (PM2 atau Docker)
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Fungsi pembantu: panggil API, semak status, pulangkan data JSON
async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Aplikasi membalas status ${response.status}`)
  }

  // 204 = berjaya tetapi tiada kandungan (biasa untuk DELETE di sesetengah backend)
  return response.status === 204 ? null : response.json()
}

export const assetApi = {
  // Ambil SATU HALAMAN data sahaja. Pelayan yang menapis, menyusun & memecah halaman.
  //
  // Contoh URL yang dihasilkan:
  //   /assets?_page=2&_per_page=10&_sort=-price&_where={"status":{"eq":"Aktif"},"or":[...]}
  //
  // Pulangkan: { items: [...rekod halaman ini], total: jumlah semua rekod yang sepadan }
  async list({ page = 1, itemsPerPage = 10, sortBy = [], search = '', status = null } = {}) {
    const params = new URLSearchParams()

    // Halaman. itemsPerPage = -1 bermaksud "Semua" (tiada pemecahan halaman)
    if (itemsPerPage > 0) {
      params.set('_page', page)
      params.set('_per_page', itemsPerPage)
    }

    // Susunan. Tanda "-" di depan = menurun (desc). Lalai: terbaru dahulu.
    const sort = sortBy[0]
    params.set('_sort', sort ? `${sort.order === 'desc' ? '-' : ''}${sort.key}` : '-createdAt')

    // Tapisan. Syarat di peringkat atas digabung dengan DAN; "or" = mana-mana satu.
    const where = {}
    if (status) {
      where.status = { eq: status }
    }
    if (search) {
      where.or = [
        { name: { contains: search } },
        { category: { contains: search } },
        { serialNo: { contains: search } },
      ]
    }
    if (Object.keys(where).length) {
      params.set('_where', JSON.stringify(where))
    }

    const result = await request(`/assets?${params}`)

    // Dengan _page, json-server membalas { data: [...], items: <jumlah> }.
    // Tanpa _page, ia membalas senarai biasa [...].
    if (Array.isArray(result)) {
      return { items: result, total: result.length }
    }
    return { items: result.data, total: result.items }
  },

  // POST /assets
  create(asset) {
    return request('/assets', {
      method: 'POST',
      body: { ...asset, createdAt: new Date().toISOString() },
    })
  },

  // PUT /assets/:id
  update(asset) {
    return request(`/assets/${asset.id}`, { method: 'PUT', body: asset })
  },

  // DELETE /assets/:id
  remove(id) {
    return request(`/assets/${id}`, { method: 'DELETE' })
  },
}
