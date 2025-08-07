<script setup>
import {reactive, ref} from 'vue';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import {translateDate} from "@/assets/js/Mixins/TreeShake/dateTime.js";

const updater = reactive({
  status: 0, // -1: unavailable, 0: checking, 1: available, 2: downloading
  updaterStatus: 0, // -1 failed, 0: downloading, 1: succeeded
  info: null,
});
const checkingUpdate = ref(false);
const updateAvailable = ref(false);
const progress = ref({ downloaded: 0, total: 0, percent: 0 });
const status = ref('Checking for update...');

let update = null;

async function checkForUpdate() {
  try {
    updater.status = 0;
    update = await check();
    if (update) {
      updater.status = 1;
      updater.info = update;
      status.value = `Update v${update.version} tersedia, rilis pada ${translateDate(update.date, true, '@')}`;
    } else {
      updater.status = -1;
      status.value = 'No update available.';
    }
  } catch (err) {
    console.error(err);
    status.value = 'Update check failed.';
  }
}

async function downloadUpdate() {
  updater.status = 2;
  updater.updaterStatus = 0;
  let downloaded = 0;
  let contentLength = 0;

  await update.downloadAndInstall((event) => {
    console.log(event);
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength;
        progress.value.total = contentLength;
        status.value = `Started downloading ${contentLength} bytes...`;
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        progress.value.downloaded = downloaded;
        progress.value.percent = Math.round((downloaded / contentLength) * 100);
        status.value = `Downloading... ${progress.value.percent}%`;
        break;
      case 'Finished':
        status.value = 'Download finished. Installing...';
        break;
    }
  }).then(async (res) => {
    console.log('t', res);
    await relaunch();
  }).catch((err) => {
    status.value = `Update failed: ${err}`;
    updater.updaterStatus = -1;
  });
}

defineExpose({ checkForUpdate });
</script>

<template>
  <div v-if="updater.status > -1" class="text-center px-4 py-2 bg-primary">
    <p>{{ status }}</p>
    <p v-if="updater.status === 1" class="text-sm italic font-extrabold underline cursor-pointer" @click="downloadUpdate">
      Klik disini untuk mengunduh
    </p>
    <div v-if="progress.total > 0 && updater.updaterStatus === 0">
      <progress :value="progress.downloaded" :max="progress.total"></progress>
      <span>{{ progress.percent }}%</span>
    </div>
  </div>
</template>
