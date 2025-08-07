<template>
  <button
    type="button"
    class="y__btn page-btn"
    :class="[props.currentPage ? 'y__btn-primary' : 'y__btn-secondary']"
    :disabled="disabled"
  >
    <font-awesome-icon v-if="icon" :icon="icon" :class="{ 'mr-2': $slots.default }" size="lg" />
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Icon di sebelah kiri tulisan di dalam button
   * Note: Apabila tidak ada props ini maka tag icon tidak akan di render
   * Default: null
   */
  icon: {
    type: [String, Array, Object],
    required: false,
  },
  currentPage: Boolean,
});
</script>

<style scoped></style>
