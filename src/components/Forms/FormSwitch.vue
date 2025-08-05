<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <SwitchGroup as="div" class="stretch-flex gap-2 my-4">
    <div>
      <SwitchLabel class="font-extrabold tex-sm mb-1">
        <template v-if="$slots.label">
          <slot name="label" />
        </template>
        <p class="text-primary dark:text-primary-dark">{{ label }}</p>
      </SwitchLabel>
      <SwitchDescription v-if="$slots.description || description" class="text-xs">
        <template v-if="$slots.description">
          <slot name="description" />
        </template>
        <template v-else>{{ description }}</template>
      </SwitchDescription>
    </div>
    <Switch v-model="value" as="div" :class="modelValue ? 'active' : ''" class="switch-container">
      <span class="sr-only">Use QR</span>
      <span aria-hidden="true" :class="modelValue ? 'active' : ''" class="switch-button" />
    </Switch>
  </SwitchGroup>
</template>

<script setup>
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  label: String,
  description: String,
});
const emit = defineEmits(['update:modelValue', 'change']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    emit('change');
  },
});
</script>

<style scoped></style>
