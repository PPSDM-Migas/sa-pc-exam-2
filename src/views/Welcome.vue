<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { animate } from 'animejs';
import axios from 'axios';
import { mixins } from "@/assets/js/Mixins/mixinDeprecate.js";
import ZoomCard from '@/components/Cards/ZoomCard.vue';
import BasicCard from '@/components/Cards/BasicCard.vue';
import LoadingCard from '@/components/Cards/LoadingCard.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import LogoTitleCard from '@/components/Cards/LogoTitleCard.vue';
import testGif from '@/assets/img/gif/test.gif';
import truckGif from '@/assets/img/gif/truck-whoosh.gif';
import WithShutdownLayout from "@/layouts/WithShutdownLayout.vue";
import BackgroundLayout from "@/layouts/BackgroundLayout.vue";
import {useI18n} from "vue-i18n";

const source = import.meta.env.VITE_BASE_API ?? 'http://127.0.0.1:10600';
const todaySchedules = reactive({
  loadStatus: 0,
  error: {
    code: 0,
    message: '',
  },
  data: [],
});

const defaultError = 'Terjadi Kesalahan :(';

const creditsContainer = ref(null);
const creditsContent = ref(null);

const creditRollEffect = () => {
  const containerHeight = creditsContainer.value.offsetHeight;
  const contentHeight = creditsContent.value.offsetHeight;

  animate(creditsContent.value, {
    translateY: [containerHeight, -contentHeight],
    ease: 'linear',
    duration: todaySchedules.data.length * 2500,
    loop: true,
    delay: 500,
  });
};

const getTodaySchedules = async () => {
  todaySchedules.loadStatus = 0;
  await axios.get(`${source}/api/pub/today`).then((res) => {
    todaySchedules.loadStatus = 1;
    todaySchedules.data = res.data.content;
  }).catch((err) => {
    todaySchedules.loadStatus = -1;
    todaySchedules.error.code = err.response.status;
    todaySchedules.error.message = err.response.data ? err.response.data.error ?? defaultError : defaultError;
  });
};

const mountSchedule = () => {
  getTodaySchedules().then(() => {
    creditRollEffect();
  });
};

const withTimer = computed(() => {
  return import.meta.env.VITE_ENV && import.meta.env.VITE_ENV === 'insite';
});

const shutdownCt = ref(-1);
const handleCountdownFromLayout = (val = -1) => {
  shutdownCt.value = val;
}

const toggleDark = () => {
  mixins.changeDarkMode();
}

const drawerOpen = ref(false);
const flipDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// eslint-disable-next-line
const getRange = (item) => mixins.translateDateRange(item.certification_start_at, item.certification_end_at, true, ' s/d ');

onMounted(() => {
  mountSchedule();
  mixins.defaultDarkModeCheck();
});

const { t, locale } = useI18n();
</script>

<template>
  <BackgroundLayout left-btn-icon="sun" right-btn-icon="power-off" right-btn-class="red" @left-corner="toggleDark()" @right-corner="flipDrawer()">
    <div class="w-full max-w-5xl z-[1]">

      <!-- The Header -->
      <LogoTitleCard class="mb-4" />

      <!-- The Main Content -->
      <div v-if="todaySchedules.loadStatus === 0" class="all-center">
        <LoadingCard
          :title="t('landing.contactingServer')"
          color="glass-dark"
          :use-img="truckGif"
          with-time
        />
      </div>
      <div v-else-if="todaySchedules.loadStatus === -1" class="all-center">
        <BasicCard>
          <div class="text-center">
            <h5>{{ t('landing.contactFail') }} :(</h5>
            <p class="text-sm">{{ todaySchedules.error.message }}</p>
          </div>
          <div class="flex justify-center mt-2">
            <BasicButton icon="arrows-rotate" @click="mountSchedule()">
              {{ t('button.retry') }}
            </BasicButton>
          </div>
        </BasicCard>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Grid 1: Schedules -->
        <div>
          <BasicCard color="glass-bright dark:glass-dark">
            <div class="mb-4 text-center text-white">
              <p class="text-lg font-extrabold">{{ t('landing.todaySchedules') }}</p>
              <p class="text-xs italic font-semibold">{{ mixins.translateDate(new Date(), true) }}</p>
            </div>

            <div
              v-if="todaySchedules.data.length > 0"
              class="overflow-hidden h-[15rem] relative"
              ref="creditsContainer"
            >
              <div class="absolute w-full grid grid-cols-1 gap-2" ref="creditsContent">
                <BasicCard v-for="(sch, i) in todaySchedules.data" :key="i">
                  <h4>{{ sch.sttk_name }}</h4>
                  <div class="italic text-sm">
                    <p v-if="sch.type === 'regular'">{{ t('landing.regularSchedule') }} - {{ getRange(sch) }}</p>
                    <p v-else>
                      {{ sch.company_name ?? t('landing.contractSchedule') }} @
                      <span class="text-primary">{{ sch.name ?? 'PPSDM Migas' }}</span> - {{ getRange(sch) }}
                    </p>
                  </div>
                </BasicCard>
              </div>
            </div>

            <div v-else class="overflow-hidden h-[15rem] relative flex items-center justify-center">
              <BasicCard>
                <div class="text-center">
                  <font-awesome-icon icon="ghost" size="2x" class="truck text-subtitle" />
                  <h4>{{ t('landing.noSchedule') }}</h4>
                </div>
              </BasicCard>
            </div>
          </BasicCard>
        </div>

        <!-- Grid 2: Start button -->
        <div class="all-center">
          <RouterLink :to="{name: 'login'}">
            <div class="w-46 h-44 relative group">
              <ZoomCard color="alternate-glass" class="w-52 h-44 overflow-hidden">
                <div>
                  <h2>{{ t('landing.start') }}</h2>
                </div>

                <!-- eslint-disable-next-line max-len -->
                <img :src="testGif" class="h-40 absolute bottom-[-2.5rem] left-[-2rem] opacity-50" alt="test" />
              </ZoomCard>

              <!-- eslint-disable-next-line max-len -->
              <div class="absolute w-16 h-16 all-center bg-primary rounded-full bottom-[-1rem] right-[-1rem] group-hover:bg-ternary-dark-alt">
                <p>
                  <font-awesome-icon icon="right-to-bracket" color="white" size="xl"></font-awesome-icon>
                </p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <WithShutdownLayout :drawer-open="drawerOpen" @shutdown-countdown="handleCountdownFromLayout" @close-drawer="flipDrawer()" />

    <template #footer>
      <p v-if="shutdownCt !== -1">
        {{ t('landing.shutdownTimer') }}
        <span class="text-red-500 font-bold">{{ shutdownCt }}</span>
      </p>
    </template>
  </BackgroundLayout>
</template>

<style scoped>
.container {
  padding: 2em;
}

.credits-container {
  overflow: hidden; /* Hide content overflow */
  height: 300px; /* Set a fixed height */
  position: relative;
}
</style>
