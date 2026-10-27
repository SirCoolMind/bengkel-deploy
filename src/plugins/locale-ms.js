// Vuetify belum ada terjemahan Bahasa Melayu, jadi kita sediakan sendiri
// untuk teks yang digunakan dalam aplikasi ini. Teks lain kekal Bahasa Inggeris.
import { en } from 'vuetify/locale'

export const ms = {
  ...en,
  close: 'Tutup',
  noDataText: 'Tiada data',
  dataIterator: {
    ...en.dataIterator,
    noResultsText: 'Tiada rekod yang sepadan',
    loadingText: 'Memuatkan data...',
  },
  dataTable: {
    ...en.dataTable,
    itemsPerPageText: 'Baris setiap halaman:',
    sortBy: 'Susun ikut',
  },
  dataFooter: {
    ...en.dataFooter,
    itemsPerPageText: 'Item setiap halaman:',
    itemsPerPageAll: 'Semua',
    nextPage: 'Halaman seterusnya',
    prevPage: 'Halaman sebelumnya',
    firstPage: 'Halaman pertama',
    lastPage: 'Halaman terakhir',
    pageText: '{0}-{1} daripada {2}',
  },
  input: {
    ...en.input,
    clear: 'Kosongkan {0}',
  },
}
