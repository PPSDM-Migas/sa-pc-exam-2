<script setup lang="ts">
defineProps({
  icon: [Array, String, Object],
  iconSize: {
    type: [String, Object, Array],
    default: 'xl',
  },
  title: String,
  align: {
    type: String,
    default: 'left',
    validator(value) {
      return ['left', 'right'].includes(value);
    },
  },
});
</script>

<template>
  <div class="flex gap-2 items-center">
    <div v-if="icon && align === 'left'" class="w-10 flex flex-shrink-0 flex-grow-0 justify-center">
      <font-awesome-icon :icon="icon" :size="iconSize"></font-awesome-icon>
    </div>
    <div class="w-full">
      <p class="text-xs italic font-extrabold text-primary" :class="align === 'right' ? 'text-right' : 'text-left'">
        {{ title }}
      </p>
      <slot />
    </div>
    <div v-if="icon && align === 'right'" class="w-10 flex flex-shrink-0 flex-grow-0 justify-center">
      <font-awesome-icon :icon="icon" :size="iconSize"></font-awesome-icon>
    </div>
  </div>
</template>

<style scoped></style>
