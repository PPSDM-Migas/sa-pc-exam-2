<template>
  <div class="hidden lg:block">
    <transition-group
      tag="div"
      :css="false"
      class="sidebar-container"
      appear
      @before-enter="onBeforeEnter"
      @enter="onEnter"
    >
      <div v-for="(nav, i) in allNavs" :key="i">
        <side-bar-link
          :data-index="i"
          :href="nav.href"
          :is-active="nav.isActive"
          :icon="nav.icon"
          :child="nav.child"
          :category="nav.category"
        >
          {{ nav.text }}
        </side-bar-link>
      </div>
    </transition-group>
  </div>

  <TransitionRoot appear :show="drawerOpen" as="template">
    <Dialog as="div" class="relative z-51" @close="drawerOpen = false">
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

      <div class="fixed bottom-0 left-0 right-0 overflow-hidden">
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
              <div class="flex items-end w-full">
                <div class="sidebar-responsive-profile">
                  <img :src="$page.props.auth.user.profile_photo_url" />
                  <div>
                    <p class="text-sm font-bold">{{ $page.props.auth.user.name }}</p>
                    <p class="font-extrabold italic text-xs">
                      {{ userType }}<span v-if="userTypeCode !== 'personal' && affiliation"> - {{ affiliation }}</span>
                    </p>
                    <p class="text-xs">Edit Profil Saya</p>
                  </div>
                </div>
                <div class="sidebar-responsive-close" @click="drawerOpen = false">Tutup</div>
              </div>
              <transition-group
                tag="div"
                :css="false"
                class="sidebar-container drawer"
                appear
                @before-enter="onBeforeEnter"
                @enter="onEnter"
              >
                <side-bar-link
                  v-for="(nav, i) in allNavs"
                  :key="i"
                  :data-index="i"
                  :href="nav.href"
                  :is-active="nav.isActive"
                  :icon="nav.icon"
                  :child="nav.child"
                  :category="nav.category"
                >
                  {{ nav.text }}
                </side-bar-link>
              </transition-group>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <div class="block lg:hidden corner-btn-container right">
    <v-tooltip>
      <div class="corner-right-btn" @click="drawerOpen = true">
        <font-awesome-icon icon="bars" size="lg" class="absolute z-51 text-white" />
      </div>

      <template #popper>Buka Menu</template>
    </v-tooltip>
  </div>
</template>

<script setup>
/* eslint-disable no-param-reassign */

import { computed, ref } from 'vue';
import gsap from 'gsap';
import SideBarLink from '@/Components/Navs/SideBarLink.vue';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { usePage } from '@inertiajs/vue3';
import { route } from 'ziggy-js';
import {
  faHandHoldingDollar,
  faTrowelBricks,
  faLayerGroup,
  faBookBookmark,
  faFileSignature,
  faCircleUser, faCertificate, faBoxOpen, faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';
import { forEach } from 'lodash';
import { permissionCheck } from '@/Mixins/TreeShake/functionalData';

// Menu yang ada di semua tipe user
const availableGlobalNavs = [];
// Menu untuk User Personal
const personalNavs = [
  {
    category: 'Transaksi',
    menu: [
      {
        icon: faBoxOpen,
        href: route('catalog.all'),
        isActive: route().current('catalog.*'),
        text: 'Katalog',
        permission: true,
      },
      {
        icon: faShoppingBag,
        href: route('transaction.history'),
        isActive: route().current('transaction.*'),
        text: 'Riwayat Transaksi',
        permission: true,
      },
    ]
  }
];
// Menu untuk User Perusahaan
const companyNavs = [];
// Menu untuk User Mitra
const providerNavs = [
  {
    category: 'Mitra Resmi',
    menu: [
      {
        icon: faCertificate,
        href: route('partner.verified.dashboard'),
        isActive: route().current('partner.verified.*'),
        text: 'Verifikasi Kemitraan',
      },
    ]
  }
];
const drawerOpen = ref(false);

const page = usePage();
const allNavs = computed(() => {
  let finalNavs = [
    {
      icon: 'chalkboard',
      href: route('dashboard'),
      isActive: route().current('dashboard'),
      text: 'Dashboard',
      permission: true,
    },
    {
      icon: 'id-card',
      href: route('user.profile'),
      isActive: route().current('user.profile'),
      text: 'Profil Saya',
      permission: true,
    },
  ];

  const mergeNavs = (initialNav, navs) => {
    const returnVal = initialNav;
    navs.forEach((nav) => {
      let thisNavHasBeenAdded = false;
      for (let i = 0; i < nav.menu.length; i++) {
        const curr = nav.menu[i];
        if (!thisNavHasBeenAdded) {
          returnVal.push({
            category: nav.category,
          });
          thisNavHasBeenAdded = true;
        }
        returnVal.push(curr);
      }
    });
    return returnVal;
  }

  switch (page.props.auth.user?.user_type) {
    case 'personal':
      console.log(personalNavs);
      finalNavs = mergeNavs(finalNavs, personalNavs);
      break;
    case 'company':
      finalNavs = mergeNavs(finalNavs, companyNavs);
      break;
    case 'provider':
      finalNavs = mergeNavs(finalNavs, providerNavs);
      break;
  }

  return finalNavs;
  // TODO: Nanti aja si ini
  // return finalNavs.concat([
  //   {
  //     category: 'Akun Saya',
  //   },
  //   {
  //     icon: 'ticket',
  //     href: route('my.log'),
  //     isActive: route().current('my.log'),
  //     text: 'Riwayat Login Saya',
  //     permission: true,
  //   },
  // ]);
});

function onBeforeEnter(el) {
  el.style.opacity = 0;
}

function onEnter(el, done) {
  gsap.to(el, {
    x: 0,
    opacity: 1,
    height: 'auto',
    delay: el.dataset.index * 0.02,
    duration: 0.3,
    startAt: {
      x: -20,
    },
    onComplete: done,
  });
}

const userTypeCode = computed(() => page.props.auth.user.user_type);
const affiliation = computed(() => page.props.auth.user.affiliation_name);
const userType = computed(() => {
  const types = {
    personal: 'Perorangan',
    company: 'Perusahaan',
    provider: 'Mitra',
  };
  return types[page.props.auth.user.user_type] ?? '';
})
</script>

<style scoped></style>
