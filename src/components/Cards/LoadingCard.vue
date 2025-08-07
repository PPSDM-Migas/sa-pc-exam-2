<template>
  <basic-card color="bg-linear-to-bl from-10% from-yellow-400/50 to-50%" title="Memuat Data...">
    <div class="grid grid-cols-1 items-center">
      <div class="text-gray-600 dark:text-white my-2 text-center">
        <font-awesome-icon v-if="iconType === 'truck'" icon="truck" size="3x" class="truck" />
        <font-awesome-icon v-else-if="iconType === 'find'" icon="magnifying-glass" size="2x" class="find my-1" />
        <font-awesome-icon v-else-if="iconType === 'cog'" icon="cog" size="3x" spin />
      </div>

      <div class="mb-2 text-center">
        <h3>{{ title }}</h3>
        <slot />

        <div v-if="withTime" class="italic text-xs">
          Dimulai pada {{ translateDate(startTime, false, '', false, false, false, true) }} (+{{ stringTime }})
        </div>
      </div>
    </div>
  </basic-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';
// import NotificationCard from '@/components/Cards/NotificationCard.vue';
import BasicCard from '@/components/Cards/BasicCard.vue';
import {translateDate} from "../../assets/js/Mixins/TreeShake/dateTime.js";

defineProps({
  iconType: {
    type: String,
    default: 'truck',
  },
  title: {
    type: String,
    default: 'Mengambil Data... Harap Tunggu Sebentar',
  },
  withTime: Boolean,
});
const emits = defineEmits(['loadingTime']);

let count = 0;
const stringTime = ref('0:00');
const startTime = new Date();

onMounted(() => {
  setInterval(() => {
    count++;
    const h = Math.floor(count / 3600);
    const m = Math.floor((count % 3600) / 60);
    const s = Math.floor((count % 3600) % 60);
    const hClock = h > 0 ? `${h}:` : '';
    const sClock = s > 9 ? s : `0${s}`;
    stringTime.value = `${hClock}${m}:${sClock}`;
  }, 1000);
});
onBeforeUnmount(() => {
  emits('loadingTime', {
    seconds: count,
    stringTime,
    startTime,
  });
});
</script>

<style scoped></style>
