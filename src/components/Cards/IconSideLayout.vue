<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  align: {
    default: 'left',
    validator: function validator(value) {
      return ['left', 'right'].includes(value);
    },
  },
  headerClass: {
    type: String,
    default: 'text-xs italic font-extrabold',
  },
  iconClass: String,
  iconSize: {
    type: String,
    default: null,
    validator: function validator(value) {
      return (
        ['2xs', 'xs', 'sm', 'lg', 'xl', '2xl', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].indexOf(
          value,
        ) > -1
      );
    },
  },
});
</script>

<template>
  <div class="flex items-center">
    <div class="w-14 flex items-center justify-center">
      <font-awesome-icon :icon="icon" :class="iconClass" :size="iconSize" />
    </div>
    <div class="w-full" :class="align === 'right' ? 'text-right' : 'text-left'">
      <div :class="headerClass">
        <slot name="header" />
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
