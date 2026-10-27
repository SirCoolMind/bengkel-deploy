<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import AssetTable from './components/AssetTable.vue'
import AssetFormDialog from './components/AssetFormDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { STATUSES } from './constants'
import { assetApi } from './services/api'
import { buildInfo, formatBuildTime } from './build-info'

// ---------- Tema gelap / cerah ----------
const theme = useTheme()

// ---------- Senarai (READ) — dari server, satu halaman pada satu masa ----------
const assets = ref([]) // rekod halaman semasa
const total = ref(0) // jumlah semua rekod yang sepadan
const loading = ref(false)
const errorMessage = ref('')

// Pilihan semasa jadual (halaman, bilangan setiap halaman, susunan)
const tableOptions = ref({ page: 1, itemsPerPage: 10, sortBy: [] })

// Carian & tapisan kini dihantar ke server
const search = ref('')
const statusFilter = ref(null)

// Bila carian ATAU tapisan berubah, jadual mesti kembali ke halaman 1 dan ambil data semula.
// v-data-table-server melakukannya secara automatik bila prop `search` berubah,
// jadi kita gabungkan kedua-duanya menjadi satu "kunci tapisan".
const filterKey = computed(() => `${search.value ?? ''}|${statusFilter.value ?? ''}`)

// Dipanggil oleh jadual (update:options) semasa mula dipaparkan dan setiap kali halaman/susunan berubah.
function onTableOptions(options) {
  tableOptions.value = options
  fetchAssets()
}

async function fetchAssets() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await assetApi.list({
      page: tableOptions.value.page,
      itemsPerPage: tableOptions.value.itemsPerPage,
      sortBy: tableOptions.value.sortBy,
      search: search.value,
      status: statusFilter.value,
    })
    assets.value = result.items
    total.value = result.total
  } catch (error) {
    errorMessage.value = `Gagal memuatkan data (${error.message}). Pastikan API sedang berjalan.`
  } finally {
    loading.value = false
  }
}

// ---------- Tambah (CREATE) & Kemaskini (UPDATE) ----------
const formOpen = ref(false)
const editingAsset = ref(null)
const saving = ref(false)

function openCreate() {
  editingAsset.value = null
  formOpen.value = true
}

function openEdit(asset) {
  editingAsset.value = asset
  formOpen.value = true
}

async function saveAsset(data) {
  const isEditing = Boolean(data.id)
  saving.value = true
  try {
    if (isEditing) {
      await assetApi.update(data)
    } else {
      await assetApi.create(data)
    }
    formOpen.value = false
    showMessage(isEditing ? 'Aset berjaya dikemaskini' : 'Aset berjaya ditambah')
    fetchAssets()
  } catch (error) {
    showMessage(`Gagal menyimpan: ${error.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// ---------- Padam (DELETE) ----------
const deleteDialog = ref(false)
const assetToDelete = ref(null)
const deleting = ref(false)

function confirmDelete(asset) {
  assetToDelete.value = asset
  deleteDialog.value = true
}

async function deleteAsset() {
  deleting.value = true
  try {
    await assetApi.remove(assetToDelete.value.id)
    showMessage('Aset telah dipadam')
    fetchAssets()
  } catch (error) {
    showMessage(`Gagal memadam: ${error.message}`, 'error')
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

// ---------- Notifikasi ----------
const snackbar = ref({ show: false, text: '', color: 'success' })

function showMessage(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <template #prepend>
        <v-icon icon="mdi-laptop" class="ml-3" />
      </template>
      <v-app-bar-title>Inventori Aset ICT</v-app-bar-title>

      <!-- butang tukar tema. theme.toggle() bertukar antara 'light' dan 'dark' -->
      <template #append>
        <v-btn
          :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="theme.toggle()"
        />
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <v-card>
          <v-card-item prepend-icon="mdi-format-list-bulleted" title="Senarai Aset" :subtitle="`${total} aset`">
            <template #append>
              <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openCreate">
                Tambah Aset
              </v-btn>
            </template>
          </v-card-item>

          <v-card-text class="d-flex flex-wrap ga-3">
            <v-text-field
              v-model="search"
              label="Cari nama, kategori atau no. siri"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 260px"
            />
            <v-select
              v-model="statusFilter"
              :items="STATUSES"
              label="Tapis ikut status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="max-width: 220px"
            />
          </v-card-text>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mx-4 mb-4" :text="errorMessage">
            <template #append>
              <v-btn variant="text" prepend-icon="mdi-refresh" @click="fetchAssets">Cuba lagi</v-btn>
            </template>
          </v-alert>

          <AssetTable
            :items="assets"
            :total="total"
            :loading="loading"
            :search="filterKey"
            @update:options="onTableOptions"
            @edit="openEdit"
            @delete="confirmDelete"
          />
        </v-card>
      </v-container>
    </v-main>

    <!-- Versi yang sedang berjalan: berubah selepas setiap deploy (lihat src/build-info.js) -->
    <v-footer app height="36" class="justify-center ga-2 text-body-small text-medium-emphasis">
      <span>Versi {{ buildInfo.version }}</span>
      <span>·</span>
      <span>commit <code>{{ buildInfo.commit }}</code></span>
      <span>·</span>
      <span>dibina {{ formatBuildTime(buildInfo.builtAt) }}</span>
      <v-chip
        :color="buildInfo.production ? 'success' : 'warning'"
        size="x-small"
        variant="flat"
        :text="buildInfo.production ? 'Production' : 'Development'"
      />
    </v-footer>

    <AssetFormDialog
      :open="formOpen"
      :asset="editingAsset"
      :saving="saving"
      @close="formOpen = false"
      @save="saveAsset"
    />

    <ConfirmDialog
      :open="deleteDialog"
      title="Padam aset?"
      confirm-text="Padam"
      confirm-color="error"
      :loading="deleting"
      @cancel="deleteDialog = false"
      @confirm="deleteAsset"
    >
      Aset <strong>{{ assetToDelete?.name }}</strong> ({{ assetToDelete?.serialNo }})
      akan dipadam. Tindakan ini tidak boleh dibatalkan.
    </ConfirmDialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>
