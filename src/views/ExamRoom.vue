<script setup>
import {ref, computed, reactive, onMounted, nextTick, onUnmounted} from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueMathjax from 'vue-mathjax-next';
import NavBar from '@/components/Navs/NavBar.vue';
import BasicCard from '@/components/Cards/BasicCard.vue';
import NumberButton from '@/components/Buttons/NumberButton.vue';
import AnswerCard from '@/components/Cards/AnswerCard.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import FormQuill from '@/components/Forms/FormQuill.vue';
import DialogModal from '@/components/Modals/DialogModal.vue';
import FormTextarea from '@/components/Forms/FormTextarea.vue';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue';
import { examReq } from "@/assets/js/Mixins/Class/Request";
import LoadingCard from '@/components/Cards/LoadingCard.vue';
import ToastContainer from '@/components/Toasts/ToastContainer.vue';
import ErrorLoadCard from '@/components/Cards/Implementations/ErrorLoadCard.vue';
import downtimeGif from '@/assets/img/gif/downtime.gif';
import truckGif from '@/assets/img/gif/truck-whoosh.gif';
import meditationGif from '@/assets/img/gif/meditation.gif';
import { useRouter } from "vue-router";
import { TabGroup, TabPanel, TabPanels } from '@headlessui/vue';
import TabButtons from '@/components/Tabs/TabButtons.vue';
import { faCalculator, faListOl } from '@fortawesome/free-solid-svg-icons';
import {useI18n} from "vue-i18n";
import PingTest from "@/views/PingTest.vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {translateDateRange} from "../assets/js/Mixins/TreeShake/dateTime.js";
import {nthAlphabet} from "@/assets/js/Mixins/TreeShake/alphaNumeric.js";
import {defaultDarkModeCheck} from "@/assets/js/Mixins/TreeShake/browserBehavior.js";
import TheCalculator from "@/views/Component/TheCalculator.vue";

const ping = ref('');
const toast = ref(null);
const nav = ref(null);
const { t, locale } = useI18n();
const router = useRouter();

const userActions = ref([]);
const pushAction = (action, latency, httpStatus) => {
  userActions.value.push({
    time: new Date().toISOString(),
    action,
    latency,
    httpStatus,
  });
  localStorage.setItem('userActions', JSON.stringify(userActions.value));
};

function manualPushToast(content) {
  toast.value.pushIntoQueue(content);
}

const fallbackImageUrl = 'https://placehold.co/400x600';

const confirmEnd = reactive({
  open: false,
  disable: false,
  loadStatus: 1,
  error: {
    code: '',
    message: '',
  },
});

const examDetail = reactive({
  loadStatus: 0,
  error: '',
  data: {
    certification_participant: {
      certification_participant_id: '01j0tap0pycw93abqsgxzp14z2',
      participant_name: 'Sidharta Gautama',
      participant_photo_url: 'https://placehold.co/200x300.png',
    },
    scheme: {
      id: '01hpee44p8165ps3p0cks5js4m',
      sttk_name: 'Web Developer',
      bnsp_name: 'BNSP Informatika',
    },
    scheme_level: null,
    certification_schedule: {
      certification_schedule_id: '',
      company_name: 'PT Anugerah Jaya Merdeka',
      certification_start_at: '2024-06-25',
      certification_end_at: '2024-06-26',
      type: 'regular',
    },
    questions: [
      {
        id: '01j1pcdtrw9jsq4m061yavfnme',
        is_answered: false,
        has_notes: false,
      },
    ],
    timeout: '2024-07-01 14:31:34',
  },
});

/**
 * Timer instance
 * @type {null}
 */
let timerInterval = null;

const goToEvaluation = () => {
  const disableEval = import.meta.env.VITE_DISABLE_EVAL === 'true';
  if (disableEval) {
    router.push('/');
  } else {
    router.push({
      name: 'eval',
      params: {
        pid: examDetail.data.certification_participant.certification_participant_id,
        sid: examDetail.data.certification_schedule.certification_schedule_id,
      }
    });
  }
};

const finishExam = async () => {
  clearInterval(timerInterval);
  confirmEnd.open = true;
  confirmEnd.loadStatus = 0;
  confirmEnd.disable = true;
  await examReq
    .setBody({
      network: ping.value.stats,
      history: userActions.value,
    })
    .post('participant_exam.finish_exam_session')
    .then(() => {
      confirmEnd.loadStatus = 2;
      confirmEnd.open = false;
      nav.value?.resetZoom();
      goToEvaluation();
    })
    .catch((err) => {
      confirmEnd.loadStatus = -1;
      confirmEnd.error.code = err.response.status;
      const defaultError = 'Terjadi Kesalahan :(';
      confirmEnd.error.message = err.response.data ? err.response.data.error ?? defaultError : defaultError;
    })
    .finally(() => {
      confirmEnd.disable = false;
    });
};

// <==== Tentang Timer Ujian ====>
// Timer state
const timer = ref(0);

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
const formattedTimer = computed(() => formatTime(timer.value));

// Timer logic
function startTimer() {
  const endTime = new Date(examDetail.data.timeout).getTime();

  const updateTimer = () => {
    const remainingTime = endTime - Date.now();
    timer.value = Math.max(0, remainingTime);

    if (remainingTime <= 0) {
      finishExam();
    }
  };

  // Update the timer every second
  timerInterval = setInterval(updateTimer, 1000);

  // Run the first update immediately
  updateTimer();
}

// <==== Tentang Individu setiap Question ====>
const questionDetail = reactive({
  loadStatus: 0, // -1 err, 0 load, 1 success
  error: '',
  data: '',
  index: 0,
});

const getQuestionDetail = async (questionId) => {
  questionDetail.loadStatus = 0;
  const start = Date.now();
  await examReq
    .get('participant_exam.question_detail', { participant_exam_question_id: questionId })
    .then((res) => {
      questionDetail.loadStatus = 1;
      questionDetail.data = res.data.content;
      pushAction('get_q', Date.now() - start, 200);
    })
    .catch((error) => {
      questionDetail.loadStatus = -1;
      questionDetail.error = error.message;
      pushAction('get_q', Date.now() - start, error.response.status);
    });
};

const selectedTab = ref(0);

function changeTab(index) {
  selectedTab.value = index;
}

const getQuestionDetailByNumber = (index, id) => {
  questionDetail.index = index;
  selectedTab.value = 0;
  getQuestionDetail(id);
};

const selectOption = async (optionId, num) => {
  const opt = num + 1;
  const qNum = questionDetail.index + 1;
  manualPushToast({
    content: t('exam.warning.initAns', {ans: opt, num: qNum}),
    type: 'x',
    duration: 3,
    icon: 'cloud-arrow-up',
  });
  const start = Date.now();
  await examReq
    .setBody({
      participant_exam_question_id: questionDetail.data.participant_exam_question_id,
      option_id: optionId,
    })
    .post('participant_exam.modify_answer')
    .then(() => {
      examDetail.data.questions[questionDetail.index].is_answered = true;
      questionDetail.data.options.forEach((option) => {
        if (option.id === optionId) {
          option.is_chosen = true;
        } else {
          option.is_chosen = false;
        }
      });
      manualPushToast({
        content: t('exam.warning.successAns', {ans: opt, num: qNum}),
        type: 'success',
      });
      pushAction('submit_ans', Date.now() - start, 200);
    })
    .catch((error) => {
      manualPushToast({
        title: t('exam.warning.faultAns', {ans: opt, num: qNum}),
        content: error.message,
        type: 'danger',
      });
      pushAction('submit_ans', Date.now() - start, error.response.status);
    });
};

const descriptionAnswer = async () => {
  const start = Date.now();
  await examReq
    .setBody({
      participant_exam_question_id: questionDetail.data.participant_exam_question_id,
      freetext_answer: questionDetail.data.freetext_answer,
    })
    .post('participant_exam.modify_answer')
    .then((res) => {
      examDetail.data.questions[questionDetail.index].is_answered = true;
      questionDetail.data.freetext_answer = res.data.content.freetext_answer;

      manualPushToast({
        content: res.data.message,
        type: 'success',
      });
      pushAction('submit_ess', Date.now() - start, 200);
    })
    .catch((error) => {
      manualPushToast({
        content: error.message,
        type: 'danger',
      });
      pushAction('submit_ess', Date.now() - start, error.response.status);
    });
};

// <==== Tentang Info Ujian/Question Number ====>
// Camera
const video = ref(null);

const openCamera = async () => {
  if (!video.value) {
    console.error('Video element not found');
    return;
  }
  try {
    video.value.srcObject = await navigator.mediaDevices.getUserMedia({video: true});
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};

const getQuestionNumbers = async () => {
  examDetail.loadStatus = 0;
  await examReq
    .get('participant_exam.question_numbers')
    .then(async (res) => {
      await nextTick();
      openCamera();
      examDetail.data = res.data.content;
      getQuestionDetail(examDetail.data.questions[0]?.id);
      examDetail.loadStatus = 1;
      startTimer();
    })
    .catch((error) => {
      examDetail.loadStatus = -1;
      examDetail.error = error.message;

      const errMsg = error.response.data.message;
      if (errMsg === 'Waktu Anda sudah habis') goToEvaluation();
      else if (errMsg === 'Anda sudah mengerjakan ujian ini sebelumnya!') router.push('/');
      else {
        manualPushToast({
          content: error.message,
          type: 'danger',
        });
      }
    });
};

// Pengaturan Notes
const notesModal = reactive({
  show: false,
  disabled: false,
  data: {
    id: '',
    notes: '',
    status: false,
  },
});

const openNotesModal = (theNote, optionId) => {
  if (!theNote) {
    notesModal.data = {
      id: optionId,
      notes: '',
      status: false,
    };
  } else {
    notesModal.data = {
      id: optionId,
      notes: theNote.notes,
      status: true,
    };
  }
  notesModal.disabled = false;
  notesModal.show = true;
};

const addNote = async () => {
  notesModal.disabled = true;
  const start = Date.now();
  await examReq
    .setBody({
      participant_exam_question_id: questionDetail.data.participant_exam_question_id,
      notes: notesModal.data.notes,
      option_id: notesModal.data.id,
    })
    .post('participant_exam.modify_note')
    .then((res) => {
      examDetail.data.questions[questionDetail.index].has_notes = true;
      questionDetail.data.options.forEach((option) => {
        if (option.id === notesModal.data.id) {
          option.note = notesModal.data;
        }
      });
      notesModal.show = false;
      manualPushToast({
        content: res.data.message,
        type: 'success',
      });
      pushAction('add_note', Date.now() - start, 200);
    })
    .catch((error) => {
      notesModal.show = false;
      manualPushToast({
        content: error.message,
        type: 'danger',
      });
      pushAction('add_note', Date.now() - start, error.response.status);
    })
    .finally(() => {
      notesModal.disabled = false;
    });
};

const removeNote = async () => {
  const start = Date.now();

  await examReq
    .setBody({
      participant_exam_question_id: questionDetail.data.participant_exam_question_id,
      option_id: notesModal.data.id,
    })
    .post('participant_exam.remove_note')
    .then((res) => {
      examDetail.data.questions[questionDetail.index].has_notes = false;
      questionDetail.data.options.forEach((option) => {
        if (option.id === notesModal.data.id) {
          option.note = null;
        }
      });
      notesModal.show = false;
      manualPushToast({
        content: res.data.message,
        type: 'success',
      });
      pushAction('del_note', Date.now() - start, 200);
    })
    .catch((error) => {
      notesModal.show = false;
      manualPushToast({
        content: error.message,
        type: 'danger',
      });
      pushAction('del_note', Date.now() - start, error.response.status);

    });
};

const stringClock = computed(() => {
  const {h, m, s} = timerTime;

  if (h > 0) return `${ t('exam.timer.hour', { n: h }) } ${ t('exam.timer.min', { n: m }) } ${ t('exam.timer.sec', { n: s }) }`;
  if (m > 0) return `${ t('exam.timer.min', { n: m }) } ${ t('exam.timer.sec', { n: s }) }`;
  return t('exam.timer.sec', { n: s });
});

/**
 * Jumlah soal yang belum dijawab.
 * @type {ComputedRef<unknown>}
 */
const unansweredQuestions = computed(() => {
  if (examDetail.data) return examDetail.data.questions.filter((x) => !x.is_answered).length;
  return 0;
});

const tabs = [
  {
    icon: faListOl,
    name: t('exam.number.list'),
  },
  {
    icon: faCalculator,
    name: t('exam.number.calc'),
  },
];

onMounted(() => {
  userActions.value = JSON.parse(localStorage.getItem('userActions') ?? '[]');
  getQuestionNumbers();
  defaultDarkModeCheck();
  getCurrentWindow().setFullscreen(true);
  getCurrentWindow().setAlwaysOnTop(true);
});

onUnmounted(() => {
  getCurrentWindow().setFullscreen(false);
  getCurrentWindow().setAlwaysOnTop(false);
  clearInterval(timerInterval);
});
</script>

<template>
  <div class="min-h-screen bg-light dark:bg-dark">
    <ToastContainer ref="toast"/>

    <NavBar>
      <template #header>
        <p class="text-sm font-extrabold">{{ t('exam.nav') }}</p>
      </template>
    </NavBar>

    <div class="p-4 main-content no-nav">
      <!-- Status loading dan error ketika get Question Number -->
      <LoadingCard
        v-if="examDetail.loadStatus === 0"
        :title="t('exam.initial')"
        :use-img="truckGif"
        with-time
      />

      <ErrorLoadCard
        v-else-if="examDetail.loadStatus === -1"
        :load-function="() => {
          getQuestionNumbers()
        }"
        :error="examDetail.error ?? 'Hehe'"
      />

      <!-- Eksekusi Ujian -->
      <template v-else>
        <!-- Info Detail Ujian dan Peserta -->
        <BasicCard>
          <div class="flex justify-between w-full gap-4">
            <div class="flex items-center">
              <div>
                <p class="text-sm">{{ examDetail.data.scheme.name ?? '-' }}</p>
                <h2>{{ examDetail.data.scheme_level?.name || '-' }}</h2>
                <p class="text-xs">
                  <span v-if="examDetail.data.certification_schedule.type === 'regular'">{{ t('exam.header.typeRegular') }}</span>
                  <span v-else>{{
                      examDetail.data.certification_schedule.company_name ?? t('exam.header.typePartnership')
                    }}</span>
                  -
                  {{
                    translateDateRange(
                      examDetail.data.certification_schedule.certification_start_at,
                      examDetail.data.certification_schedule.certification_end_at,
                      true,
                      t('exam.header.till')
                    )
                  }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 flex-col md:flex-row items-end md:items-center">
              <div class="bg-gray-100 dark:bg-gray-800 text-white px-4 py-2 rounded-xl">
                <PingTest
                  v-if="examDetail.loadStatus === 1"
                  ref="ping"
                  on-left
                  monitor
                  :exam-session-id="examDetail.data.certification_schedule.certification_schedule_id"
                  :participant-id="examDetail.data.certification_participant.certification_participant_id"
                />
              </div>
              <div class="bg-blue-600 text-white px-4 py-3 rounded-xl">
                <div class="w-full flex items-center gap-2">
                  <div class="w-full text-right">
                    <p class="text-xs italic font-extrabold">{{ t('exam.header.timer') }}</p>
                    <p class="text-xl">{{ formattedTimer }}</p>
                  </div>
                  <div>
                    <font-awesome-icon icon="stopwatch" size="2xl"></font-awesome-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BasicCard>

        <!-- Notification Waktu Hampir Habis -->
        <div
          v-if="([15, 10].includes(timerTime.m) || timerTime.m < 5) && timerTime.h < 1"
          class="mx-4 py-2 px-3 bg-red-600 rounded-b-xl text-white text-sm"
        >
          <div class="flex gap-2">
            <div class="flex items-center">
              <font-awesome-icon icon="exclamation-triangle" size="lg"></font-awesome-icon>
            </div>
            <div>
              <p v-if="[15, 10].includes(timerTime.m) && timerTime.h < 1">
                {{ t('exam.timer.1st', { time: timerTime.m }) }}
              </p>
              <div v-else>
                <p v-if="timerTime.m > 1">
                  {{
                    t('exam.timer.2nd', {
                      m: timerTime.m,
                      s: timerTime.s,
                      min: t('exam.timer.min', { n: timerTime.m }),
                      sec: t('exam.timer.sec', { n: timerTime.s })
                    })
                  }}
                </p>
                <p v-else>
                  {{
                    t('exam.timer.3rd', {
                      s: timerTime.s,
                      sec: t('exam.timer.sec', { n: timerTime.s })
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid soal -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mt-4">
          <!-- Status Loading dan Error ketika get soal -->
          <LoadingCard
            v-if="questionDetail.loadStatus === 0"
            :title="t('exam.quest.load')"
            :use-img="meditationGif"
            with-time
          />

          <ErrorLoadCard
            v-else-if="questionDetail.loadStatus === -1"
            :load-function="() => {
              getQuestionDetail(examDetail.data.questions[questionDetail.index]?.id)
            }"
            :error="questionDetail.error ?? 'Hehe'"
          />

          <!-- Isi Soal -->
          <div v-else>
            <div class="grid grid-cols-1 gap-4">
              <!-- Atribut soal -->
              <div class="grid grid-cols-1 gap-2">
                <BasicCard v-if="questionDetail.data.exam_question_attribute">
                  <h4>{{ questionDetail.data.exam_question_attribute.command }}</h4>
                  <vue-mathjax :formula="questionDetail.data.exam_question_attribute.content" :safe="false"/>
                </BasicCard>

                <!-- Soal -->
                <BasicCard>
                  <div>
                    <h3>{{ t('exam.quest.num') }} {{ questionDetail.index + 1 }}</h3>
                    <vue-mathjax :formula="questionDetail.data.question" :safe="false"/>
                  </div>
                </BasicCard>

                <!-- Daftar Jawaban MC -->
                <BasicCard v-if="questionDetail.data.type === 'mc'">
                  <div class="mb-4 text-xs italic text-center">
                    <p>{{ t('exam.quest.commandPick') }}</p>
                    <p>
                      {{ t('exam.quest.optionPicked') }}
                      <font-awesome-icon icon="check" class="mx-1"></font-awesome-icon>
                      . {{ t('exam.quest.optionNote') }}
                      <font-awesome-icon icon="comment" class="mx-1">
                      </font-awesome-icon>
                    </p>
                  </div>
                  <div class="grid grid-cols-1 gap-4">
                    <AnswerCard
                      v-for="(option, num) in questionDetail.data.options"
                      :alphabet="nthAlphabet(num)"
                      :key="option.id"
                      class="cursor-pointer"
                      :notes="option.note"
                      :selected="option.is_chosen"
                      @pick-answer="selectOption(option.id, num)"
                      @click-note="openNotesModal(option.note, option.id)"
                    >
                      <!-- cek jika jawaban dipilih -->
                      <vue-mathjax :formula="option.option" :safe="false"/>
                    </AnswerCard>
                  </div>
                </BasicCard>

                <!-- Field jawaban Uraian -->
                <BasicCard v-else>
                  <p class="text-xs italic text-center mb-4">
                    {{ t('exam.quest.essayIntro') }}
                    <span class="font-extrabold text-green-500">{{ t('button.sendAns') }}.</span> {{ t('exam.quest.essayCont') }}
                  </p>
                  <FormQuill :label="t('exam.quest.yourAns')" v-model="questionDetail.data.freetext_answer"/>
                  <div class="btn-group mt-2">
                    <BasicButton icon="paper-plane" color="green" expanded @click="descriptionAnswer">
                      {{ t('button.sendAns') }}
                    </BasicButton>
                  </div>
                </BasicCard>
              </div>

              <!-- Kontrol jawaban yang ada dibawah soal -->
              <div class="flex stretch-flex gap-4">
                <BasicButton
                  color="primary"
                  icon="angles-left"
                  :disabled="questionDetail.index === 0"
                  @click="
                  getQuestionDetailByNumber(
                    (questionDetail.index -= 1),
                    examDetail.data.questions[questionDetail.index].id
                  )
                "
                >
                  {{ t('button.prev') }}
                </BasicButton>

                <BasicButton
                  color="primary"
                  icon="angles-right"
                  :disabled="questionDetail.index === examDetail.data.questions.length - 1"
                  @click="
                  getQuestionDetailByNumber(
                    (questionDetail.index += 1),
                    examDetail.data.questions[questionDetail.index].id
                  )
                "
                >
                  {{ t('button.next') }}
                </BasicButton>
              </div>
            </div>
          </div>

          <!-- Grid Kanan -->
          <div>
            <div class="grid grid-cols-1 gap-2">
              <!-- Timer dan Kamera -->
              <div class="bg-secondary dark:bg-secondary-dark text-center w-full px-2 py-2 rounded-xl">
                <div class="all-center flex-grow-0 flex-shrink-0">
                  <div class="flex flex-row gap-2">
                    <img
                      :src="examDetail.data.certification_participant.participant_photo_url"
                      class="h-24 mx-auto rounded-lg"
                      alt="profile"
                      @error="examDetail.data.certification_participant.participant_photo_url = fallbackImageUrl"
                    />

                    <div class="h-24 rounded-lg flex-shrink-0 relative overflow-hidden">
                      <video ref="video" autoplay muted class="h-24"></video>

                      <div class="flex absolute right-1 top-1 animate-pulse">
                        <div class="badge badge-icon danger text-xs">
                          <font-awesome-icon icon="video"></font-awesome-icon>
                          Live
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h5 class="w-full mt-2">{{ examDetail.data.certification_participant.participant_name }}</h5>
              </div>

              <!-- Kontrol Daftar Soal -->
              <TabGroup :selected-index="selectedTab" @change="changeTab">
                <TabButtons :tab-list="tabs" alt />

                <TabPanels>
                  <TabPanel>
                    <BasicCard>
                      <template #header>
                        <p class="text-sm font-extrabold text-center">{{ t('exam.number.list') }}</p>
                      </template>

                      <div class="flex flex-wrap gap-3 cursor-pointer">
                        <NumberButton
                          v-for="(question, index) in examDetail.data.questions"
                          :key="question.id"
                          :answered="question.is_answered"
                          :have-note="question.has_notes"
                          :selected="index === questionDetail.index"
                          @click="getQuestionDetailByNumber(index, question.id)"
                        >
                          {{ index + 1 }}
                        </NumberButton>
                      </div>

                      <div class="flex justify-center mt-4">
                        <BasicButton icon="flag-checkered" color="red" @click="confirmEnd.open = true">
                          {{ t('button.finish') }}
                        </BasicButton>
                      </div>
                    </BasicCard>
                  </TabPanel>

                  <TabPanel>
                    <TheCalculator />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Catatan -->
    <DialogModal :show="notesModal.show" :closeable="!notesModal.disabled" @close="notesModal.show = false">
      <template #title>{{ t('exam.note.modalTitle') }}</template>
      <template #content>
        <p class="text-sm">{{ t('exam.note.explain') }}</p>
        <FormTextarea id="note-question" v-model="notesModal.data.notes" :label="t('exam.note.yourNote')"/>
      </template>
      <template #footer>
        <BasicButton icon="times" color="red" :disabled="notesModal.disabled" @click="notesModal.show = false">
          {{ t('button.cancel') }}
        </BasicButton>
        <BasicButton
          v-if="notesModal.data.status"
          icon="trash-alt"
          color="red"
          :on-loading="notesModal.disabled"
          @click="removeNote"
        >
          {{ t('button.deleteNote') }}
        </BasicButton>
        <BasicButton icon="paper-plane" color="green" :on-loading="notesModal.disabled" @click="addNote()">
          {{ notesModal.data.notes ? t('button.storeNote') : t('button.storeNoteEmpty') }}
        </BasicButton>
      </template>
    </DialogModal>

    <ConfirmationModal
      :show="confirmEnd.open"
      :closeable="timer > 0"
      :use-img="downtimeGif"
      icon-color="bg-primary"
      @close="confirmEnd.open = false"
    >
      <template #title>
        {{ timer > 0 ? t('exam.finish.titleEarly') : t('exam.finish.titleFinishing') }}
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BasicCard no-animate>
            <div class="flex items-center gap-2">
              <div class="w-14">
                <font-awesome-icon size="2xl" icon="stopwatch"></font-awesome-icon>
              </div>
              <div class="text-left w-full">
                <p class="italic text-sm">{{ t('exam.header.timer') }}</p>
                <p class="text-red-500 font-extrabold text-xl">
                  {{ stringClock }}
                </p>
              </div>
            </div>
          </BasicCard>

          <BasicCard no-animate>
            <div class="flex items-center gap-2">
              <div class="w-14">
                <font-awesome-icon size="2xl" icon="file-pen"></font-awesome-icon>
              </div>
              <div class="text-left w-full">
                <p class="italic text-sm">{{ t('exam.finish.questRemain') }}</p>
                <p class="text-red-500 font-extrabold text-xl">
                  <template v-if="unansweredQuestions > 0">
                    <span class="text-red-500 font-extrabold">{{ unansweredQuestions }}</span> {{ t('exam.finish.unanswered') }}
                  </template>
                  <template v-else><span class="text-green-500 font-extrabold">{{ t('exam.finish.allDone') }}</span></template>
                </p>
              </div>
            </div>
          </BasicCard>
        </div>
        <LoadingCard
          v-if="confirmEnd.loadStatus === 0"
          :title="t('exam.finish.storing')"
          :use-img="truckGif"
          with-time
        >
          {{ t('exam.finish.afterWarning') }}
        </LoadingCard>
        <div v-else-if="confirmEnd.loadStatus === -1">
          <BasicCard>
            <font-awesome-icon icon="car-burst" size="2xl"></font-awesome-icon>
            <h5 class="mt-2">{{ confirmEnd.error.message ?? 'Terjadi Kesalahan :(' }}</h5>
            <p class="text-sm">{{ confirmEnd.error.code }}</p>
          </BasicCard>
        </div>
        <p v-else-if="confirmEnd.loadStatus === 1 && timer > 0">{{ t('exam.finish.warning') }}</p>
      </template>
      <template #footer>
        <BasicButton
          v-if="timer > 0"
          :disabled="confirmEnd.loadStatus === 0"
          icon="times"
          color="green"
          @click="confirmEnd.open = false"
        >
          {{ t('button.contExam') }}
        </BasicButton>
        <BasicButton
          :on-loading="confirmEnd.loadStatus === 0"
          icon="flag-checkered"
          color="red"
          @click="finishExam"
        >
          {{ t('button.finishExam') }}
        </BasicButton>
      </template>
    </ConfirmationModal>

    <ConfirmationModal :show="confirmEnd.loadStatus === 2" :use-img="truckGif" :closeable="false">
      <template #title>{{ t('exam.eval.bring') }}</template>
      <template #content>
        <div>
          <p>{{ t('exam.eval.intro') }}</p>
          <div class="text-left p-4">
            <ul>
              <li>{{ t('exam.eval.1st') }}</li>
              <li>{{ t('exam.eval.2nd') }}</li>
            </ul>
          </div>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>

<style scoped></style>
