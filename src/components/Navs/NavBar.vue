<template>
  <nav class="navbar-container" :class="userColor">
    <div class="navbar-icon">
      <ApplicationLogo class="block h-9 w-auto" />
    </div>

    <!-- Primary Navigation Menu -->
    <div class="navbar">
      <div class="flex justify-between h-14">
        <!-- Page Heading -->
        <div class="shrink-0 flex items-center lg:pl-84">
          <header v-if="$slots.header" class="w-full text-xs hidden lg:block">
            <slot name="header" />
          </header>
        </div>

        <!-- Navigation Links -->
        <div v-if="!hideNav" class="flex space-x-2 -my-px sm:ml-10 w-full justify-end">
          <div class="navbar-btn-container flex pr-0 lg:pr-4 pl-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="navbar-btn z-[1]" @click="enLang = !enLang">
                    <div>
                      <img v-if="enLang" src="/src/assets/img/svg/united-kingdom.svg" alt="English" class="h-6" />
                      <img v-else src="/src/assets/img/svg/indonesia.svg" alt="Indonesia" class="h-6" />
                    </div>
                    <div class="text-xs">{{ enLang ? 'English' : 'Indonesia' }}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div class="text-xs">Bahasa</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="navbar-btn" @click="zoomIn">
                    <div>
                      <font-awesome-icon class="text-gray-700" icon="magnifying-glass-plus" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div class="text-xs">Perbesar</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="navbar-btn" @click="resetZoom">
                    <div>
                      <font-awesome-icon class="text-gray-700" icon="expand" />
                    </div>
                    <div class="text-xs">{{ (currentZoom * 100).toFixed(0) }}%</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div class="text-xs">{{ t('exam.zoomIn') }}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="navbar-btn" @click="zoomOut">
                    <div>
                      <font-awesome-icon class="text-gray-700" icon="magnifying-glass-minus" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div class="text-xs">{{ t('exam.zoomOut') }}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <color-switch-nav />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import ApplicationLogo from '@/components/Logo/ApplicationLogo.vue';
import ColorSwitchNav from '@/components/Navs/ColorSwitchNav.vue';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip/index.js";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

defineProps({
  hideNav: Boolean,
});
const { t, locale } = useI18n();

const currentZoom = ref(1.0);

const applyZoom = () => {
  document.documentElement.style.transform = `scale(${currentZoom.value})`;
  document.documentElement.style.transformOrigin = 'top left';
  document.documentElement.style.width = `${100 / currentZoom.value}%`;
  document.documentElement.style.height = `${100 / currentZoom.value}%`;
};

const zoomIn = () => {
  currentZoom.value = Math.min(currentZoom.value + 0.1, 3.0);
  applyZoom();
};

const zoomOut = () => {
  currentZoom.value = Math.max(currentZoom.value - 0.1, 0.5);
  applyZoom();
};

const resetZoom = () => {
  currentZoom.value = 1.0;
  applyZoom();
};

const enLang = ref(null);

watch(enLang, () => {
  if (enLang.value) locale.value = 'en';
  else locale.value = 'id';

  localStorage.setItem('lang', locale.value);
})

onMounted(() => {
  const saved = localStorage.getItem('lastZoomLevel');
  currentZoom.value = saved ? parseFloat(saved) : 1.0;
  applyZoom();
});

onUnmounted(() => {
  localStorage.setItem('lastZoomLevel', currentZoom.value.toString());
  currentZoom.value = 1.0;
  applyZoom();
});

defineExpose({
  resetZoom
});
</script>

<style scoped>
:deep(.navbar-btn-container > :not([hidden]) ~ :not([hidden])) {
  margin: 0;
}
</style>
