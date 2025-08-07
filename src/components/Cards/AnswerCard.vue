<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BasicCard from '@/components/Cards/BasicCard.vue';

const props = defineProps({
  selected: Boolean,
  notes: Object,
  option: Object,
  optionIndex: Number,
  alphabet: String,
});

const emit = defineEmits(['clickNote', 'pickAnswer']);

const notesColor = computed(() => {
  const haveNote = 'bg-ternary hover:bg-ternary-alt rounded-tr-xl';
  const noNote = 'bg-gray-800 hover:bg-gray-700/70 rounded-r-xl';
  return props.notes ? haveNote : noNote;
});

const clickPick = () => {
  if (!props.selected) emit('pickAnswer', props.optionIndex);
};
</script>

<template>
  <div class="flex gap-2">
    <div class="flex items-center justify-center text-white rounded-l-xl w-12" @click="clickPick">
      <div
        class="flex items-center justify-center rounded-full w-8 h-8 cursor-pointer"
        :class="selected ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-800'"
      >
        <font-awesome-icon v-if="selected" icon="check"></font-awesome-icon>
        <font-awesome-icon v-else-if="!selected && !alphabet" icon="question"></font-awesome-icon>
        <p v-else class="text-ld">{{ alphabet }}</p>
      </div>
    </div>

    <BasicCard no-padding :color="selected ? 'green' : 'sub'" class="w-full">
      <div class="grid gap-2 grid-cols-[auto_3rem]">
        <div class="px-4 py-2 cursor-pointer" @click="clickPick">
          <slot />
        </div>

        <div
          class="flex items-center justify-center text-white"
          :class="notesColor"
          @click="emit('clickNote', notes)"
        >
          <font-awesome-icon :icon="notes ? 'comment-dots' : 'comment'"></font-awesome-icon>
        </div>
      </div>

      <div v-if="notes" class="bg-ternary text-white px-4 py-1 rounded-b-xl italic">
        <p class="text-xs">{{ notes.notes }}</p>
      </div>
    </BasicCard>
  </div>
</template>

<style scoped>

</style>
