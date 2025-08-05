<template>
  <div class="card-zoom" :class="`${color} ${customClass}`">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'bg-linear-to-bl from-yellow-400 to-blue-500',
  },
  customClass: String,
});
</script>

<style scoped></style>
