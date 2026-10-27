<script setup>
// Dialog pengesahan yang boleh diguna semula di mana-mana.
// Teks mesej diberi melalui <slot> (lihat penggunaannya dalam App.vue).
defineProps({
  open: Boolean,
  title: { type: String, default: 'Anda pasti?' },
  confirmText: { type: String, default: 'Ya' },
  confirmColor: { type: String, default: 'primary' },
  loading: Boolean,
})

const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <v-dialog :model-value="open" max-width="440" :persistent="loading" @update:model-value="emit('cancel')">
    <v-card :title="title" prepend-icon="mdi-alert-circle-outline">
      <v-card-text>
        <!-- Kandungan di antara <ConfirmDialog> ... </ConfirmDialog> akan dipaparkan di sini -->
        <slot />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="emit('cancel')">Batal</v-btn>
        <v-btn :color="confirmColor" variant="flat" :loading="loading" @click="emit('confirm')">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
