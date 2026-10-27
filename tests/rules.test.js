// Unit test untuk src/utils/rules.js (semakan borang aset)
import { describe, expect, it } from 'vitest'
import { createRules } from '../src/utils/rules'

// Tarikh "hari ini" ditetapkan supaya test sentiasa memberi keputusan yang sama
const rules = createRules('2026-10-26')

describe('semakan borang', () => {
  it('wajib diisi: kotak kosong ditolak', () => {
    expect(rules.required('')).toBe('Medan ini wajib diisi')
    expect(rules.required(null)).toBe('Medan ini wajib diisi')
    expect(rules.required('Dell Latitude 5440')).toBe(true)
  })

  it('no. siri: sekurang-kurangnya 5 huruf', () => {
    expect(rules.serialNo('AB12')).toBe('No. siri mesti sekurang-kurangnya 5 aksara')
    expect(rules.serialNo('DEKX2Q73AB')).toBe(true)
  })

  it('harga: mesti lebih daripada 0', () => {
    expect(rules.positive(0)).toBe('Harga mesti lebih daripada RM 0')
    expect(rules.positive(-10)).toBe('Harga mesti lebih daripada RM 0')
    expect(rules.positive(4850)).toBe(true)
  })

  it('tarikh beli: tidak boleh selepas hari ini', () => {
    expect(rules.notFuture('2026-10-27')).toBe('Tarikh beli tidak boleh selepas hari ini')
    expect(rules.notFuture('2026-10-26')).toBe(true)
    expect(rules.notFuture('')).toBe(true)
  })
})
