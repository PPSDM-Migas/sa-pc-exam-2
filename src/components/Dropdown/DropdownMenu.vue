<script setup>
defineProps({
  icon: String,
  disabled: Boolean,
});
</script>

<template>
  <div
    :class="{
      'the-menu': true,
      disabled: disabled,
    }"
  >
    <div v-if="icon" class="icon">
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="py-1.5">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
