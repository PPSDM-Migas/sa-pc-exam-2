<template>
  <div v-if="show" class="banner-container text-white">
    <!-- Top left icon -->
    <div class="absolute -left-3">
      <div class="banner-icon" :class="bannerIconBackgroundColor">
        <font-awesome-icon size="lg" :icon="iconSelection" class="ml-0.5" />
      </div>
    </div>

    <!-- Info for closing banner -->
    <div class="toast-header" :class="bannerCloseInfoColor">
      <p>{{ title }}</p>
    </div>

    <!-- Close Button Group -->
    <div
      class="group toast-close-container"
      :class="[bannerBackgroundColor, delayCountdown > 0 ? 'delay' : '']"
      @click="closeToast"
    >
      <!-- The button -->
      <button v-if="delayCountdown <= 0" class="toast-close-btn group-hover:opacity-70">
        <font-awesome-icon icon="times" />
      </button>
      <button v-else class="toast-close-btn delay">
        <img src="/storage/svg/Clock.svg" />
      </button>

      <!-- Timer before auto execute -->
      <div class="toast-btn-timer">{{ delayCountdown <= 0 ? timeoutCountdown : delayCountdown }}s</div>
    </div>

    <!-- Main content -->
    <div class="h-[calc(0.5rem+1px)] -mb-px w-[calc(100%-2.5rem)]" :class="bannerBackgroundColor"></div>
    <div class="rounded-r-lg rounded-bl-lg w-full pb-1.5 px-3 relative z-1" :class="bannerBackgroundColor">
      <ul v-if="mixins.checkVarType(message) === 'array'" class="pl-4">
        <li v-for="(msg, i) in message" :key="i">{{ msg }}</li>
      </ul>
      <p v-else>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';

const props = defineProps({
  bannerType: {
    type: String,
    default: 'success',
  },
  bgColor: String,
  iconBgColor: String,
  closeBgColor: String,
  closeCaption: {
    type: String,
    default: 'Tutup',
  },
  icon: String,
  message: [String, Array, Number],
  id: [String, Number],
  duration: {
    type: Number,
    default: 5,
  },
  delay: Number,
  title: String,
});

const show = ref(true);
const bannerBackgroundColor = computed(() => {
  if (props.bgColor) return props.bgColor;
  switch (props.bannerType) {
    case 'success':
    case 'green':
      return 'banner-green';
    case 'danger':
    case 'red':
      return 'banner-red';
    case 'info':
    case 'blue':
      return 'banner-blue';
    case 'warning':
    case 'yellow':
      return 'banner-yellow';
    default:
      return 'bg-purple-700';
  }
});
const bannerIconBackgroundColor = computed(() => {
  if (props.iconBgColor) return props.iconBgColor;
  switch (props.bannerType) {
    case 'success':
    case 'green':
      return 'banner-icon-green';
    case 'danger':
    case 'red':
      return 'banner-icon-red';
    case 'info':
    case 'blue':
      return 'banner-icon-blue';
    case 'warning':
    case 'yellow':
      return 'banner-icon-yellow';
    default:
      return 'bg-purple-800';
  }
});
const bannerCloseInfoColor = computed(() => {
  if (props.closeBgColor) return props.closeBgColor;
  switch (props.bannerType) {
    case 'success':
    case 'green':
      return 'banner-header-green';
    case 'danger':
    case 'red':
      return 'banner-header-red';
    case 'info':
    case 'blue':
      return 'banner-header-blue';
    case 'warning':
    case 'yellow':
      return 'banner-header-yellow';
    default:
      return 'bg-purple-600';
  }
});
/**
 * Icon yang ditampilkan berdasarkan style banner
 * @return {string}
 */
const iconSelection = computed(() => {
  if (props.icon) return props.icon;
  switch (props.bannerType) {
    case 'success':
    case 'green':
      return 'check-circle';
    case 'danger':
    case 'red':
      return 'times-circle';
    case 'info':
    case 'blue':
      return 'info-circle';
    case 'warning':
    case 'yellow':
      return 'exclamation-circle';
    default:
      return 'question-circle';
  }
});

const emits = defineEmits(['close']);
const timeoutCountdown = ref(props.duration);
const delayCountdown = ref(props.delay);

let timeoutInterval;
let delayInterval;
function closeToast() {
  if (delayCountdown.value <= 0) {
    clearTimeout(timeoutInterval);
    clearTimeout(delayInterval);
    emits('close', props.id);
  }
}
function startInterval() {
  timeoutInterval = setInterval(() => {
    timeoutCountdown.value--;
    if (timeoutCountdown.value <= 0) closeToast();
  }, 1000);
}

onMounted(() => {
  if (props.message) {
    if (delayCountdown.value <= 0) startInterval();
    else {
      delayInterval = setInterval(() => {
        delayCountdown.value--;
        if (delayCountdown.value <= 0) startInterval();
      }, 1000);
    }
  }
});
</script>
