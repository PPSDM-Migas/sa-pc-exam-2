<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import gsap from "gsap";
import {Dialog, DialogPanel, TransitionChild, TransitionRoot} from "@headlessui/vue";
import SideBarLink from "@/components/Navs/SideBarLink.vue";
import {useI18n} from "vue-i18n";
import {invoke} from "@tauri-apps/api/core";

const emits = defineEmits(['shutdownCountdown', 'closeDrawer']);
const props = defineProps({
  drawerOpen: Boolean,
});

function onBeforeEnter(el) {
  el.style.opacity = 0;
}

function onEnter(el, done) {
  gsap.to(el, {
    x: 0,
    opacity: 1,
    height: 'auto',
    delay: el.dataset.index * 0.05,
    duration: 0.3,
    startAt: {
      x: -20,
    },
    onComplete: done,
  });
}

const willShutdown = ref(false);
let shutdownTimer = null;
const shutdownCt = ref(60);
const shutPcDown = (command) => {
  if (command === 'shutdown') {
    willShutdown.value = true;
    shutdownCt.value = 60;
    shutdownTimer = setInterval(() => {
      shutdownCt.value--;
      if (shutdownCt.value <= 0) {
        clearInterval(shutdownTimer);
      }
    }, 1000);
  }
  else if (command === 'cancelShutdown') {
    willShutdown.value = false;
    clearInterval(shutdownTimer);
  }
  invoke('trigger_shutdown_state', { command }).catch(console.error);
};

const exitApp = () => {
  invoke('closing_app', { code: 1 });
}

const timer = ref(5400);
// const timer = ref(60);
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

// Timer logic
let theTimer = null;
const startShutdownTimer = () => {
  theTimer = setInterval(() => {
    timer.value--;
    emits('shutdownCountdown', formatTime(timer.value * 1000));
    if (timer.value <= 0) {
      clearInterval(theTimer);
      invoke('trigger_shutdown_state', { command: 'hibernate' }).catch(console.error);
      window.location.reload();
    }
  }, 1000);
};

const withTimer = computed(() => {
  return import.meta.env.VITE_ENV && import.meta.env.VITE_ENV === 'insite';
});

const { t } = useI18n();

onMounted(() => {
  if (withTimer.value) startShutdownTimer();
  else emits('shutdownCountdown', -1);
});

onUnmounted(() => {
  clearTimeout(theTimer);
});
</script>

<template>
  <div class="relative">
    <TransitionRoot appear :show="drawerOpen" as="template">
      <Dialog as="div" class="relative z-[51]" @close="emits('closeDrawer')">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out transition-all"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-300 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="sidebar-responsive-overlay" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-hidden">
          <div class="sidebar-responsive-container">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 translate-y-full"
              enter-to="opacity-100 translate-y-0"
              leave="duration-300 ease-in"
              leave-from="opacity-100 translate-y-0"
              leave-to="opacity-0 translate-y-full"
            >
              <DialogPanel class="sidebar-responsive">
                <div class="w-full flex items-end">
                  <div class="sidebar-responsive-profile">
                    <p class="font-bold text-lg text-white">{{ t('control.title') }}</p>
                  </div>
                  <div class="sidebar-responsive-close" @click="emits('closeDrawer')">{{ t('control.close') }}</div>
                </div>
                <transition-group
                  tag="div"
                  :css="false"
                  class="sidebar-container drawer"
                  appear
                  @before-enter="onBeforeEnter"
                  @enter="onEnter"
                >
                  <template v-if="willShutdown">
                    <SideBarLink :category="t('control.commandShutdown')" />
                    <SideBarLink icon="cloud-sun" @click="shutPcDown('cancelShutdown')">
                      {{ t('control.cancel') }} ({{ t('control.cancelTimer') }} {{ shutdownCt }})
                    </SideBarLink>
                  </template>
                  <template v-else>
                    <SideBarLink :category="t('control.titleApp')" />
                    <SideBarLink icon="right-from-bracket" @click="exitApp()">{{ t('control.exit') }}</SideBarLink>
                    <SideBarLink :category="t('control.titleControl')" />
                    <SideBarLink icon="moon" @click="shutPcDown('sleep')">{{ t('control.sleep') }}</SideBarLink>
                    <SideBarLink icon="bed" @click="shutPcDown('hibernate')">{{ t('control.hibernate') }}</SideBarLink>
                    <SideBarLink icon="power-off" @click="shutPcDown('shutdown')">
                      {{ t('control.shutdown') }}
                    </SideBarLink>
                  </template>
                </transition-group>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped>

</style>
