// Semakan borang aset (di-test dalam tests/rules.test.js).
// Setiap semakan pulangkan true (betul) atau mesej error.

// Tarikh hari ini ikut waktu komputer (bukan UTC), format "2026-10-26"
export function localToday() {
  return new Date().toLocaleDateString('en-CA')
}

export function createRules(today = localToday()) {
  return {
    required: (v) => !!v || 'Medan ini wajib diisi',
    serialNo: (v) => (v && v.length >= 5) || 'No. siri mesti sekurang-kurangnya 5 aksara',
    positive: (v) => v > 0 || 'Harga mesti lebih daripada RM 0',
    notFuture: (v) => !v || v <= today || 'Tarikh beli tidak boleh selepas hari ini',
  }
}
