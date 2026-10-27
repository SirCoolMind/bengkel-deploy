// Unit test untuk src/utils/format.js
// Jalankan: npm test   (GitHub Actions menjalankan command yang sama pada setiap push)
import { describe, expect, it } from 'vitest'
import { formatDate, formatPrice } from '../src/utils/format'

describe('formatPrice', () => {
  it('harga dipaparkan dengan sen: 4850 jadi 4,850.00', () => {
    expect(formatPrice(4850)).toBe('4,850.00')
  })

  it('harga dalam bentuk teks juga boleh', () => {
    expect(formatPrice('1020.5')).toBe('1,020.50')
  })

  it('sen dipaparkan dengan betul', () => {
    expect(formatPrice(34230.75)).toBe('34,230.75')
  })
})

describe('formatDate', () => {
  it('tarikh dipaparkan dalam Bahasa Melayu', () => {
    expect(formatDate('2024-03-12')).toBe('12 Mac 2024')
  })

  it('tiada tarikh: paparkan "-"', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
  })
})
