<script setup>
import { RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const selected = defineModel();

const emits = defineEmits(['select'])

defineProps({
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: 'Form',
  },
  labelKey: {
    type: String,
    default: 'name',
  }
})
</script>

<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">{{ label }}</RadioGroupLabel>
    <div class="space-y-2">
      <RadioGroupOption
        as="template"
        v-for="(item, index) in items"
        :key="index"
        :value="item"
        v-slot="{ active, checked }"
        @click="emits('select', item)"
      >
        <div
          :class="[
                active
                  ? 'ring-4 ring-primary'
                  : '',
                checked ? 'bg-secondary text-white' : 'text-ld bg-white dark:bg-gray-700',
              ]"
          class="relative flex cursor-pointer rounded-lg px-3 py-2 shadow-md focus:outline-none"
        >
          <div class="flex w-full items-center justify-between">
            <div class="flex items-center">
              <div class="text-sm">
                <RadioGroupLabel class="font-extrabold text-lg" :class="checked ? 'text-primary' : 'text-ld'">
                  {{ item[labelKey] }}
                </RadioGroupLabel>
                <RadioGroupDescription>
                  <slot :item="item" :index="index" :checked="checked"></slot>
                </RadioGroupDescription>
              </div>
            </div>
            <div v-show="checked" class="shrink-0 text-white">
              <FontAwesomeIcon :icon="faCircleCheck" size="lg" />
            </div>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<style scoped>

</style>
