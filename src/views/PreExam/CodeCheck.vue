<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader';
import { onMounted, reactive, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios from 'axios';
import BasicCard from '@/components/Cards/BasicCard.vue';
import FormInput from '@/components/Forms/FormInput.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import { page1Req } from '@/assets/js/Mixins/Class/Request';
import { useI18n } from 'vue-i18n';
import cameraBroken from '@/assets/img/svg/camera-broken.svg';
import cameraGif from '@/assets/img/gif/camera.gif';
import peopleSearchGif from '@/assets/img/gif/people-search.gif';

interface UserBio {
  name: string;
  scheme_name: string;
  scheme_level_name: string;
  portal_participant_id: number;
  photo_path: string;
}

interface ToastPayload {
  content: string;
  type: string;
  title?: string;
}

const emit = defineEmits<{
  success: [bio: UserBio];
  toast: [payload: ToastPayload];
}>();

const { t, locale } = useI18n();

const cameraStatus = ref<number>(0); // 0: checking, 1: allowed, -1: denied
const loadingCamera = ref<boolean>(false);

const userCode = reactive({
  value: '',
  fetchStatus: 1 as number, // -1 error, 0 loading, 1 idle
  error: '',
});

const getCauseCameraError = (err: { name: string; message: string }) => {
  userCode.error = `[${err.name}]: `;

  if (err.name === 'NotAllowedError') {
    userCode.error = t('camera.notAllowed');
  } else if (err.name === 'NotFoundError') {
    userCode.error = t('camera.noCamera');
  } else if (err.name === 'NotSupportedError') {
    userCode.error = t('camera.notSecure');
  } else if (err.name === 'NotReadableError') {
    userCode.error = t('camera.inUse');
  } else if (err.name === 'OverconstrainedError') {
    userCode.error = t('camera.unsupported');
  } else if (err.name === 'StreamApiNotSupportedError') {
    userCode.error = t('camera.browserSupport');
  } else if (err.name === 'InsecureContextError') {
    userCode.error = t('camera.insecure');
  } else {
    userCode.error += err.message;
  }
};

const checkCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraStatus.value = 1;
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    cameraStatus.value = -1;
    getCauseCameraError(error as { name: string; message: string });
  }
};

const doCheck = async (val: string | null = null) => {
  const search = val ?? userCode.value;
  if (!search) {
    emit('toast', {
      content: locale.value === 'en' ? 'Participant code can not be empty' : 'Kode peserta tidak boleh kosong',
      type: 'danger',
    });
    return;
  }

  userCode.fetchStatus = 0;
  axios
    .post(`${import.meta.env.VITE_BASE_API}/api/participant-exam/match-qr`, {
      participant_code: search,
    })
    .then((res) => {
      const resp = res.data.content;
      const bio: UserBio = {
        name: resp.participant_name ?? '-',
        scheme_name: resp.scheme ?? '-',
        scheme_level_name: resp.scheme_level ?? '-',
        photo_path: resp.participant_photo_url ?? 'https://placehold.co/400x600',
        portal_participant_id: resp.portal_participant_id,
      };
      page1Req.setAccessRefreshCookie(resp.token.access, resp.token.refresh);
      emit('success', bio);
    })
    .catch((e: { response?: { data?: { message?: string } }; message: string }) => {
      emit('toast', {
        content: `${e.response?.data?.message ?? e.message}`,
        title: e.message,
        type: 'danger',
      });
    })
    .finally(() => {
      userCode.fetchStatus = 1;
    });
};

const paintBoundingBox = (detectedCodes: { boundingBox: { x: number; y: number; width: number; height: number } }[], ctx: CanvasRenderingContext2D) => {
  for (const detectedCode of detectedCodes) {
    const { boundingBox: { x, y, width, height } } = detectedCode;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#007bff';
    ctx.strokeRect(x, y, width, height);
  }
};

const cameraError = (err: { name: string; message: string }) => {
  getCauseCameraError(err);
};

const cameraFoundQR = (detectedCodes: { rawValue: string }[]) => {
  const code = detectedCodes.map((c) => c.rawValue)[0];
  doCheck(code);
};

const loadCamera = () => {
  loadingCamera.value = true;
};

onMounted(() => {
  checkCameraPermission();
});
</script>

<template>
  <BasicCard v-if="cameraStatus === 0">
    <div class="text-center">
      <img :src="cameraGif" alt="camera" class="w-24 mx-auto" />
      <p>{{ t('cameraCode.openCam') }}</p>
      <p>{{ t('cameraCode.camPermission') }} :)</p>
    </div>
  </BasicCard>

  <BasicCard v-else-if="cameraStatus === -1">
    <div class="text-center">
      <img :src="cameraBroken" alt="camera" class="w-24 mx-auto" />
      <div class="my-4">
        <h3>{{ t('cameraCode.camProblem') }} :(</h3>
        <h5>{{ t('cameraCode.camExamDenied') }}</h5>
        <p class="mt-2">{{ userCode.error }}</p>
      </div>
      <p class="italic text-sm">{{ t('cameraCode.pageReload') }}.</p>
    </div>
  </BasicCard>

  <template v-else>
    <template v-if="userCode.fetchStatus === 1">
      <BasicCard header-color="secondary">
        <template #header>
          <p class="text-center font-extrabold">{{ t('cameraCode.validationTitle') }}</p>
        </template>

        <div v-if="userCode.error" class="text-center">
          <img :src="cameraBroken" alt="camera" class="w-24 mx-auto" />
          <div class="my-1">
            <p class="text-center font-extrabold text-primary">{{ t('problem') }}</p>
            <p>{{ userCode.error }}</p>
          </div>
          <p class="italic text-sm">{{ t('cameraCode.pageReload') }}.</p>
        </div>

        <template v-else>
          <div>
            <p class="mb-2 text-center text-sm">{{ t('cameraCode.showQR') }}.</p>
            <qrcode-stream
              class="rounded-xl overflow-clip w-40"
              :track="paintBoundingBox"
              :constraints="{ facingMode: 'user' }"
              @detect="cameraFoundQR"
              @error="cameraError"
              @camera-on="loadCamera"
            />
          </div>
        </template>
      </BasicCard>

      <BasicCard class="text-center">
        <p class="text-sm mb-2">{{ t('cameraCode.codeInput') }}:</p>
        <form id="field1">
          <FormInput id="id-peserta" :label="t('cameraCode.codeForm')" v-model="userCode.value" m0 required />
        </form>
      </BasicCard>

      <BasicButton icon="paper-plane" form="field1" as-submit expanded @click="doCheck()">
        {{ t('button.check') }}
      </BasicButton>
    </template>

    <BasicCard v-else-if="userCode.fetchStatus === 0" header-color="secondary">
      <template #header>
        <p class="text-center font-extrabold">{{ t('cameraCode.finding') }}</p>
      </template>
      <div class="text-center">
        <img :src="peopleSearchGif" alt="supervisor" class="mx-auto w-48 my-2" />
        <p class="text-sm">{{ t('cameraCode.patience') }} :D</p>
      </div>
    </BasicCard>
  </template>
</template>

<style scoped></style>