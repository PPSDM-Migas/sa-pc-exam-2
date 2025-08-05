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
          <div class="navbar-btn-container flex pr-0 lg:pr-4">
            <color-switch-nav />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import ApplicationLogo from '@/Components/Logo/ApplicationLogo.vue';
import ColorSwitchNav from '@/Components/Navs/ColorSwitchNav.vue';

defineProps({
  hideNav: Boolean,
});
</script>

<style scoped>
:deep(.navbar-btn-container > :not([hidden]) ~ :not([hidden])) {
  margin: 0;
}
</style>
