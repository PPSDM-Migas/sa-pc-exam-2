<script setup>
import NotificationCard from '@/components/Cards/NotificationCard.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';

defineProps({
  loadFunction: {
    type: [Function, undefined],
    required: true,
  },
  error: {
    type: String,
    default: 'Terjadi kesalahan :(',
  },
});
</script>

<template>
  <NotificationCard border-color="red" title="Terjadi Kesalahan" icon="exclamation-triangle">
    <div class="text-center my-4 flex flex-col gap-2 items-center">
      <font-awesome-icon icon="heart-crack" size="3x" class="text-subtitle" beat />
      <p class="text-sm mt-2">
        {{ error }}
      </p>
      <basic-button icon="arrows-rotate" @click="loadFunction">Coba Lagi</basic-button>
    </div>
  </NotificationCard>
</template>

<style scoped></style>
