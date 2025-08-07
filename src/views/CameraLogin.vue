<script setup>
import {QrcodeStream} from 'vue-qrcode-reader';
import {computed, onMounted, onUnmounted, reactive, ref} from 'vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {useRouter} from 'vue-router';
import axios from 'axios';
import BasicCard from '@/components/Cards/BasicCard.vue';
import FormInput from '@/components/Forms/FormInput.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import { page1Req, examReq } from "@/assets/js/Mixins/Class/Request";
import LoadingCard from '@/components/Cards/LoadingCard.vue';
import LogoTitleCard from '@/components/Cards/LogoTitleCard.vue';
import cameraBroken from '@/assets/img/svg/camera-broken.svg';
import cameraGif from '@/assets/img/gif/camera.gif';
import peopleSearchGif from '@/assets/img/gif/people-search.gif';
import instructGif from '@/assets/img/gif/instruct.gif';
import meditationGif from '@/assets/img/gif/meditation.gif';
import BackgroundLayout from "@/layouts/BackgroundLayout.vue";
import {useI18n} from "vue-i18n";
import PingTest from "@/views/PingTest.vue";
import {changeDarkMode} from "@/assets/js/Mixins/TreeShake/browserBehavior.js";
import SettingModal from "@/views/Component/SettingModal.vue";

const layout = ref(null);
const { t, locale } = useI18n();

const router = useRouter();
const pageStep = ref(0);
const loadingCamera = ref(false);

const timer = ref(600);
const resetTimer = () => {
  timer.value = 600;
};

const timerTime = reactive({
  h: 0,
  m: 0,
  s: 0,
});

// Function to format time in HH:MM:SS
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

// Computed property to get the formatted time
const formattedTimer = computed(() => formatTime(timer.value * 1000));

// Timer logic
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

// eslint-disable-next-line
const hrefFooter =
  'https://www.freepik.com/free-vector/oil-extraction-platform-sea-cartoon-illustration_5901394.htm#fromView=search&page=1&position=22&uuid=c281f0b5-dc6b-4050-8877-d56b3c094917';

const userCode = reactive({
  value: '',
  fetch: {
    status: 1, // -1 error, 0 loading, 1 none
    error: '',
  },
  bio: {
    name: 'Tes Nama',
    scheme_name: 'Pengembang Web',
    scheme_level_name: 'Pengembang Web Pratama',
    portal_participant_id: 0,
    photo_path: 'https://portal.ppsdmmigas.id/sertifikasi/uploads/61738_2024012902334665b754daa0d82_pasFoto.png',
  },
});

const bioForm = reactive({
  phone: '',
  company: '',
  submit: {
    status: 1,
    error: '',
  },
});

const loadCamera = () => {
  loadingCamera.value = true;
};

const doCheck = async (val = null) => {
  const search = val ?? userCode.value;
  if (!search) {
    layout.value.manualPushToast({
      content: locale.value === 'en' ? 'Paricipant code can not empty' : 'Kode peserta tidak boleh kosong',
      type: 'danger',
    });
    return;
  }

  userCode.fetch.status = 0;
  axios
    .post(`${import.meta.env.VITE_BASE_API}/api/participant-exam/match-qr`, {
      participant_code: search,
    })
    .then((res) => {
      const resp = res.data.content;
      userCode.bio.name = resp.participant_name ?? '-';
      userCode.bio.scheme_name = resp.scheme ?? '-';
      userCode.bio.scheme_level_name = resp.scheme_level ?? '-';
      userCode.bio.photo_path = resp.participant_photo_url ?? 'https://placehold.co/400x600';
      userCode.bio.portal_participant_id = resp.portal_participant_id
      pageStep.value = 1;
      page1Req.setAccessRefreshCookie(resp.token.access, resp.token.refresh);
    })
    .catch((e) => {
      layout.value.manualPushToast({
        content: `${e.response.data.message ?? e.message}`,
        title: e.message,
        type: 'danger',
      });
    })
    .finally(() => {
      userCode.fetch.status = 1;
    });
};

const paintBoundingBox = (detectedCodes, ctx) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: {x, y, width, height},
    } = detectedCode;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#007bff';
    ctx.strokeRect(x, y, width, height);
  }
};

const getCauseCameraError = (err) => {
  userCode.fetch.error = `[${err.name}]: `;

  if (err.name === 'NotAllowedError') {
    userCode.fetch.error = t('camera.notAllowed');
  } else if (err.name === 'NotFoundError') {
    userCode.fetch.error = t('camera.noCamera');
  } else if (err.name === 'NotSupportedError') {
    userCode.fetch.error = t('camera.notSecure');
  } else if (err.name === 'NotReadableError') {
    userCode.fetch.error = t('camera.inUse');
  } else if (err.name === 'OverconstrainedError') {
    userCode.fetch.error = t('camera.unsupported');
  } else if (err.name === 'StreamApiNotSupportedError') {
    userCode.fetch.error = t('camera.browserSupport');
  } else if (err.name === 'InsecureContextError') {
    userCode.fetch.error = t('camera.insecure');
  } else {
    userCode.fetch.error += err.message;
  }
};

const cameraError = (err) => {
  getCauseCameraError(err);
};

const cameraFoundQR = (detectedCodes) => {
  const abc = detectedCodes.map((code) => code.rawValue);
  doCheck(abc[0]);
};

const wrongBiodata = () => {
  userCode.value = '';
  userCode.fetch.error = '';
  pageStep.value = 0;
};

const examPassword = reactive({
  pwd: '',
  loadStatus: 1,
  error: '',
});

const storeBiodata = () => {
  if (!bioForm.phone || !bioForm.company) {
    layout.value.manualPushToast({
      content: t('cameraS2.empty'),
      type: 'danger',
    });
    return;
  }
  bioForm.submit.status = 0;
  page1Req
    .setBody({
      phone: bioForm.phone,
      company: bioForm.company,
    })
    .post('participant_exam.update-contact')
    .then((res) => {
      bioForm.submit.status = 1;
      pageStep.value = 2;
      layout.value.manualPushToast({
        content: res.data.message || t('cameraS2.updated'),
        title: 'Info',
        type: 'success',
      });
    })
    .catch((e) => {
      bioForm.submit.status = -1;
      const defaultError = t('problem');
      bioForm.submit.error = e.response.data ? e.response.data.error ?? defaultError : defaultError;
      layout.value.manualPushToast({
        content: bioForm.submit.error,
        title: 'Info',
        type: 'danger',
      });
    })
    .finally(() => {
      clearTimer(true);
    });
};

const startExam = () => {
  examPassword.loadStatus = 0;

  localStorage.removeItem('pingStats.max');
  localStorage.removeItem('pingStats.min');
  localStorage.removeItem('pingStats.timeSeriesBucket');
  localStorage.removeItem('pingStats.disconnection');
  localStorage.removeItem('userActions');

  page1Req
    .setBody({
      exam_access_code: examPassword.pwd,
    })
    .post('participant_exam.start_exam_session')
    .then((res) => {
      layout.value.manualPushToast({
        content: t('cameraS3.toExam'),
        title: 'Info',
        type: 'info',
      });

      clearTimer();

      const resp = res.data.content;
      sessionStorage.setItem('partc', resp.participant_exam_session_id ?? 0);
      examReq.setAccessRefreshCookie(resp.token.access, resp.token.refresh);
      page1Req.eraseCookie('access_token_wux');
      page1Req.eraseCookie('refresh_token_wux');
      router.push('/exam');
    })
    .catch((e) => {
      examPassword.loadStatus = 1;
      layout.value.manualPushToast({
        content: `${e.response.data.message ?? e.message}`,
        title: e.message,
        type: 'danger',
      });
    });
};

const onboard = () => {
  page1Req.eraseCookie('access_ex_wux');
  page1Req.eraseCookie('refresh_ex_wux');
  page1Req.eraseCookie('access_token_wux');
  page1Req.eraseCookie('refresh_token_wux');
};

// State variables
const cameraStatus = ref(0); // 0: Not checked, 1: Allowed, -1: Not allowed

// Function to check camera permission
const checkCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    cameraStatus.value = 1;
    stream.getTracks().forEach((track) => track.stop()); // Stop the stream
  } catch (error) {
    cameraStatus.value = -1;
    getCauseCameraError(error);
  }
};

const withTimer = computed(() => {
  return import.meta.env.VITE_ENV && import.meta.env.VITE_ENV === 'insite';
});

const toggleDark = () => {
  changeDarkMode();
}

onMounted(() => {
  startTimer();
  checkCameraPermission();
  onboard();
});

onUnmounted(() => {
  clearTimer();
});

const setting = ref(false);
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

    <div class="w-full max-w-lg grid grid-cols-1 gap-2">
      <BasicCard v-if="cameraStatus === 0">
        <div class="text-center">
          <img :src="cameraGif" alt="camera" class="w-24 mx-auto"/>
          <p>{{ t('cameraS1.openCam') }}</p>
          <p>{{ t('cameraS1.camPermission') }} :)</p>
        </div>
      </BasicCard>

      <BasicCard v-else-if="cameraStatus === -1">
        <div class="text-center">
          <img :src="cameraBroken" alt="camera" class="w-24 mx-auto"/>

          <div class="my-4">
            <h3>{{ t('cameraS1.camProblem') }} :(</h3>
            <h5>{{ t('cameraS1.camExamDenied') }}</h5>
            <p class="mt-2">{{ userCode.fetch.error }}</p>
          </div>
          <p class="italic text-sm">{{ t('cameraS1.pageReload') }}.</p>
        </div>
      </BasicCard>

      <template v-else>
        <!-- Step 1: Kamera untuk scan -->
        <template v-if="pageStep === 0">
          <template v-if="userCode.fetch.status === 1">
            <BasicCard header-color="secondary">
              <template #header>
                <p class="text-center font-extrabold">{{ t('cameraS1.validationTitle') }}</p>
              </template>

              <div v-if="userCode.fetch.error" class="text-center">
                <img :src="cameraBroken" alt="camera" class="w-24 mx-auto"/>

                <div class="my-1">
                  <p class="text-center font-extrabold text-primary">{{ t('problem') }}</p>
                  <p>{{ userCode.fetch.error }}</p>
                </div>
                <p class="italic text-sm">{{ t('cameraS1.pageReload') }}.</p>
              </div>

              <template v-else>
                <div>
                  <p class="mb-2 text-center text-sm">{{ t('cameraS1.showQR') }}.</p>
                  <qrcode-stream
                    class="rounded-xl overflow-clip w-40"
                    :track="paintBoundingBox"
                    :constraints="{ facingMode: 'user' }"
                    @detect="cameraFoundQR"
                    @error="cameraError"
                    @camera-on="loadCamera"
                  >
                  </qrcode-stream>
                </div>
              </template>
            </BasicCard>

            <BasicCard class="text-center">
              <p class="text-sm mb-2">{{ t('cameraS1.codeInput') }}:</p>

              <form id="field1">
                <FormInput id="id-peserta" :label="t('cameraS1.codeForm')" v-model="userCode.value" m0 required/>
              </form>
            </BasicCard>

            <BasicButton icon="paper-plane" form="field1" as-submit expanded @click="doCheck()">{{ t('button.check') }}</BasicButton>
          </template>

          <BasicCard v-else-if="userCode.fetch.status === 0" header-color="secondary">
            <template #header>
              <p class="text-center font-extrabold">{{ t('cameraS1.finding') }}</p>
            </template>

            <div class="text-center">
              <img :src="peopleSearchGif" alt="supervisor" class="mx-auto w-48 my-2"/>
              <p class="text-sm">{{ t('cameraS1.patience') }} :D</p>
            </div>
          </BasicCard>
        </template>

        <!-- Step 2: Konfirmasi biodata sebelum masuk ujian -->
        <template v-else>
          <BasicCard header-color="secondary">
            <template #header>
              <p class="text-center font-extrabold">{{ t('cameraS2.title') }}</p>
            </template>

            <div class="flex gap-2">
              <img :src="userCode.bio.photo_path" alt="photo" class="h-40 mx-auto rounded-xl"/>

              <div class="w-full">
                <div class="grid grid-cols-1">
                  <!-- Nama -->
                  <div class="flex items-center py-1 border-b border-gray-400">
                    <div class="w-11 all-center">
                      <font-awesome-icon icon="id-card" size="lg" class="text-primary"></font-awesome-icon>
                    </div>
                    <div class="w-full">
                      <p class="text-xs italic font-extrabold text-primary">{{ t('cameraS2.name') }}</p>
                      <p>{{ userCode.bio.name }}</p>
                    </div>
                  </div>

                  <div class="flex items-center py-1 border-b border-gray-400">
                    <div class="w-11 all-center">
                      <font-awesome-icon icon="users-between-lines" size="lg" class="text-primary"></font-awesome-icon>
                    </div>
                    <div class="w-full">
                      <p class="text-xs italic font-extrabold text-primary">{{ t('cameraS2.scheme') }}</p>
                      <p>{{ userCode.bio.scheme_name }}</p>
                    </div>
                  </div>

                  <div class="flex items-center py-1">
                    <div class="w-11 all-center">
                      <font-awesome-icon icon="chalkboard-user" size="lg" class="text-primary"></font-awesome-icon>
                    </div>
                    <div class="w-full">
                      <p class="text-xs italic font-extrabold text-primary">{{ t('cameraS2.level') }}</p>
                      <p>{{ userCode.bio.scheme_level_name }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BasicCard>

          <template v-if="pageStep === 1">
            <BasicCard>
              <p class="mb-2 text-sm text-center">{{ t('cameraS2.completeBio') }}</p>

              <form id="field2" @submit.prevent="storeBiodata()">
                <FormInput
                  id="wa"
                  :label="t('cameraS2.phone')"
                  v-model="bioForm.phone"
                  :disabled="bioForm.submit.status === 0"
                  required
                >
                  <template #description>{{ t('cameraS2.whatsapp') }}</template>
                </FormInput>

                <FormInput
                  id="cpy"
                  :label="t('cameraS2.company')"
                  v-model="bioForm.company"
                  :disabled="bioForm.submit.status === 0"
                  required
                />
              </form>
            </BasicCard>

            <div class="flex gap-2">
              <BasicButton
                icon="times-circle"
                expanded
                color="red"
                :disabled="bioForm.submit.status === 0"
                @click="wrongBiodata()"
              >
                {{ t('cameraS2.wrong') }}
              </BasicButton>
              <BasicButton
                icon="save"
                form="field2"
                as-submit
                expanded
                color="green"
                :on-loading="bioForm.submit.status === 0"
              >
                {{ t('cameraS2.next') }}
              </BasicButton>
            </div>
          </template>

          <template v-else>
            <BasicCard v-if="examPassword.loadStatus === 0" no-padding>
              <LoadingCard :title="t('exam.prep')" :use-img="meditationGif" with-time>
                {{ t('exam.load') }}
              </LoadingCard>
            </BasicCard>
            <BasicCard v-else header-color="secondary">
              <template #header>
                <p class="text-center font-extrabold">{{ t('cameraS3.title') }}</p>
              </template>

              <div class="text-center mb-2">
                <img :src="instructGif" alt="supervisor" class="mx-auto w-48 mb-1"/>
                <p class="text-sm">{{ t('cameraS3.ask') }}</p>
              </div>

              <form id="field3">
                <FormInput id="wa" :label="t('cameraS3.form')" v-model="examPassword.pwd" required/>
              </form>
            </BasicCard>

            <BasicButton icon="file-signature" form="field3" as-submit expanded color="green" @click="startExam()">
              {{ t('cameraS3.start') }}
            </BasicButton>
          </template>
        </template>
      </template>
    </div>

    <template #footer>
      <p>
        {{ t('cameraS1.timer') }} <span class="text-primary font-bold">{{ formattedTimer }}</span>
      </p>
    </template>
  </BackgroundLayout>
</template>

<style scoped></style>
