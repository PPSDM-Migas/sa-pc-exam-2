<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div class="navbar-btn" @click="changeMode" style="margin: 0">
          <div>
            <font-awesome-icon class="text-gray-700" size="lg" :icon="darkModeOn ? 'moon' : 'sun'" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div class="text-xs">Rubah mode warna menjadi {{ darkModeOn ? 'Terang' : 'Gelap' }}</div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip/index.js';

const darkModeOn = ref(false);

// Rubah konfigurasi dark mode
function configureMode() {
  if (darkModeOn.value) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

// Handle click untuk merubah nilai dari variabel dan localstorage sebelum merubah konfigurasi
function changeMode() {
  const newState = !darkModeOn.value;
  darkModeOn.value = newState;
  localStorage.setItem('theme', newState ? 'dark' : 'light');
  configureMode();
}

onMounted(() => {
  if (!localStorage.getItem('theme')) {
    // Sesuaikan dengan konfigurasi dark mode dari sistem.
    // eslint-disable-next-line
    darkModeOn.value = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Buat item di localstorage
    localStorage.setItem('theme', darkModeOn.value ? 'dark' : 'light');
    configureMode();
  } else {
    // Sesuaikan dengan item yang ada di localstorage
    darkModeOn.value = localStorage.getItem('theme') === 'dark';
    configureMode();
  }
});
</script>

<style scoped></style>
