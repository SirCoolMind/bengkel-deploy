// Unit test untuk src/services/api.js
// fetch() diganti dengan fungsi palsu: test tidak memerlukan server sebenar.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { assetApi } from '../src/services/api'

function fetchPalsu(body, status = 200) {
  const fn = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('assetApi.list', () => {
  it('memanggil /api/assets dengan page, sort dan filter', async () => {
    const fetch = fetchPalsu({ data: [{ id: '1' }], items: 25 })

    const result = await assetApi.list({
      page: 2,
      itemsPerPage: 10,
      sortBy: [{ key: 'price', order: 'desc' }],
      status: 'Rosak',
    })

    const url = new URL(fetch.mock.calls[0][0], 'http://localhost')
    expect(url.pathname).toBe('/api/assets')
    expect(url.searchParams.get('_page')).toBe('2')
    expect(url.searchParams.get('_per_page')).toBe('10')
    expect(url.searchParams.get('_sort')).toBe('-price')
    expect(JSON.parse(url.searchParams.get('_where'))).toEqual({ status: { eq: 'Rosak' } })
    expect(result).toEqual({ items: [{ id: '1' }], total: 25 })
  })

  it('tanpa pilihan: aset terbaru dahulu', async () => {
    const fetch = fetchPalsu([])
    await assetApi.list()
    expect(fetch.mock.calls[0][0]).toContain('_sort=-createdAt')
  })

  it('server gagal: tunjuk error', async () => {
    fetchPalsu({}, 500)
    await expect(assetApi.list()).rejects.toThrow('status 500')
  })
})

describe('assetApi.create', () => {
  it('tambah aset: hantar POST dengan createdAt', async () => {
    const fetch = fetchPalsu({ id: 'baru' }, 201)
    await assetApi.create({ name: 'Lenovo Tab M10' })

    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/assets')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body)
    expect(body.name).toBe('Lenovo Tab M10')
    expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
