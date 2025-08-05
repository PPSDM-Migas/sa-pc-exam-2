<template>
  <!-- Masalah shadow -->
  <div>
    <!-- Container card -->
    <div
      :class="{
        'overflow-hidden': overflowing,
        'card-container': true,
        'no-animate': noAnimate,
      }"
    >
      <!-- Optional Popup -->
      <div v-if="hasPopUp" class="card-popup" :class="popupColorConfiguration">
        <slot name="popup" />
      </div>

      <div class="card-body">
        <!-- Header -->
        <div v-if="hasHeader" class="card-header" :class="headerColorConfiguration">
          <slot name="header" />
        </div>

        <!-- Content -->
        <div
          class="card-content"
          :class="[colorConfiguration, padding, scrollConfiguration, cornerConfig, customClass]"
        >
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="hasFooter" class="card-footer" :class="footerColorConfiguration">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
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
   * Konfigurasi warna footer.
   * Default: 'green'.
   * Possible options: 'red', 'yellow', 'blue', 'green', define sendiri dengan class Tailwind.
   */
  footerColor: {
    type: String,
    default: 'primary',
  },
  /**
   * Konfigurasi warna header.
   * Default: 'green'.
   * Possible options: 'red', 'yellow', 'blue', 'green', define sendiri dengan class Tailwind.
   */
  headerColor: {
    type: String,
    default: 'primary',
  },
  /**
   * Apakah content dari card diberi padding?.
   * Default: false.
   */
  noPadding: {
    type: Boolean,
    default: false,
  },
  /**
   * Konfigurasi warna popup (apabila ada popup).
   * Default: 'green'.
   * Possible options: 'red', 'yellow', 'blue', 'green', define sendiri dengan class Tailwind.
   */
  popupColor: {
    type: String,
    default: 'green',
  },
  /**
   * Batas tinggi dari BODY card, isi dengan class Tailwind.
   * Apabila props ini diisi maka body akan memiliki 'overflow-y-scroll'.
   */
  maxHeight: {
    type: String,
    required: false,
  },
  overflowing: Boolean,
  noAnimate: Boolean,
  customClass: String,
});
const slots = useSlots();

// ========= Corner Configuration ===========
/**
 * Mendeteksi apakah slot popup terisi atau tidak
 * @return {boolean}
 */
const hasPopUp = computed(() => !!slots.popup);
/**
 * Mendeteksi apakah slot header terisi atau tidak
 * @return {boolean}
 */
const hasHeader = computed(() => !!slots.header);
/**
 * Mendeteksi apakah slot footer terisi atau tidak
 * @return {boolean}
 */
const hasFooter = computed(() => !!slots.footer);

const cornerConfig = computed(() => {
  const classToApply = [];
  if (!hasHeader.value) classToApply.push('rounded-t-xl');
  if (!hasFooter.value) classToApply.push('rounded-b-xl');
  return classToApply.join(' ');
});

// ========= Color Configuration ===========
/**
 * Warna dari body card sesuai dengan props color
 * @return {String|string}
 */
const colorConfiguration = computed(() => mixins.cardColorSet(props.color));
/**
 * Warna dari footer card sesuai dengan props footerColor
 * @return {string|*}
 */
const footerColorConfiguration = computed(() => mixins.cardAttributeColorSet(props.footerColor));
/**
 * Warna dari header card sesuai dengan props headerColor
 * @return {string|*}
 */
const headerColorConfiguration = computed(() => mixins.cardAttributeColorSet(props.headerColor));
/**
 * Warna dari popup card sesuai dengan props popupColor
 * @return {string|*}
 */
const popupColorConfiguration = computed(() => mixins.cardPopupColorSet(props.popupColor));

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
const padding = computed(() => (!props.noPadding ? 'py-2 px-3' : ''));
</script>

<style scoped></style>
