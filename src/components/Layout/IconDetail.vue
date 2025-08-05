<template>
  <div class="flex flex-row items-center">
    <div class="w-12 flex-freeze text-center">
      <font-awesome-icon :icon="icon" size="xl" :class="titleColor" />
    </div>
    <div class="w-full">
      <p class="text-sm font-extrabold" :class="titleColor"><slot name="title" /></p>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  titleColor: {
    type: String,
    default: 'text-primary-alt',
  },
});
</script>

<style scoped></style>
