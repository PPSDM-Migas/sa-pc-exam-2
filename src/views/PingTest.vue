<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPaperPlane, faWifi } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  onLeft: Boolean,
  vertical: Boolean,
  monitor: Boolean,
});

const ping = ref(0);
const isPinging = ref(false);
const connectionStatus = ref('Disconnected');

let socket = null;
let pingTimer = null;
let pingStart = null;
let disconnectStart = null;
const stats = reactive({
  max: -1,
  min: -1,
  timeSeriesBucket: [],
  disconnectHistory: [],
});

defineExpose({ stats });

const tempBucket = ref([]);

const handleReconnection = () => {
  if (disconnectStart) {
    stats.disconnectHistory.push({
      time: disconnectStart.toISOString(),
      duration: Date.now() - disconnectStart.getTime(),
    });
    disconnectStart = null;
  }
};

function connectWebSocket() {
  if (!import.meta.env.VITE_WS_PING) return;
  socket = new WebSocket(import.meta.env.VITE_WS_PING);

  const sendPing = () => {
    if (socket.readyState === WebSocket.OPEN) {
      isPinging.value = true;
      pingStart = Date.now();
      socket.send('ping');

      pingTimer = setTimeout(() => {
        if (isPinging.value) {
          socket.close();
        }
      }, 5000);
    }
  };

  socket.onopen = () => {
    connectionStatus.value = 'Connected';
    handleReconnection();
    sendPing();
  };

  socket.onmessage = (event) => {
    if (event.data === 'pong' && pingStart !== null) {
      isPinging.value = false;
      const pingVal = Date.now() - pingStart;
      ping.value = pingVal;
      stats.max = stats.max < 0 ? pingVal : Math.max(stats.max, pingVal);
      stats.min = stats.min < 0 ? pingVal : Math.min(stats.min, pingVal);

      if (props.monitor) {
        tempBucket.value.push(pingVal);

        // When we reach 10 pings (25s if 2.5s interval)
        if (tempBucket.value.length === 10) {
          // Calculate average latency
          const avgLatency = tempBucket.value.reduce((sum, val) => sum + val, 0) / 10;

          // Calculate average jitter
          let jitterSum = 0;
          for (let i = 1; i < tempBucket.value.length; i++) {
            jitterSum += Math.abs(tempBucket.value[i] - tempBucket.value[i - 1]);
          }
          const avgJitter = jitterSum / (tempBucket.value.length - 1);

          stats.timeSeriesBucket.push({
            time: new Date().toISOString(),
            latency: avgLatency,
            jitter: avgJitter,
          });

          // Clear bucket
          tempBucket.value = [];
        }

        localStorage.setItem('pingStats.timeSeriesBucket', JSON.stringify(stats.timeSeriesBucket));
        localStorage.setItem('pingStats.disconnection', JSON.stringify(stats.disconnectHistory));
        localStorage.setItem('pingStats.max', stats.max);
        localStorage.setItem('pingStats.min', stats.min);
      }

      clearTimeout(pingTimer);
      pingTimer = setTimeout(() => {
        sendPing();
      }, 2500);
    }
  };

  socket.onclose = () => {
    connectionStatus.value = 'Disconnected';

    if (!disconnectStart) {
      disconnectStart = new Date();
    }

    clearTimeout(pingTimer);
    ping.value = null;
    setTimeout(connectWebSocket, 2500); // auto-reconnect
  };

  socket.onerror = () => {
    connectionStatus.value = 'Error';
  };
}

window.addEventListener('offline', () => {
  if (!disconnectStart) disconnectStart = new Date();
});

window.addEventListener('online', handleReconnection);

const pingColor = computed(() => {
  if (ping.value >= 200) return 'text-red-500';
  if (ping.value >= 100) return 'text-amber-500 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
});

onMounted(() => {
  if (props.monitor) {
    stats.max = localStorage.getItem('pingStats.max') ?? -1;
    stats.min = localStorage.getItem('pingStats.min') ?? -1;
    stats.timeSeriesBucket = JSON.parse(localStorage.getItem('pingStats.timeSeriesBucket') ?? '[]');
    stats.disconnectHistory = JSON.parse(localStorage.getItem('pingStats.disconnection') ?? '[]');
  }
  connectWebSocket();
});

onBeforeUnmount(() => {
  if (socket) socket.close();
  clearInterval(pingTimer);
});
</script>

<template>
  <div class="text-center flex" :class="`${pingColor} ${vertical ? 'flex-col gap-1' : 'flex-row gap-2'}`">
    <p v-if="onLeft" class="font-extrabold">{{ ping }} ms</p>

    <div class="relative">
      <font-awesome-icon :icon="faWifi" size="lg"></font-awesome-icon>
      <font-awesome-icon
        v-if="isPinging"
        :icon="faPaperPlane"
        size="xs"
        class="text-primary right-0 top-3 absolute"
      ></font-awesome-icon>
    </div>

    <p v-if="!onLeft" class="font-extrabold">{{ ping }} ms</p>
  </div>
</template>

<style scoped></style>
