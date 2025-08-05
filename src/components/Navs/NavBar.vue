<template>
  <nav class="navbar-container" :class="userColor">
    <div class="navbar-icon">
      <Link :href="route('dashboard')">
        <ApplicationLogo class="block h-9 w-auto" />
      </Link>
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
          <nav-user-button class="hidden lg:block mr-0">Edit Profil Saya</nav-user-button>
          <div class="navbar-btn-container flex pr-0 lg:pr-4">
            <nav-link :icon="faBell" class="z-1">
              <template #tooltip>Notifikasi</template>
            </nav-link>
            <nav-link :href="route('cart')" :icon="faCartShopping" class="z-1">
              <template #tooltip>Keranjang Saya</template>
            </nav-link>
            <color-switch-nav />
            <nav-link icon-css="text-ternary" icon="right-from-bracket" class="z-1" @clickEvent="doLogout">
              <template #default>Keluar</template>
              <template #tooltip>Keluar/Ganti akun</template>
            </nav-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import ApplicationLogo from '@/Components/Logo/ApplicationLogo.vue';
import NavLink from '@/Components/Navs/NavLink.vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import NavUserButton from '@/Components/Navs/NavUserButton.vue';
import ColorSwitchNav from '@/Components/Navs/ColorSwitchNav.vue';
import { route } from 'ziggy-js';
import { computed } from 'vue';
import { faBell, faCartShopping } from '@fortawesome/free-solid-svg-icons';

defineProps({
  hideNav: Boolean,
});

function doLogout() {
  router.post(route('logout'), {});
}

const page = usePage();

const userColor = computed(() => {
  const types = {
    personal: 'from-ternary',
    company: 'from-secondary',
    provider: 'from-green-600',
  };
  return types[page.props.auth.user.user_type] ?? '';
})
</script>

<style scoped>
:deep(.navbar-btn-container > :not([hidden]) ~ :not([hidden])) {
  margin: 0;
}
</style>
