<template>
  <div class="form-parent">
    <div class="form-group notch">
      <textarea
        :id="id"
        ref="input"
        v-model="value"
        :name="id"
        class="input w-full"
        :class="{ error: hasError, 'opacity-70': readonly, 'has-value': inputLen > 0 }"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :placeholder="placeholder"
        :title="title"
        rows="3"
        @blur="loseFocus"
        @keyup="checkError"
        @change="emit('change')"
      />
      <input-label :class="{ 'control-label': true, 'required-star': required }" :for="id">{{ label }}</input-label>

      <!-- Right side of form -->
      <div v-if="value && value.length > 0" class="right-form">
        <button tabindex="-1" class="input-attr-btn" type="button" @click="value = ''">
          <font-awesome-icon icon="times-circle" size="sm" />
        </button>
      </div>
    </div>
    <!-- Bottom of Form -->
    <div class="flex justify-between gap-1">
      <!-- Left side: Any text -->
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

        <!-- Error Section -->
        <div v-if="everFocused && countErrors > 0" class="bottom-form-items">
          <div class="text-center text-red-600">
            <font-awesome-icon icon="exclamation-triangle" />
          </div>
          <div class="text-red-600">
            <ul :class="`${countErrors > 1 ? 'list-disc pl-4' : 'list-none'}`">
              <template v-if="!hideValidation">
                <li v-if="!validityChecker.req">Bagian ini wajib diisi!</li>
                <li v-if="!validityChecker.min">Minimal {{ minlength }} karakter!</li>
                <li v-if="!validityChecker.regex">Pola input tidak sesuai!</li>
              </template>
            </ul>
            <slot name="errors" />
          </div>
        </div>
      </div>

      <!-- Right side: Char counter -->
      <div class="flex-shrink-0 mr-2">
        <div
          v-if="maxlength && maxlength > 0"
          :class="`input-count ${charsOfLimit ? 'bg-red-500' : 'bg-secondary dark:bg-secondary-dark'}`"
        >
          <span v-if="charsOfLimit"><font-awesome-icon class="mr-1" icon="exclamation-triangle" /></span>
          {{ inputLen }} / {{ maxlength }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InputLabel from '@/components/Forms/Core/InputLabel.vue';

const props = defineProps({
  modelValue: [String, Number],
  /**
   * Label sebagai judul Form
   */
  label: String,
  /**
   * Menonaktifkan form.
   * Default: False.
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Id dari form, ini sekaligus sebagai name dari form.
   */
  id: {
    type: String,
    required: true,
  },
  /**
   * Apakah form harus terisi. Apabila true maka akan ada simbol bintang merah disebelah kanan label.
   * Default: false.
   */
  required: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  /**
   * Pengecekan apakah form terdapat error. Apabila true maka border form akan berwarna merah.
   * Default: false.
   */
  hasError: {
    type: Boolean,
    default: false,
  },
  placeholder: String,
  /**
   * Popup yang muncul di form apabila ada kesalahan regex/required.
   */
  title: String,
  /**
   * Regex pengecekan konten
   */
  pattern: String,
  /**
   * Batas maksimal karakter yang dimasukkan dalam form. Apabila jumlah karakter tepat dengan maxlength maka user
   * tidak bisa mengetik kata baru. Apabila bagian ini ditentukan, maka akan muncul char counter.
   */
  maxlength: [Number, String],
  minlength: [Number, String],
  serverSideError: [String, Object],
  hideValidation: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const inputLen = computed(() => {
  if (!value.value) return 0;
  return value.value.length;
});

const charsOfLimit = computed(() => {
  if (value.value !== null && props.maxlength && props.maxlength > 0) {
    return props.maxlength - value.value.length <= 0;
  }
  return false;
});

// Focus on mount
const input = ref(null);
onMounted(() => {
  if (input.value.hasAttribute('autofocus')) {
    input.value.focus();
  }
});

const isValid = ref(false);
const everFocused = ref(false);

const validityChecker = computed(() => {
  const returnVal = {
    req: true,
    min: true,
    regex: true,
  };
  const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  if (!props.hideValidation) {
    if (props.required && !value.value) returnVal.req = false;
    if (value.value) {
      if (props.minlength > 0 && value.value.length < props.minlength) returnVal.min = false;
      if (props.type === 'email' && !value.value.match(emailRegex)) returnVal.email = false;
      if (props.regex && !value.value.match(props.pattern)) returnVal.regex = false;
    }
  }
  return returnVal;
});

const countErrors = ref(0);

const checkError = () => {
  countErrors.value = 0;
  const keys = Object.keys(validityChecker.value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!validityChecker.value[key]) {
      countErrors.value++;
    }
  }
};

const loseFocus = () => {
  everFocused.value = true;
  isValid.value = input.value.validity.valid;
};
</script>

<style scoped></style>
