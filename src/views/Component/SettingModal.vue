<script setup>
import DialogModal from "@/components/Modals/DialogModal.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import {useI18n} from "vue-i18n";
import {onMounted, ref, watch} from "vue";
import {changeDarkMode, defaultDarkModeCheck} from "@/assets/js/Mixins/TreeShake/browserBehavior.js";
import BasicButton from "@/components/Buttons/BasicButton.vue";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";

defineProps({
  show: Boolean,
  onCheckUpdate: Function,
});

const emit = defineEmits(['close', 'checkUpdate']);

const selectLang = ref('id');
const { locale } = useI18n();
const langs = [
  {
    value: 'id',
    label: 'Indonesia',
  },
  {
    value: 'en',
    label: 'English',
  }
];
watch(selectLang, () => {
  locale.value = selectLang.value;
  localStorage.setItem('lang', locale.value);
})


const selectColor = ref('light');
const colors = [
  {
    value: 'light',
    label: 'Terang',
  },
  {
    value: 'dark',
    label: 'Gelap',
  }
];
watch(selectColor, () => {
  changeDarkMode(selectColor.value === 'dark');
});

onMounted(() => {
  selectColor.value = defaultDarkModeCheck() ? 'dark' : 'light';
})
</script>

<template>
  <DialogModal :show="show" @close="emit('close')">
    <template #title>Pengaturan Aplikasi</template>
    <template #content>
      <div class="grid grid-cols-1 gap-2 divide-y divide-gray-500">
        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center">
          <div>
            <h4>Bahasa</h4>
            <p class="text-sm">Pengantar Aplikasi (Tidak termasuk pertanyaan)</p>
          </div>
          <div>
            <FormSelect id="lang" v-model="selectLang" :options="langs" option-key="value" option-label="label"></FormSelect>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center">
          <div>
            <h4>Mode Warna</h4>
            <p class="text-sm">Gelap/Terang</p>
          </div>
          <div>
            <FormSelect id="lang" v-model="selectColor" :options="colors" option-key="value" option-label="label"></FormSelect>
          </div>
        </div>

        <div v-if="onCheckUpdate" class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center">
          <div>
            <h4>Cek Versi Terbaru</h4>
            <p class="text-sm">Mengecek apakah ada versi terbaru dan mengunduhnya.</p>
          </div>
          <div>
            <BasicButton :icon="faMagnifyingGlass" @click="emit('checkUpdate')">Cek</BasicButton>
          </div>
        </div>
      </div>
    </template>
  </DialogModal>
</template>

<style scoped>

</style>
