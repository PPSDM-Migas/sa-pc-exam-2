<script setup>
import ToastContainer from "@/components/Toasts/ToastContainer.vue";
import {computed, onMounted, ref, watch} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {mixins} from "@/assets/js/Mixins/mixinDeprecate.js";
import BasicCard from "@/components/Cards/BasicCard.vue";
import packageJson from '/package.json';
import {useI18n} from "vue-i18n";
import {Switch} from "@headlessui/vue";
import idFlag from '@/assets/img/svg/indonesia.svg';
import enFlag from '@/assets/img/svg/united-kingdom.svg';

const appVersion = ref(packageJson.version);

const emits = defineEmits(['leftCorner', 'rightCorner']);

const emitEvent = () => {
  emits('leftCorner');
}

const props = defineProps({
  leftBtnIcon: String,
  rightBtnIcon: String,
  leftBtnClass: String,
  rightBtnClass: String,
});

const toast = ref(null);
function manualPushToast(content) {
  toast.value.pushIntoQueue(content);
}

const enLang = ref(null);
defineExpose({
  manualPushToast,
})

const withTimer = ref(false)
onMounted(() => {
  mixins.defaultDarkModeCheck();
  console.log([localStorage.getItem('internalMode') === 'insite', localStorage.getItem('internalMode')])
  withTimer.value = localStorage.getItem('internalMode') === 'insite';
  enLang.value = localStorage.getItem('lang') === 'en';
})

const { t, tc, locale } = useI18n();

watch(enLang, () => {
  if (enLang.value) locale.value = 'en';
  else locale.value = 'id';

  localStorage.setItem('lang', locale.value);
})
</script>

<template>
  <div :class="`bg-island ${withTimer ? 'blue' : ''} layout-bg-center p-8 overflow-auto`">
    <ToastContainer ref="toast"/>

    <slot />

    <!-- The Footer -->
    <BasicCard color="sub" class="mt-8">
      <div class="text-sm text-ld text-center">
        <slot name="footer" />
        <p>sa-pc-ujian v{{appVersion}} - SuperApp PPSDM Migas &copy; 2025 PPSDM Migas</p>
      </div>
    </BasicCard>

    <div v-if="leftBtnIcon" class="corner-btn-container left">
      <div class="corner-left-btn" :class="leftBtnClass" @click="emits('leftCorner')">
        <font-awesome-icon :icon="leftBtnIcon" size="2xl" class="absolute z-[6] text-white" />
      </div>
    </div>

    <div v-if="rightBtnIcon" class="corner-btn-container right">
      <div class="corner-right-btn" :class="rightBtnClass" @click="emits('rightCorner')">
        <font-awesome-icon :icon="rightBtnIcon" size="2xl" class="absolute z-[6] text-white" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
