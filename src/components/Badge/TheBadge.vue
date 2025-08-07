<script setup>
defineProps({
  icon: [String, Array, Object],
  color: {
    type: String,
    color: 'green',
  },
});
</script>

<template>
  <span class="badge" :class="`${color}`">
    <font-awesome-icon v-if="icon" :icon="icon" class="mr-1"></font-awesome-icon>
    <slot />
  </span>
</template>

<style scoped>

</style>
