<script setup>
import { computed } from 'vue';

const emit = defineEmits(['update:checked', 'change']);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  checked: {
    type: [Array, Boolean],
    default: false,
  },
  value: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
});

const proxyChecked = computed({
  get() {
    return props.checked;
  },

  set(val) {
    emit('update:checked', val);
  },
});
</script>

<template>
  <div class="mt-4">
    <label class="flex items-center" :for="id">
      <input
        :id="id"
        v-model="proxyChecked"
        type="checkbox"
        :value="value"
        class="form-checkbox"
        @change="emit('change')"
      />
      <span class="ml-2 form-label">{{ label }}</span>
    </label>
  </div>
</template>
