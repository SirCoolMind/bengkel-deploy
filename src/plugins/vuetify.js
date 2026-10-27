// Tetapan Vuetify untuk keseluruhan aplikasi
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@mdi/font/css/materialdesignicons.css' // ikon "mdi-..." (https://pictogrammers.com/library/mdi/)
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import { en } from 'vuetify/locale'
import { ms } from './locale-ms'

export default createVuetify({
  theme: {
    // Vuetify 4: tema lalai ialah 'system' (ikut tetapan komputer).
    // Kita tetapkan 'light' supaya semua peserta nampak paparan yang sama.
    defaultTheme: 'light',
    themes: {
      light: { colors: { primary: '#1565C0' } },
      dark: { colors: { primary: '#64B5F6' } },
    },
  },
  // Teks terbina dalam Vuetify (contoh: "Item setiap halaman") dalam Bahasa Melayu
  locale: {
    locale: 'ms',
    fallback: 'en',
    messages: { ms, en },
  },
})
