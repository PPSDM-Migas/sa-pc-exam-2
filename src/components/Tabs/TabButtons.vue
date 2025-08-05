<template>
  <TabList :class="['tab-list', alt ? 'alt' : '']">
    <!-- Pertanyaan IKM -->
    <Tab
      v-for="(tab, i) in tabList"
      v-slot="{ selected }"
      :key="i"
      as="template"
      :disabled="disableCheck(tab.disabled)"
      @click="emit('clickItem', tab)"
    >
      <div
        :class="[
          'tab-button',
          selected ? 'active' : 'nonactive',
          alt ? 'alt' : '',
          disableCheck(tab.disabled) ? 'tab-disabled' : '',
        ]"
      >
        <font-awesome-icon v-if="tab.icon" :icon="tab.icon" size="lg" />
        <div>{{ tab.name ?? tab }}</div>
      </div>
    </Tab>
  </TabList>
</template>

<script setup>
import { Tab, TabList } from '@headlessui/vue';

defineProps({
  tabList: {
    type: Array,
    required: true,
  },
  alt: Boolean,
});

const emit = defineEmits(['clickItem']);

const disableCheck = (check) => {
  if (check === undefined || check === null) return false;
  return check === true;
};
</script>

<style scoped></style>
