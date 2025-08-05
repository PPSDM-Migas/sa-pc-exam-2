<script setup>
import { onMounted, ref } from 'vue';
import {animate, eases, utils} from 'animejs';
import axios from 'axios';
import LogoCard from '@/components/Cards/LogoCard.vue';
import {useI18n} from "vue-i18n";

const defaultError = 'Terjadi Kesalahan :(';
const schemeNames = {
  loadStatus: 0,
  data: [],
  error: {
    code: 0,
    message: 'Terjadi Kesalahan :(',
  },
};
const source = import.meta.env.VITE_BASE_API ?? 'http://127.0.0.1:10600';

const queueArray = ref([]); // 3 Visible item on queue
const slideContainer = ref(null);

const vsOpts = {
  duration: 1000,
  lineHeight: 2 * 16, // Pixel
};

let currentIndex = 0;

const getNextIndex = (index) => (index + 1) % schemeNames.data.length;

const updateVisibleSlides = () => {
  const prevIndex = currentIndex === 0 ? schemeNames.data.length - 1 : currentIndex - 1;
  const nextIndex = getNextIndex(currentIndex);

  queueArray.value[0] = schemeNames.data[prevIndex]; // Previous
  queueArray.value[1] = schemeNames.data[currentIndex]; // Current
  queueArray.value[2] = schemeNames.data[nextIndex]; // Next
  currentIndex = nextIndex;
};

const singleStringBounceEffect = () => {
  animate(slideContainer.value, {
    translateY: -vsOpts.lineHeight,
    ease: eases.outElastic(1, .4),
    duration: vsOpts.duration,
    onComplete: () => {
      updateVisibleSlides(); // Update the queue array
      utils.set(slideContainer.value, { translateY: 0 }); // Reset the translateY to create the looping effect
      singleStringBounceEffect(); // Recursively call to continue the animation loop
    },
  });
};

const getSchemeNames = async () => {
  schemeNames.loadStatus = 0;
  await axios.get(`${source}/api/pub/scheme`).then((res) => {
    schemeNames.loadStatus = 1;
    schemeNames.data = res.data.content;
  }).catch((err) => {
    schemeNames.loadStatus = -1;
    schemeNames.error.code = err.response.status;
    schemeNames.error.message = err.response.data ? err.response.data.error ?? defaultError : defaultError;
  });
};

const mountNames = () => {
  getSchemeNames().then(() => {
    queueArray.value = [
      schemeNames.data[schemeNames.data.length - 1],
      schemeNames.data[0],
      schemeNames.data[1] ?? schemeNames.data[0],
    ];
    singleStringBounceEffect();
  });
};

const { t } = useI18n();

onMounted(() => {
  mountNames();
});
</script>

<template>
  <div class="text-center">
    <div class="flex justify-center mb-4">
      <LogoCard />
    </div>
    <h1>{{ t('title') }}</h1>
    <div class="slider-frame col-sm-3 offset-sm-3 overflow-hidden">
      <ul ref="slideContainer" class="slider-container text-white">
        <li v-for="(slide, index) in queueArray" :key="index" class="slider-item">{{ slide }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.slider-frame {
  height: 2rem;
  overflow: hidden;
  text-align: center;
}
ul.slider-container {
  list-style-type: none;
  transform: translateY(50px);
  padding:0;
}
.slider-item {
  font-size: 1.2rem;
  line-height: 2rem;
}
</style>
