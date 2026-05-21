<script setup>
import DialogModal from "@/components/Modals/DialogModal.vue";
import FormSelect from "@/components/Forms/FormSelect.vue";
import {useI18n} from "vue-i18n";
import {onMounted, reactive, ref, watch} from "vue";
import {changeDarkMode, defaultDarkModeCheck} from "@/assets/js/Mixins/TreeShake/browserBehavior.js";
import BasicButton from "@/components/Buttons/BasicButton.vue";
import {faMagnifyingGlass, faLock} from "@fortawesome/free-solid-svg-icons";
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


const hidden = reactive({
  showPasswordModal: false,
  showHiddenModal: false,
  passInput: '',
  errorText: '',
  mode: 'external',
  action: 'hibernate',
  timer: 90,
});

const modes = [
  { value: 'external', label: 'External' },
  { value: 'insite', label: 'Internal (Insite)' },
];
const actions = [
  { value: 'hibernate', label: 'Hibernate' },
  { value: 'sleep', label: 'Sleep' },
];

let errorTimeout = null;

const openPasswordModal = () => {
  hidden.passInput = '';
  hidden.showPasswordModal = true;
};

const closePasswordModal = () => {
  hidden.passInput = '';
  hidden.showPasswordModal = false;
};

const checkInput = async () => {
  try {
    await invoke('validate_input', { userInput: hidden.passInput }).then((res) => {
      if (res) {
        hidden.showPasswordModal = false;
        hidden.passInput = '';
        hidden.mode = localStorage.getItem('internalMode') || 'external';
        hidden.action = localStorage.getItem('countdownAction') || 'hibernate';
        hidden.timer = parseInt(localStorage.getItem('shutdownTimer') || '90');
        hidden.showHiddenModal = true;
      } else {
        hidden.passInput = '';
        hidden.showPasswordModal = false;
        clearTimeout(errorTimeout);
        hidden.errorText = 'Password salah.';
        errorTimeout = setTimeout(() => { hidden.errorText = ''; }, 5000);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const applySettings = () => {
  const prevMode = localStorage.getItem('internalMode');
  const prevTimer = localStorage.getItem('shutdownTimer');
  const newTimer = String(parseInt(hidden.timer) || 0);

  localStorage.setItem('internalMode', hidden.mode);
  localStorage.setItem('countdownAction', hidden.action);
  localStorage.setItem('shutdownTimer', newTimer);

  hidden.showHiddenModal = false;

  const modeChanged = prevMode !== hidden.mode;
  const timerChanged = prevTimer !== newTimer;
  if (modeChanged || (hidden.mode === 'insite' && timerChanged)) {
    window.location.reload();
  }
};

const handleClose = () => {
  hidden.showPasswordModal = false;
  hidden.showHiddenModal = false;
  hidden.passInput = '';
  hidden.errorText = '';
  clearTimeout(errorTimeout);
  emit('close');
};

onMounted(() => {
  selectColor.value = defaultDarkModeCheck() ? 'dark' : 'light';
})
</script>

<template>
  <!-- Main settings modal -->
  <DialogModal :show="show" @close="handleClose">
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
            <h4>Pengaturan Tersembunyi</h4>
            <p class="text-sm">Konfigurasi lanjutan, dilindungi password.</p>
            <p v-if="hidden.errorText" class="text-xs text-red-500 mt-1">{{ hidden.errorText }}</p>
          </div>
          <div class="flex justify-end">
            <BasicButton :icon="faLock" @click="openPasswordModal">Buka</BasicButton>
          </div>
        </div>
      </div>
    </template>
  </DialogModal>

  <!-- Password modal -->
  <DialogModal :show="hidden.showPasswordModal" @close="closePasswordModal">
    <template #title>Verifikasi Password</template>
    <template #content>
      <FormInput id="hiddenPass" label="Password Sistem" v-model="hidden.passInput" type="password" autocomplete="off" />
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <BasicButton color="red" icon="times" @click="closePasswordModal">Batal</BasicButton>
        <BasicButton icon="paper-plane" @click="checkInput">Masuk</BasicButton>
      </div>
    </template>
  </DialogModal>

  <!-- Hidden settings modal -->
  <DialogModal :show="hidden.showHiddenModal" @close="hidden.showHiddenModal = false">
    <template #title>Pengaturan Tersembunyi</template>
    <template #content>
      <div class="grid grid-cols-1 divide-y divide-gray-500">
        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Mode</h4>
            <p class="text-sm">Menentukan perilaku aplikasi dan timer otomatis.</p>
          </div>
          <div>
            <FormSelect id="hiddenMode" v-model="hidden.mode" :options="modes" option-key="value" option-label="label" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Aksi Countdown</h4>
            <p class="text-sm">Yang dilakukan saat timer otomatis habis.</p>
          </div>
          <div>
            <FormSelect id="hiddenAction" v-model="hidden.action" :options="actions" option-key="value" option-label="label" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] md:gap-4 items-center py-2">
          <div>
            <h4>Timer Countdown (menit)</h4>
            <p class="text-sm">Durasi sebelum aksi otomatis. 0 = tidak ada timer.</p>
          </div>
          <div>
            <FormInput id="hiddenTimer" label="Menit" v-model="hidden.timer" type="number" :min-val="0" :step="1" />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <BasicButton color="red" icon="times" @click="hidden.showHiddenModal = false">Batal</BasicButton>
        <BasicButton icon="check" @click="applySettings">Terapkan</BasicButton>
      </div>
    </template>
  </DialogModal>
</template>

<style scoped>

</style>
