<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  haveFlag: Boolean,
  haveNote: Boolean,
  answered: Boolean,
  selected: Boolean,
});

const defineColor = computed(() => {
  if (props.answered) return 'bg-green-600 hover:bg-green-700 hover:dark:bg-green-700 font-extrabold text-white';
  if (props.haveNote) return 'bg-ternary hover:bg-ternary-alt hover:dark:bg-ternary-alt font-extrabold text-white';
  return 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 hover:dark:bg-blue-500';
});

const selectedBorder = computed(() => {
  if (props.selected) return 'ring-4 ring-primary dark:ring-primary';
  return '';
});
</script>

<template>
  <div class="overflow-hidden w-11 h-11 flex-shrink-0 relative rounded-lg" :class="[defineColor, selectedBorder]">
    <div v-if="haveFlag" class="w-full bg-secondary leading-[1] text-center absolute z-[1] text-white">
      <font-awesome-icon icon="flag" size="2xs" />
    </div>
    <div
      class="flex items-center justify-center w-full absolute bottom-0"
      :class="haveFlag ? 'h-3/4' : 'h-full'"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
