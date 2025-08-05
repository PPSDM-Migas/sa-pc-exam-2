<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip/index.js';

defineProps({
  icon: String,
  href: String,
  active: Boolean,
  asBtn: Boolean,
});

const page = usePage();

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

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div v-if="asBtn" class="navbar-btn profile">
          <div class="text-right">
            <p class="text-sm">{{ page.props.auth.user.name }}</p>
            <p class="font-extrabold italic text-xs">
              {{ userType }}<span v-if="userTypeCode !== 'personal' && affiliation"> - {{ affiliation }}</span>
            </p>
          </div>
          <img :src="page.props.auth.user.profile_photo_url" />
        </div>
        <Link v-else :href="route('dashboard')" class="navbar-btn profile">
          <div class="text-right">
            <p class="text-sm">{{ page.props.auth.user.name }}</p>
            <p class="font-extrabold italic text-xs">
              {{ userType }}<span v-if="userTypeCode !== 'personal' && affiliation"> - {{ affiliation }}</span>
            </p>
          </div>
          <img :src="page.props.auth.user.profile_photo_url" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <div class="text-xs">
          <slot />
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
