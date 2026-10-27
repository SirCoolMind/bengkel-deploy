// Fungsi format yang digunakan oleh jadual aset.
// Diletakkan dalam fail sendiri supaya boleh di-test (tests/format.test.js).

// 4850 → "4,850.00"
export function formatPrice(value) {
  return Number(value).toLocaleString('ms-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// "2024-03-12" → "12 Mac 2024"
export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
