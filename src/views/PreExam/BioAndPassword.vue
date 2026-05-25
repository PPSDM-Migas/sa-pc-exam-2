<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BasicCard from '@/components/Cards/BasicCard.vue';
import FormInput from '@/components/Forms/FormInput.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import LoadingCard from '@/components/Cards/LoadingCard.vue';
import { page1Req, examReq } from '@/assets/js/Mixins/Class/Request';
import meditationGif from '@/assets/img/gif/meditation.gif';
import instructGif from '@/assets/img/gif/instruct.gif';

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

const props = defineProps<{ bio: UserBio }>();

const emit = defineEmits<{
  back: [];
  started: [];
  toast: [payload: ToastPayload];
}>();

const { t } = useI18n();
const router = useRouter();

const subStep = ref<number>(0); // 0 = bio form, 1 = password entry

const bioForm = reactive({
  phone: '',
  company: '',
  certification_usage_statement: true,
  submitStatus: 1 as number, // -1 error, 0 loading, 1 idle
  error: '',
});

const examPassword = reactive({
  pwd: '',
  loadStatus: 1 as number,
});

const storeBiodata = () => {
  if (!bioForm.phone || !bioForm.company) {
    emit('toast', { content: t('cameraBio.empty'), type: 'danger' });
    return;
  }

  bioForm.submitStatus = 0;
  page1Req
    .setBody({ phone: bioForm.phone, company: bioForm.company })
    .post('participant_exam.update-contact')
    .then((res: { data: { message?: string } }) => {
      bioForm.submitStatus = 1;
      subStep.value = 1;
      emit('toast', {
        content: res.data.message || t('cameraBio.updated'),
        title: 'Info',
        type: 'success',
      });
    })
    .catch((e: { response?: { data?: { error?: string } }; message: string }) => {
      bioForm.submitStatus = -1;
      const defaultError = t('problem');
      bioForm.error = e.response?.data?.error ?? defaultError;
      emit('toast', { content: bioForm.error, title: 'Info', type: 'danger' });
    });
};

const startExam = () => {
  examPassword.loadStatus = 0;

  localStorage.removeItem('ulid');
  localStorage.removeItem('pingStats.max');
  localStorage.removeItem('pingStats.min');
  localStorage.removeItem('pingStats.timeSeriesBucket');
  localStorage.removeItem('pingStats.disconnection');
  localStorage.removeItem('userActions');

  page1Req
    .setBody({ exam_access_code: examPassword.pwd })
    .post('participant_exam.start_exam_session')
    .then((res: { data: { content: { participant_exam_session_id?: number; token: { access: string; refresh: string; expires_in?: number } } } }) => {
      emit('toast', { content: t('cameraPwd.toExam'), title: 'Info', type: 'info' });

      const resp = res.data;
      sessionStorage.setItem('partc', String(resp.participant_exam_session_id ?? 0));
      examReq.storeTokens(resp.access, resp.refresh, resp.expires_in ?? 180);
      page1Req.eraseCookie('access_token_wux');
      page1Req.eraseCookie('refresh_token_wux');
      router.push('/exam');
      emit('started');
    })
    .catch((e: { response?: { data?: { message?: string } }; message: string }) => {
      examPassword.loadStatus = 1;
      emit('toast', {
        content: `${e.response?.data?.message ?? e.message}`,
        title: e.message,
        type: 'danger',
      });
    });
};
</script>

<template>
  <!-- Bio Info Display -->
  <BasicCard header-color="secondary">
    <template #header>
      <p class="text-center font-extrabold">{{ t('cameraBio.title') }}</p>
    </template>

    <div class="flex gap-2">
      <img :src="props.bio.photo_path" alt="photo" class="h-40 mx-auto rounded-xl" />

      <div class="w-full">
        <div class="grid grid-cols-1">
          <div class="flex items-center py-1 border-b border-gray-400">
            <div class="w-11 all-center">
              <font-awesome-icon icon="id-card" size="lg" class="text-primary" />
            </div>
            <div class="w-full">
              <p class="text-xs italic font-extrabold text-primary">{{ t('cameraBio.name') }}</p>
              <p>{{ props.bio.name }}</p>
            </div>
          </div>

          <div class="flex items-center py-1 border-b border-gray-400">
            <div class="w-11 all-center">
              <font-awesome-icon icon="users-between-lines" size="lg" class="text-primary" />
            </div>
            <div class="w-full">
              <p class="text-xs italic font-extrabold text-primary">{{ t('cameraBio.scheme') }}</p>
              <p>{{ props.bio.scheme_name }}</p>
            </div>
          </div>

          <div class="flex items-center py-1">
            <div class="w-11 all-center">
              <font-awesome-icon icon="chalkboard-user" size="lg" class="text-primary" />
            </div>
            <div class="w-full">
              <p class="text-xs italic font-extrabold text-primary">{{ t('cameraBio.level') }}</p>
              <p>{{ props.bio.scheme_level_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicCard>

  <!-- Sub-step 0: Bio Form -->
  <template v-if="subStep === 0">
    <BasicCard>
      <p class="mb-2 text-sm text-center">{{ t('cameraBio.completeBio') }}</p>

      <form id="field2" @submit.prevent="storeBiodata()">
        <FormInput
          id="wa"
          :label="t('cameraBio.phone')"
          v-model="bioForm.phone"
          :disabled="bioForm.submitStatus === 0"
          required
        >
          <template #description>{{ t('cameraBio.whatsapp') }}</template>
        </FormInput>

        <FormInput
          id="cpy"
          :label="t('cameraBio.company')"
          v-model="bioForm.company"
          :disabled="bioForm.submitStatus === 0"
          required
        />
      </form>
    </BasicCard>

    <div class="flex gap-2">
      <BasicButton icon="times-circle" expanded color="red" :disabled="bioForm.submitStatus === 0" @click="emit('back')">
        {{ t('cameraBio.wrong') }}
      </BasicButton>
      <BasicButton icon="save" form="field2" as-submit expanded color="green" :on-loading="bioForm.submitStatus === 0">
        {{ t('cameraBio.next') }}
      </BasicButton>
    </div>
  </template>

  <!-- Sub-step 1: Password Entry -->
  <template v-else>
    <BasicCard v-if="examPassword.loadStatus === 0" no-padding>
      <LoadingCard :title="t('exam.prep')" :use-img="meditationGif" with-time>
        {{ t('exam.load') }}
      </LoadingCard>
    </BasicCard>

    <BasicCard v-else header-color="secondary">
      <template #header>
        <p class="text-center font-extrabold">{{ t('cameraPwd.title') }}</p>
      </template>

      <div class="text-center mb-2">
        <img :src="instructGif" alt="supervisor" class="mx-auto w-48 mb-1" />
        <p class="text-sm">{{ t('cameraPwd.ask') }}</p>
      </div>

      <form id="field3">
        <FormInput id="pwd" :label="t('cameraPwd.form')" v-model="examPassword.pwd" required />
      </form>
    </BasicCard>

    <BasicButton icon="file-signature" form="field3" as-submit expanded color="green" @click="startExam()">
      {{ t('cameraPwd.start') }}
    </BasicButton>
  </template>
</template>

<style scoped></style>
