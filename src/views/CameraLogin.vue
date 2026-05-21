<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import BasicCard from '@/components/Cards/BasicCard.vue';
import LogoTitleCard from '@/components/Cards/LogoTitleCard.vue';
import BackgroundLayout from '@/layouts/BackgroundLayout.vue';
import { useI18n } from 'vue-i18n';
import PingTest from '@/views/PingTest.vue';
import { changeDarkMode } from '@/assets/js/Mixins/TreeShake/browserBehavior.js';
import SettingModal from '@/views/Component/SettingModal.vue';
import { page1Req } from '@/assets/js/Mixins/Class/Request';
import CodeCheck from '@/views/PreExam/CodeCheck.vue';
import CertificateAgreement from '@/views/PreExam/CertificateAgreement.vue';
import BioAndPassword from '@/views/PreExam/BioAndPassword.vue';

const layout = ref(null);
const { t } = useI18n();

const router = useRouter();
const pageStep = ref(0);

const timer = ref(600);

const timerTime = reactive({ h: 0, m: 0, s: 0 });

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  timerTime.h = hours;
  timerTime.m = minutes;
  timerTime.s = seconds;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const formattedTimer = computed(() => formatTime(timer.value * 1000));

let theInterval = null;
const startTimer = () => {
  theInterval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      router.push({ name: 'home' });
    }
  }, 1000);
};

const clearTimer = (reset = false) => {
  clearInterval(theInterval);
  if (reset) {
    timer.value = 600;
    startTimer();
  }
};

const userBio = reactive({
  name: '',
  scheme_name: '',
  scheme_level_name: '',
  portal_participant_id: 0,
  photo_path: '',
});

const onCodeCheckSuccess = (bio) => {
  Object.assign(userBio, bio);
  pageStep.value = 1;
  clearTimer(true);
};

const onToast = (payload) => {
  layout.value.manualPushToast(payload);
};

const onboard = () => {
  page1Req.eraseCookie('access_ex_wux');
  page1Req.eraseCookie('refresh_ex_wux');
  page1Req.eraseCookie('access_token_wux');
  page1Req.eraseCookie('refresh_token_wux');
};

const setting = ref(false);

onMounted(() => {
  startTimer();
  onboard();
});

onUnmounted(() => {
  clearTimer();
});
</script>

<template>
  <BackgroundLayout ref="layout" left-btn-icon="cog" right-btn-class="red" right-btn-icon="reply" @left-corner="setting = !setting" @right-corner="router.back()">
    <SettingModal :show="setting" @close="setting = !setting" />
    <LogoTitleCard class="w-full px-4" />

    <div class="flex justify-center my-4">
      <BasicCard>
        <PingTest />
      </BasicCard>
    </div>

    <div class="w-full max-w-2xl grid grid-cols-1 gap-2">
      <CodeCheck v-if="pageStep === 0" @success="onCodeCheckSuccess" @toast="onToast" />

      <CertificateAgreement
        v-else-if="pageStep === 1"
        @agree="pageStep = 2; clearTimer(true)"
        @back="pageStep = 0"
        @toast="onToast"
      />

      <BioAndPassword
        v-else
        :bio="userBio"
        @back="pageStep = 0"
        @started="clearTimer()"
        @toast="onToast"
      />
    </div>

    <template #footer>
      <p>
        {{ t('cameraCode.timer') }} <span class="text-primary font-bold">{{ formattedTimer }}</span>
      </p>
    </template>
  </BackgroundLayout>
</template>

<style scoped></style>
