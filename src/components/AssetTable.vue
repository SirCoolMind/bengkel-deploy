<script setup>
// Komponen ini HANYA memaparkan jadual.
// Menggunakan v-data-table-server — jadual tidak menapis/menyusun sendiri,
// sebaliknya ia memberitahu induk (update:options) halaman & susunan yang diminta.
import { STATUS_COLORS } from '../constants'
import { formatDate, formatPrice } from '../utils/format'

defineProps({
  items: { type: Array, required: true }, // rekod untuk halaman semasa SAHAJA
  total: { type: Number, default: 0 }, // jumlah SEMUA rekod di pelayan
  loading: Boolean,
  search: String, // bila nilai ini berubah, jadual kembali ke halaman 1
})

const emit = defineEmits(['edit', 'delete', 'update:options'])

const headers = [
  { title: 'Nama Aset', key: 'name' },
  { title: 'Kategori', key: 'category' },
  { title: 'No. Siri', key: 'serialNo' },
  { title: 'Tarikh Beli', key: 'purchaseDate' },
  { title: 'Harga (RM)', key: 'price', align: 'end' },
  { title: 'Status', key: 'status' },
  { title: 'Tindakan', key: 'actions', sortable: false, align: 'end' },
]
</script>

<template>
  <!-- items-length = jumlah keseluruhan, supaya jadual tahu berapa halaman yang ada -->
  <!-- update:options dipancarkan semasa mula dipaparkan, dan setiap kali halaman/susunan/carian berubah -->
  <v-data-table-server
    :headers="headers"
    :items="items"
    :items-length="total"
    :loading="loading"
    :search="search"
    @update:options="emit('update:options', $event)"
  >
    <template #item.name="{ item }">
      <span class="font-weight-medium">{{ item.name }}</span>
    </template>

    <template #item.purchaseDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.price="{ value }">
      {{ formatPrice(value) }}
    </template>

    <template #item.status="{ value }">
      <v-chip :color="STATUS_COLORS[value]" size="small" variant="flat">
        {{ value }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="emit('edit', item)" />
      <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="emit('delete', item)" />
    </template>
  </v-data-table-server>
</template>
