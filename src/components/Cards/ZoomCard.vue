<template>
  <div class="card-zoom" :class="`${color} ${customClass}`">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'bg-linear-to-bl from-10% from-yellow-400/50 via-transparent',
  },
  customClass: String,
});
</script>

<style scoped></style>
