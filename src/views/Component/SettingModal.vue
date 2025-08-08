<script setup>
import DialogModal from "@/components/Modals/DialogModal.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import {useI18n} from "vue-i18n";
import {onMounted, reactive, ref, watch} from "vue";
import {changeDarkMode, defaultDarkModeCheck} from "@/assets/js/Mixins/TreeShake/browserBehavior.js";
import BasicButton from "@/components/Buttons/BasicButton.vue";
import {faMagnifyingGlass, faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {invoke} from "@tauri-apps/api/core";
import FormInput from "@/components/Forms/FormInput.vue";

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


const autoOff = reactive({
  showPassword: false,
  value: false,
  passInput: '',
});
const checkInput = async () => {
  try {
    const isValid = await invoke('validate_input', { userInput: autoOff.passInput }).then((res) => {
      if (res) {
        autoOff.value = !autoOff.value;
        localStorage.setItem('internalMode', autoOff.value ? 'insite' : 'external');
        window.location.reload();
      } else {
        autoOff.passInput = '';
        autoOff.showPassword = false;
      }
    })
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  selectColor.value = defaultDarkModeCheck() ? 'dark' : 'light';
  autoOff.value = localStorage.getItem('internalMode') === 'insite';
})
</script>

<template>
  <DialogModal :show="show" @close="emit('close')">
    <template #title>Pengaturan Aplikasi</template>
    <template #content>
      <div class="grid grid-cols-1 divide-y divide-gray-500">
        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Bahasa</h4>
            <p class="text-sm">Pengantar Aplikasi (Tidak termasuk pertanyaan)</p>
          </div>
          <div>
            <FormSelect id="lang" v-model="selectLang" :options="langs" option-key="value" option-label="label"></FormSelect>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Mode Warna</h4>
            <p class="text-sm">Gelap/Terang</p>
          </div>
          <div>
            <FormSelect id="lang" v-model="selectColor" :options="colors" option-key="value" option-label="label"></FormSelect>
          </div>
        </div>

        <div v-if="onCheckUpdate" class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Cek Versi Terbaru</h4>
            <p class="text-sm">Mengecek apakah ada versi terbaru dan mengunduhnya.</p>
          </div>
          <div class="flex justify-end">
            <BasicButton :icon="faMagnifyingGlass" @click="emit('checkUpdate')">Cek</BasicButton>
          </div>
        </div>

        <div v-if="onCheckUpdate" class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Mode Internal</h4>
            <p class="text-sm">Membantu menjaga perangkat dengan auto shutdown, Untuk PC Pribadi tidak usah dinyalakan :)</p>
            <p class="text-xs italic">Sebagai Pengaman, apabila password benar maka aplikasi akan reload dan warna background berubah.</p>
          </div>
          <div v-if="!autoOff.showPassword" class="flex justify-end">
            <BasicButton :icon="faPowerOff" :color="autoOff.value ? 'green' : 'red'" @click="autoOff.showPassword = true">Rubah</BasicButton>
          </div>
          <div v-else class="flex gap-2 items-center">
            <FormInput id="label" label="Password Sistem" v-model="autoOff.passInput" class="w-full" autocomplete="off" />
            <BasicButton icon="paper-plane" class="flex-shrink-0" @click="checkInput" />
            <BasicButton icon="times"  class="flex-shrink-0" color="red" @click="autoOff.showPassword = false" />
          </div>
        </div>
      </div>
    </template>
  </DialogModal>
</template>

<style scoped>

</style>
