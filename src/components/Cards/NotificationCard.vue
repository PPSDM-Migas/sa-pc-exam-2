<template>
  <!-- Container card -->
  <div class="mt-1 card-notification" :class="headerColorConfiguration">
    <div class="absolute -left-3">
      <div class="card-notification-icon">
        <font-awesome-icon size="xl" :icon="iconSelection" class="ml-0.5" />
      </div>
    </div>
    <div class="relative card-container">
      <!-- Header -->
      <div class="card-header text-white">
        {{ title }}
      </div>

      <!-- Content -->
      <div class="card-content" :class="[colorConfiguration, padding, scrollConfiguration]">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { mixins } from '@/Mixins/mixinDeprecate';

const props = defineProps({
  /**
   * Konfigurasi warna kartu.
   * Default: 'normal'.
   * Possible options: 'normal', 'sub', define sendiri dengan class Tailwind.
   */
  color: {
    type: String,
    default: 'normal',
  },
  /**
   * Konfigurasi warna header, border, dan gambar icon.
   * Default: 'primary'.
   * Possible options: 'red', 'blue', 'green', 'primary'.
   */
  borderColor: {
    type: String,
    default: 'primary',
  },
  /**
   * Custom icon apabila tidak ingin sesuai dengan configurasi border.
   */
  icon: String,
  /**
   * Batas tinggi dari BODY card, isi dengan class Tailwind.
   * Apabila props ini diisi maka body akan memiliki 'overflow-y-scroll'.
   */
  maxHeight: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    default: 'Info',
  },
});

// ========= Color Configuration ===========
/**
 * Warna dari body card sesuai dengan props color
 * @return {String|string}
 */
const colorConfiguration = computed(() => mixins.cardColorSet(props.color));
/**
 * Warna dari header card sesuai dengan props headerColor
 * @return {string|*}
 */
const headerColorConfiguration = computed(() => {
  const returnVal = {
    red: 'notification-red',
    blue: 'notification-blue',
    green: 'notification-green',
  }[props.borderColor];

  return returnVal ?? 'notification-default';
});

// ========= Behavior Configuration ===========
/**
 * Konfigurasi apakah body bisa di scroll atau tidak. Bergantung pada props maxHeight
 * @return {string|*}
 */
const scrollConfiguration = computed(() => (props.maxHeight ? `overflow-y-auto ${props.maxHeight}` : ''));

/**
 * Konfigurasi padding untuk card body. Bergantung pada props noPadding
 * @return {string}
 */
const padding = computed(() => (!props.noPadding ? 'px-4 pb-4 pt-6' : ''));

const iconSelection = computed(() => {
  if (props.icon) return props.icon;
  const selection = {
    red: 'exclamation-circle',
    green: 'check-circle',
    blue: 'info-circle',
  }[props.borderColor];

  return selection ?? 'question-circle';
});
</script>

<style scoped></style>
