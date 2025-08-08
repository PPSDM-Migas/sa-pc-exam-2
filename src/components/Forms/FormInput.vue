<template>
  <div
    :class="`form-parent ${m0 ? 'ov-parent' : ''} ${everFocused && !isValid ? 'err' : ''} ${
      disabled || readonly ? 'form-disabled' : ''
    }`"
  >
    <div class="form-group">
      <div
        v-if="isCurrency() || !!prefix"
        class="prefix pl-3 py-2 bg-light-alt dark:bg-dark-alt rounded-tl-md rounded-bl-2xl"
      >
        <p v-if="isCurrency()">Rp</p>
        <p v-else>{{ prefix }}</p>
      </div>
      <input
        :id="id"
        ref="input"
        v-model="value"
        :name="id"
        class="input w-full"
        :class="{
          error: hasError || errors.length > 0,
          'opacity-70': readonly,
          'has-value': hasValue,
          'text-right': isCurrency(),
          'has-prefix': prefix,
        }"
        :type="extendType"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        :title="title"
        :pattern="pattern"
        :minlength="minlength"
        :maxlength="maxlength"
        :max="maxVal"
        :min="minVal"
        :step="step"
        :autocomplete="autocomplete"
        @blur="loseFocus"
        @change="emit('change')"
        @input="handleCursor"
      />
      <input-label :class="{ 'control-label': true, 'required-star': required }" :for="id">{{ label }}</input-label>

      <!-- Right side buttons -->
      <div v-if="((value && value.length > 0) || type === 'password') && !disabled && !readonly" class="right-form">
        <!-- Show Password button -->
        <button v-if="type === 'password'" tabindex="-1" class="input-attr-btn" type="button" @click="togglePassword">
          <font-awesome-icon :icon="showPassword ? 'eye' : 'eye-slash'" size="sm" />
        </button>

        <!-- Clear Text -->
        <button
          v-if="value !== undefined && value !== null && value.length > 0"
          tabindex="-1"
          class="input-attr-btn"
          type="button"
          @click="value = isCurrency() ? '0' : ''"
        >
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
                <li v-if="!validityChecker.email">Input anda bukan merupakan email!</li>
                <li v-if="!validityChecker.regex">Pola input tidak sesuai!</li>
                <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
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
import { computed, nextTick, onMounted, ref } from 'vue';
import InputLabel from '@/components/Forms/Core/InputLabel.vue';

const props = defineProps({
  autocomplete: String,
  prefix: String,
  // modelValue: [String, Number],
  /**
   * Setting apakah perlu margin
   */
  m0: {
    type: Boolean,
    default: false,
  },
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
  /**
   * Tipe dari form.
   * Disarankan hanya digunakan untuk: text, number, email, password.
   * Default: text.
   */
  type: {
    type: String,
    default: 'text',
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
  maxVal: [Number, String],
  minVal: [Number, String],
  step: [Number, String],
  serverSideError: [String, Object],
  hideValidation: [Boolean],
  errors: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(['change']);
const isCurrency = () => props.type === 'currency';
const rawCurrency = ref(0);
const isValid = ref(false);
const everFocused = ref(false);

/**
 * Format angka menjadi currency dengan pemisah ribuan titik dan desimal koma.
 * @param val
 * @returns {string}
 */
const formatNumToCurrency = (val) => {
  const setup = {
    style: 'decimal',
    maximumFractionDigits: 2,
    grouping: true,
  };
  return new Intl.NumberFormat('id-ID', setup).format(val);
};

/**
 * Merubah angka (String) menjadi angka float
 * @param val
 * @returns {number}
 */
const formatCurrencyToNum = (val) => {
  const innerVal = val ?? '0';
  const c1 = innerVal.replaceAll('.', '');
  const c2 = c1.replaceAll(',', '.');
  return parseFloat(c2);
};

const value = defineModel({
  default: '',
  get: (e) => {
    if (isCurrency()) {
      const val = e ? `${e}` : '0';
      rawCurrency.value = parseFloat(val ? val.replaceAll(/[^0-9.,]+/g, '') : 0);
      return !everFocused.value && val === '0' ? '' : formatNumToCurrency(rawCurrency.value);
    }
    return e;
  },
  set: (e) => (isCurrency() ? formatCurrencyToNum(e ?? '0') : e),
});

const handleCursor = (e) => {
  if (isCurrency()) {
    const inpEl = e.target;
    const curPos = inpEl.selectionStart;
    const prevValue = e.target.value;
    const newValue = value.value;

    const prevDots = formatNumToCurrency(formatCurrencyToNum(prevValue)).split('.').length - 1;
    const newDots = formatNumToCurrency(formatCurrencyToNum(newValue)).split('.').length - 1;

    const charLength = newValue.length - prevValue.length;
    let newCursorPos = curPos + charLength + 1;
    if (prevDots !== newDots && charLength === -1) {
      // TODO: Ini belum handle kasus delete di tengah :(
      newCursorPos += prevDots + prevDots > 1 ? 1 : 0;
    }

    nextTick(() => {
      inpEl.setSelectionRange(newCursorPos, newCursorPos);
    });
  }
};

// Toogle if form is password
const showPassword = ref(false);
function togglePassword() {
  showPassword.value = !showPassword.value;
}

const inputLen = computed(() => {
  if (!value.value) return 0;
  return value.value.length;
});

const charsOfLimit = computed(
  () =>
    // if (props.maxlength && props.maxlength > 0) return props.maxlength - value.value.length <= 0;
    false,
);
const extendType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password';
  if (props.type === 'currency') return 'text';
  return props.type;
});

// Focus on mount
const input = ref(null);
const triggerFocus = () => {
  input.value?.focus();
};
onMounted(() => {
  if (input.value.hasAttribute('autofocus')) {
    triggerFocus();
  }
});

const validityChecker = computed(() => {
  const returnVal = {
    req: true,
    min: true,
    email: true,
    regex: true,
  };
  const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  if (!props.hideValidation) {
    if (props.required && !value.value && parseInt(value.value, 10) !== 0) returnVal.req = false;
    if (value.value) {
      if (props.minlength > 0 && value.value.length < props.minlength) returnVal.min = false;
      if (props.type === 'email' && !value.value.match(emailRegex)) returnVal.email = false;
      if (props.regex && !value.value.match(props.pattern)) returnVal.regex = false;
    }
  }
  return returnVal;
});

const countErrors = computed(() => {
  let errors = props.errors.length;
  const keys = Object.keys(validityChecker.value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!validityChecker.value[key]) {
      errors++;
    }
  }

  return errors;
});

const hasValue = computed(() => {
  if (isCurrency()) return rawCurrency.value !== 0;
  const val = value.value;
  return val !== null && val !== undefined && val !== '';
});

const loseFocus = () => {
  everFocused.value = true;
  isValid.value = input.value.validity.valid;
};

defineExpose({
  input,
  triggerFocus,
});
</script>

<style scoped></style>
