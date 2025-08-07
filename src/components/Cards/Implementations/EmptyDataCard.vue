<script setup>
import NotificationCard from '@/components/Cards/NotificationCard.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import BasicCard from "@/components/Cards/BasicCard.vue";

defineProps({
  loadFunction: {
    type: [Function, undefined],
    default: undefined,
  },
  theItem: {
    type: String,
    default: 'data',
  },
  color: {
    type: String,
    default: 'normal',
  },
  noInfo: Boolean,
  notYet: Boolean,
});
</script>

<template>
  <NotificationCard v-if="!noInfo" border-color="red" :color="color">
    <div class="text-center my-4 flex flex-col gap-2 items-center">
      <font-awesome-icon icon="ghost" size="2x" class="truck text-subtitle" />
      <p class="text-xs italic text-subtitle">Maaf {{ notYet ? 'belum' : 'tidak' }} ada {{ theItem }} ._.</p>
      <div v-if="loadFunction" class="btn-group">
        <BasicButton icon="arrows-rotate" @click="loadFunction">Coba Lagi</BasicButton>

        <slot name="btn" />
      </div>
    </div>
  </NotificationCard>
  <BasicCard v-else>
    <div class="text-center my-4 flex flex-col gap-2 items-center">
      <font-awesome-icon icon="ghost" size="2x" class="truck text-subtitle" />
      <p class="text-xs italic text-subtitle">Maaf {{ notYet ? 'belum' : 'tidak' }} ada {{ theItem }} ._.</p>
      <div v-if="loadFunction" class="btn-group">
        <BasicButton icon="arrows-rotate" @click="loadFunction">Coba Lagi</BasicButton>

        <slot name="btn" />
      </div>
    </div>
  </BasicCard>
</template>

<style scoped></style>
