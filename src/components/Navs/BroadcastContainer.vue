<script setup>
import { faBroadcastTower, faBullhorn, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: 'warning',
    validator(value) {
      return ['info', 'warning', 'danger'].includes(value);
    },
  },
  title: String,
  content: String,
});

const icon = computed(() => {
  const icons = {
    info: faBullhorn,
    warning: faExclamationTriangle,
    danger: faExclamationTriangle,
  };
  return icons[props.color] || faBullhorn;
});

const colors = computed(() => {
  const defaultVal = {
    bg: 'bg-blue-500 text-white',
    icon: 'bg-blue-700 text-white',
  };
  const icons = {
    info: defaultVal,
    warning: {
      bg: 'bg-yellow-500',
      icon: 'bg-yellow-700 text-white',
    },
    danger: {
      bg: 'bg-red-500 text-white',
      icon: 'bg-red-700 text-white',
    },
  };
  return icons[props.color] || defaultVal;
});
</script>

<template>
  <div class="px-2 py-1 flex gap-2 sticky top-0" :class="colors.bg">
    <div class="all-center">
      <div class="h-10 w-10 all-center rounded-xl" :class="colors.icon">
        <font-awesome-icon :icon="icon"></font-awesome-icon>
      </div>
    </div>
    <div class="w-full text-center text-sm">
      <p class="font-extrabold text-xs italic">Pesan siaran sistem:</p>
      <!-- eslint-disable-next-line vue/ no-v-html -->
      <p v-html="content"></p>
    </div>
  </div>
</template>

<style scoped></style>
