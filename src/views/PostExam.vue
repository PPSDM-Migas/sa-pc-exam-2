<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import BackgroundLayout from "@/layouts/BackgroundLayout.vue";
import BasicCard from "@/components/Cards/BasicCard.vue";
import BasicButton from "@/components/Buttons/BasicButton.vue";
import {useI18n} from "vue-i18n";
import {getCurrentWindow} from "@tauri-apps/api/window";

const { t, locale } = useI18n();
const iframeRef = ref(null);
const props = defineProps({
  sid: '', // Schedule id
  pid: '', // Participant id
});
const router = useRouter();

const iframeSrc = `${import.meta.env.VITE_EVAL_URL}/samev*${props.sid}/${props.pid}?autoClose=${import.meta.env.VITE_EVL}`;
// const iframeSrc = `https://ppsdmmigas.esdm.go.id/migaseval/Evaluasi/finish?autoClose=${import.meta.env.VITE_EVL}`;

let popupWindow = null;

const handleMessage = (event) => {
  if (event.data === 'closeIframe') {
    popupWindow?.close();
    router.push('/');
    window.removeEventListener('message', handleMessage);
  }
};

const openEval = () => {
  popupWindow = window.open(iframeSrc, '_blank');
  window.addEventListener('message', handleMessage);
};

onMounted(() => {
  getCurrentWindow().setFullscreen(false);
  getCurrentWindow().setAlwaysOnTop(false);
  openEval();
});

onUnmounted(() => {
  document.removeEventListener('message', handleMessage);
})
</script>

<template>
  <BackgroundLayout>
    <div class="flex gap-2">
      <BasicCard v-if="!iframeRef">
        <p class="mb-2 text-center">{{ t('post.notShown') }}</p>
        <div class="btn-group justify-center">
          <BasicButton icon="file-signature" @click="openEval()">
            {{ t('button.openEval') }}
          </BasicButton>
        </div>
      </BasicCard>
      <BasicCard>
        <p class="mb-2 text-center">{{ t('post.isFinish') }}</p>
        <div class="btn-group justify-center">
          <RouterLink to="/">
            <BasicButton icon="reply">{{ t('button.mainPage') }}</BasicButton>
          </RouterLink>
        </div>
      </BasicCard>
    </div>
  </BackgroundLayout>
  <!-- <iframe ref="iframeRef" :src="iframeSrc" style="border: none;" class="relative w-full h-screen"></iframe> -->
</template>
