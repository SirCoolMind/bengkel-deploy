<script setup>
// Dialog borang untuk TAMBAH dan KEMASKINI aset.
// Ia tidak memanggil API sendiri — ia hanya emit('save', data) bila borang sah.
import { ref, watch, nextTick } from 'vue'
import { CATEGORIES, STATUSES } from '../constants'
import { createRules, localToday } from '../utils/rules'

const props = defineProps({
  open: Boolean, // adakah dialog dibuka?
  asset: { type: Object, default: null }, // aset untuk dikemaskini; null = tambah baharu
  saving: Boolean, // induk sedang menyimpan?
})

const emit = defineEmits(['close', 'save'])

function emptyForm() {
  return { name: '', category: null, serialNo: '', purchaseDate: '', price: null, status: 'Aktif' }
}

const form = ref(emptyForm())
const formRef = ref(null)
const today = localToday()
const rules = createRules(today) // peraturan dalam src/utils/rules.js (diuji oleh npm test)

// watch: setiap kali dialog DIBUKA, isi borang dengan salinan aset (atau borang kosong)
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    form.value = props.asset ? { ...props.asset } : emptyForm()
    await nextTick()
    formRef.value?.resetValidation()
  },
)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (valid) emit('save', { ...form.value })
}
</script>

<template>
  <!-- Dialog dikawal oleh prop `open`. Klik di luar / Esc -> beritahu induk untuk tutup. -->
  <v-dialog :model-value="open" max-width="640" :persistent="saving" @update:model-value="emit('close')">
    <v-card
      :title="asset ? 'Kemaskini Aset' : 'Tambah Aset'"
      :prepend-icon="asset ? 'mdi-pencil-box' : 'mdi-plus-box'"
    >
      <v-form ref="formRef" @submit.prevent="submit">
        <v-card-text>
          <v-row density="compact">
            <v-col cols="12">
              <v-text-field v-model="form.name" label="Nama Aset" :rules="[rules.required]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.category" :items="CATEGORIES" label="Kategori" :rules="[rules.required]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.serialNo" label="No. Siri" :rules="[rules.required, rules.serialNo]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.purchaseDate"
                label="Tarikh Beli"
                type="date"
                :max="today"
                :rules="[rules.required, rules.notFuture]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.price"
                label="Harga"
                prefix="RM"
                type="number"
                :rules="[rules.required, rules.positive]"
              />
            </v-col>
            <v-col cols="12">
              <v-select v-model="form.status" :items="STATUSES" label="Status" :rules="[rules.required]" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="emit('close')">Batal</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="saving">Simpan</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
