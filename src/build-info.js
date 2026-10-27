// Versi mana yang sedang berjalan? Nilai ini diisi semasa "npm run build"
// (lihat vite.config.js), jadi setiap deploy memaparkan commit yang dibina.
export const buildInfo = {
  version: import.meta.env.VITE_APP_VERSION,
  commit: import.meta.env.VITE_COMMIT_SHA,
  builtAt: import.meta.env.VITE_BUILD_TIME,
  production: import.meta.env.PROD, // true selepas "npm run build", false semasa "npm run dev"
}

export function formatBuildTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })
}
