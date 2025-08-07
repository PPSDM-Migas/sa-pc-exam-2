<script setup>
import {computed, onMounted, reactive, ref} from 'vue';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import {translateDate} from "@/assets/js/Mixins/TreeShake/dateTime.js";
import ConfirmationModal from "@/components/Modals/ConfirmationModal.vue";
import VueMarkdown from 'vue-markdown-render';
import BasicCard from "@/components/Cards/BasicCard.vue";
import BasicButton from "@/components/Buttons/BasicButton.vue";
import {faCloudDownload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const props = defineProps({
  autoUpdate: Boolean,
});
const emits = defineEmits(['toastEvent']);

const checker = reactive({
  status: -1, // -1: unavailable, 0: checking, 1: available
  info: null,
});

const downloader = reactive({
  status: 0, // -1 fail, 0: idle, 1: downloading, 2: finish
  progress: { downloaded: 0, total: 0, percent: 50 },
  modalShow: false,
  error: ''
});

const tubeStyle = computed(() => ({
  '--tube-percentage': `${downloader.progress.percent}%`
}));

let update = null;

const downloadUpdate = async () => {
  downloader.status = 1;
  let downloaded = 0;
  let contentLength = 0;

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength;
        downloader.progress.total = contentLength;
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        downloader.progress.downloaded = downloaded;
        downloader.progress.percent = Math.round((downloaded / contentLength) * 100);
        break;
      case 'Finished':
        downloader.status = 2;
        break;
    }
  }).then(async (res) => {
    console.log('t', res);
    await relaunch();
  }).catch((err) => {
    downloader.error = `Update gagal: ${err}`;
    downloader.status = -1;
  });
}

const checkForUpdate = async () => {
  try {
    checker.status = 0;
    update = await check();
    if (update) {
      checker.status = 1;
      checker.info = update;
      if (props.autoUpdate) await downloadUpdate();
    } else {
      checker.status = -1;
      emits('toastEvent', {
        content: 'Belum ada update aplikasi tersedia. Have a nice day! :)',
      })
    }
  } catch (err) {
    checker.status = -1;
    emits('toastEvent', {
      content: `Gagal mengecek update aplikasi: ${err}`,
      type: 'danger',
    });
  }
}

defineExpose({ checkForUpdate });

onMounted(() => {
  if (props.autoUpdate) checkForUpdate();
})
</script>

<template>
  <div>
    <div v-if="checker.status > -1" class="text-center px-4 py-2 bg-primary">
      <p v-if="checker.status === 0">
        <font-awesome-icon icon="cog" spin></font-awesome-icon> Sedang mengecek update...
      </p>
      <p v-if="checker.status === 1" class="text-sm underline cursor-pointer" @click="downloader.modalShow = true;">
        Update v{{ checker.info.version }} tersedia. Klik disini untuk mengunduh
      </p>
    </div>

    <ConfirmationModal :show="downloader.modalShow" :closeable="downloader.status < 1" @close="downloader.modalShow = false">
      <template #title>Konfirmasi Memperbarui v{{ checker.info.currentVersion }} ke v{{ checker.info.version }}</template>
      <template #content>
        <div class="text-left">
          <p class="text-xs italic mb-2">Rilis pada {{ translateDate(checker.info.date, true, '@') }}</p>
          <p>Release note:</p>
          <div class="rl-note">
            <vue-markdown :source="checker.info.body" />
          </div>
          <div class="grid grid-cols-1 gap-2">
            <BasicCard v-if="downloader.status !== 0">
              <div class="tube" :style="tubeStyle">
                <div class="body">
                  <div class="liquid">
                    <div class="percentage"></div>
                  </div>
                </div>
                <div class="bubbles">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
              <div class="flex justify-between">
                <p class="text-xs">
                  {{ downloader.progress.downloaded }} / {{ downloader.progress.total }}
                </p>
                <p class="flex-shrink-0 flex-grow-0">
                  {{ downloader.progress.percent }}%
                </p>
              </div>
            </BasicCard>

            <BasicCard v-if="downloader.status === -1 || downloader.status === 2">
              <div class="text-center">
                <p v-if="downloader.status === -1">{{ downloader.error }}</p>
                <p v-else-if="downloader.status === 2">Mengunduh update selesai. Memasang pembaruan dan nanti aplikasi akan diperbarui otomatis :)</p>
              </div>
            </BasicCard>
          </div>
        </div>
      </template>
      <template #footer>
        <BasicButton icon="times" color="red" :disabled="downloader.status > 0" @click="downloader.modalShow = false">Tidak Usah</BasicButton>
        <BasicButton :icon="faCloudDownload" color="green" :on-loading="downloader.status > 0" @click="downloadUpdate">OKE GAS</BasicButton>
      </template>
    </ConfirmationModal>
  </div>
</template>

<style scoped>
.rl-note ul,
.rl-note ol {
  padding-left: 1rem;
}
</style>
