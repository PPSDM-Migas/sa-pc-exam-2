<script setup>

import {invoke} from "@tauri-apps/api/core";
import BasicButton from "@/components/Buttons/BasicButton.vue";

const shutPcDown = (command) => {
  // if (command === 'shutdown') {
  //   willShutdown.value = true;
  //   shutdownCt.value = 60;
  //   shutdownTimer = setInterval(() => {
  //     shutdownCt.value--;
  //     if (shutdownCt.value <= 0) {
  //       clearInterval(shutdownTimer);
  //     }
  //   }, 1000);
  // }
  // else if (command === 'cancelShutdown') {
  //   willShutdown.value = false;
  //   clearInterval(shutdownTimer);
  // }
  invoke('trigger_shutdown_state', { command }).catch(console.error);
};

const exitApp = () => {
  invoke('closing_app', { code: 1 });
};
</script>

<template>
  <h1 class="font-extrabold">Hello</h1>
  <p @click="exitApp">Close</p>
  <p @click="shutPcDown('sleep')">Sleep</p>
  <BasicButton>:D</BasicButton>
</template>
