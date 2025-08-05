<script setup>
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// Define props and emits
const props = defineProps({
  modelValue: String, // Assuming the content is a string
  contentType: {
    type: String,
    default: 'html',
  },
  label: String,
  errors: {
    type: Array,
    default: () => [],
  },
  hideValidation: Boolean,
});

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['link', 'image', 'video'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const emit = defineEmits(['update:modelValue']);

// Reactive property for editor content
const editorContent = ref(props.modelValue);

// Watch for changes in editor content and emit updates
watch(editorContent, (newContent) => {
  emit('update:modelValue', newContent);
});

// Method to handle content updates
const updateContent = (newContent) => {
  editorContent.value = newContent;
};
</script>

<template>
  <div>
    <div class="flex px-1.5">
      <p
        class="text-sm text-primary dark:text-primary-dark rounded-t-lg px-2 py-0.5 border border-b-0 border-secondary"
      >
        {{ label }}
      </p>
    </div>
    <div class="rounded-md rounded-bl-2xl border-2 border-secondary dark:border-secondary-dark">
      <QuillEditor
        v-model:content="editorContent"
        :content-type="contentType"
        :toolbar="toolbarOptions"
        @update:content="updateContent"
      />
    </div>

    <!-- Bottom of Form -->
    <div class="text-xs italic mt-1">
      <!-- Description Section -->
      <div v-if="$slots.description" class="bottom-form-items">
        <div class="text-center text-subtitle">
          <font-awesome-icon icon="info-circle" />
        </div>
        <div class="text-subtitle">
          <slot name="description" />
        </div>
      </div>

      <div v-if="$slots.errors || errors.length > 0" class="bottom-form-items">
        <div class="text-center text-red-600">
          <font-awesome-icon icon="exclamation-triangle" />
        </div>
        <div class="text-red-600">
          <ul :class="`${errors.length > 1 ? 'list-disc pl-4' : 'list-none'}`">
            <template v-if="!hideValidation">
              <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
            </template>
          </ul>
          <slot name="errors" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ql-toolbar.ql-snow) {
  border: 0;
  @apply bg-secondary-dark-alt;
}

:deep(.ql-container.ql-snow) {
  border: 0;
}
</style>
