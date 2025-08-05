<template>
  <div
    ref="selectRoot"
    :class="{
      'form-parent': true,
      'select-component': true,
      err: everFocused && countErrors,
      'form-disabled': readonly || disabled,
      'has-value': selectedObjects,
    }"
    @blur="loseFocus"
    @mouseenter="keepContainer = true"
    @mouseleave="keepContainer = false"
  >
    <!-- Seen part of form even when not focused -->
    <div :class="`form-group select-component ${dropdownOpen ? 'opened' : ''}`">
      <!-- Input for search purpose -->
      <input
        ref="selectInput"
        v-model="inputValue"
        class="input w-full"
        :readonly="readonly"
        :placeholder="
          props.multiselect
            ? `${selectedObjects.length} terpilih`
            : selectedObjects
            ? pickValue(selectedObjects, 'label')
            : placeholder
        "
        :class="{ error: hasError, 'opacity-70': readonly, 'has-value': inputValue && inputValue.length > 0 }"
        :disabled="disabled"
        @focus="triggerFocus"
        @keydown="handleKeypress"
      />
      <input-label :class="{ 'control-label': true, 'required-star': required }" :for="id">{{ label }}</input-label>

      <!-- Right side form for buttons -->
      <div class="right-form">
        <!-- Clear selection button -->
        <button
          v-if="selectedObjects && !readonly && !disabled"
          tabindex="-1"
          class="input-attr-btn"
          type="button"
          @click.stop="doEmit(null)"
        >
          <font-awesome-icon icon="times-circle" size="sm" />
        </button>
        <button v-if="loading" tabindex="-1" class="input-attr-btn bg-secondary text-white">
          <font-awesome-icon class="text-white" icon="cog" spin size="sm" />
        </button>
        <!-- Just an indicator of it's a select container -->
        <button v-else tabindex="-1" class="input-attr-btn" type="button" @click="triggerFocus">
          <font-awesome-icon icon="angle-down" size="sm" />
        </button>
      </div>
    </div>

    <!-- The floating options container -->
    <div class="relative w-full">
      <Transition name="slide-fade" mode="out-in">
        <!-- The options container -->
        <div v-if="dropdownOpen" class="options-absolute w-full">
          <div v-if="multiselect" class="option-header">
            <p class="text-xs text-white">
              <font-awesome-icon icon="circle-check" size="lg" class="mr-2" />
              {{ selectedObjects.length }} terpilih
            </p>
          </div>

          <div class="options-container">
            <!-- Error notifier -->
            <div v-if="isSearchError" class="text-center my-4 cursor-pointer" @click="asyncSearch('error')">
              <font-awesome-icon icon="exclamation-triangle" size="xl" class="text-red-500" />
              <p class="text-sm font-extrabold text-red-500 mt-1">Terjadi Kesalahan :(</p>
              <p class="text-xs italic text-subtitle">Klik disini atau rubah tulisan untuk mencoba lagi.</p>
            </div>

            <!-- If options is empty -->
            <div v-else-if="localOptions?.length <= 0" class="text-center my-4">
              <font-awesome-icon icon="ghost" size="2x" class="truck text-subtitle" />
              <p class="text-xs italic text-subtitle">
                Maaf tidak ada data {{ inputValue.length > 0 ? 'yang anda cari ' : '' }}._.
              </p>
            </div>

            <!-- The options displayed -->
            <ul
              v-for="(opt, key) in localOptions"
              v-else
              :key="key"
              ref="optionData"
              :class="{
                'list-none': true,
                option: true,
                highlight: key === highlightIndex,
                selected: checkOptIsSelected(opt),
              }"
              @mouseover="highlightIndex = key"
              @click="doEmit(opt, true)"
            >
              <li class="flex gap-1 items-center">
                <div v-if="slots.customList" class="w-full py-1.5 px-3">
                  <slot name="customList" :data="opt" />
                </div>
                <div v-else class="w-full py-1.5 px-3">
                  <p :class="{ 'mb-1 font-bold': optionDesc }">{{ pickValue(opt, 'label') }}</p>
                  <p v-if="optionDesc" class="text-sm text-subtitle">{{ pickValue(opt, 'desc') }}</p>
                </div>

                <!-- Indicator if option is selected -->
                <div v-if="checkOptIsSelected(opt)" class="select-indicator">
                  <p><font-awesome-icon icon="circle-check" /> Terpilih</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Loading indicator -->
          <div v-if="loading" class="option-loading">
            <p class="text-xs italic text-white">
              <font-awesome-icon icon="cog" size="lg" class="mr-2" spin />Mencari...
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bottom of the form -->
    <div class="flex justify-between gap-1">
      <!-- Left side: Any text -->
      <div class="text-xs italic mt-1">
        <!-- Description Section -->
        <div v-if="multiselect" class="bottom-form-items">
          <div class="text-center text-subtitle">
            <font-awesome-icon :icon="faCheckDouble" />
          </div>
          <div class="text-subtitle">Anda bisa memilih lebih dari 1 item</div>
        </div>
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
              </template>
            </ul>
            <slot name="errors" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import InputLabel from '@/Components/Forms/Core/InputLabel.vue';
import { computed, isReactive, onMounted, onUnmounted, ref, toRaw, useSlots, watch } from 'vue';
import { mixins } from '@/Mixins/mixinDeprecate';
import {pnrRequest, srfRequest} from '@/Mixins/Class/Request';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  /**
   * Yang dikirim ke parent bukan sesuai objectKey, melainkan object/stringnya.
   */
  rawEmit: Boolean,
  asyncUrl: [String, Array],
  asyncDestructure: {
    type: Function,
    default: (e) => e,
  },
  asyncParamKey: {
    type: String,
    default: 'q',
  },
  asyncOtherParam: {
    type: Object,
    default: () => ({}),
  },
  keySelectFunction: Function,
  notClearable: Boolean,
  multiselect: Boolean,
  groupValues: String,
  groupLabel: String,
  optionKey: String,
  optionLabel: String,
  optionDesc: String,
  /**
   * Custom tulisan yang muncul di select form. Arrow function menerima 2 variable.
   */
  customLabel: Function,
  disableSearch: Boolean,
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: [Number, String, Array, Object],
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
  placeholder: {
    type: String,
    default: 'Ketik untuk mencari',
  },
  /**
   * Popup yang muncul di form apabila ada kesalahan regex/required.
   */
  title: String,
  /**
   * Regex pengecekan konten
   */
  pattern: String,
  step: [Number, String],
  serverSideError: [String, Object],
  hideValidation: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);
const slots = useSlots();

// ==> Reactive Variables Collection <==
/**
 * Data REAL yang ditampilkan di options container.
 * Apabila select bersifat async, maka pada awalnya merupakan array kosong, ketika search var ini akan dependent
 * terhadap data dari async URL.
 * Apabila select bersifat sync, maka pada awalnya merupakan klon dari options, ketika search maka option akan terfilter
 * @type {Ref<(string | object)[]>}
 */
const localOptions = ref(
  !props.asyncUrl ? structuredClone(isReactive(props.options) ? toRaw(props.options) : props.options) : [],
);

/**
 * Indikator Loading
 * @type {Ref<UnwrapRef<boolean>>}
 */
const loading = ref(false);

/**
 * Nomor dari index pada localOptions yang sedang menjadi calon dipilih karena keyboard interaction atau mouse hover.
 * @type {Ref<UnwrapRef<number>>}
 */
const highlightIndex = ref(-1);

/**
 * Variabel penampung handler untuk timeout penunda async request untuk search ketika user masih mengetik.
 * @type {NodeJS.Timeout}
 */
let isSearching;

/**
 * Variabel yang mencegah container dari options tertutup ketika mouse/keyboard berintertaksi dimanapun pada bagian
 * select
 * @type {Ref<boolean>}
 */
const keepContainer = ref(false);

/**
 * Indikator bahwa dropdown harus terbuka atau tertutup.
 * @type {Ref<boolean>}
 */
const dropdownOpen = ref(false);

/**
 * Value dari input yang digunakan sebagai search/filter dari options.
 * @type {Ref<string>}
 */
const inputValue = ref('');

/**
 * Object dari options yang dipilih pengguna dan dikirim ke Parent Component
 * @type {null | object}
 */
const selectedObjects = ref(props.multiselect ? [] : null);

const everFocused = ref(false);

const currentlyFocused = ref(false);

const countErrors = ref(0);

const isSearchError = ref(false);

// End of Reactive Variable Collections <==

// ==> HTML Ref Variable Collections <==
/**
 * Referensi dari DOM input yang digunakan untuk keperluan search
 * @type {Ref<any>}
 */
const selectInput = ref();

/**
 * Referensi dari DOM <li> yang menjadi item dari select
 * @type {Ref<any>}
 */
const optionData = ref();

/**
 * Referensi dari DOM yang merupakan root dari component ini.
 * @type {Ref<any>}
 */
const selectRoot = ref();

const isUserInput = ref(false);

// End of HTML Ref Variable Collection

// ===== Computed Variables Collection
const validityChecker = computed(() => {
  const returnVal = {
    req: true,
  };

  if (!props.hideValidation) {
    if (props.required && !selectedObjects.value) returnVal.req = false;
  }
  return returnVal;
});

// ===== Function Collections =====
/**
 * Memulai pengecekan terhadap hasil input, apakah form memiliki error sesuai validasi yang diberikan.
 */
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

/**
 * Mengecek apakah param yang diberikan merupakan options yang sedang dipilih
 *
 * @param opt Opsi yang akan dicek
 * @returns {boolean}
 */
const checkOptIsSelected = (opt) => {
  if (props.multiselect) {
    return selectedObjects.value.some((item) => _.isEqual(item, opt));
  }
  return _.isEqual(opt, selectedObjects.value);
};

/**
 * Mendapatkan nilai dari object option yang diberikan sesuai dengan props optionKey atau optionLabel.
 *
 * @param el Opsi yang akan diambil nilainnya
 * @param purpose Penggunaan dynamic key untuk form select. Pilih untuk key (value), val (Label), desc.
 * @returns {*}
 */
const pickValue = (el, purpose = 'val') => {
  const returnLabel = {
    val: props.optionKey,
    label: props.optionLabel,
    desc: props.optionDesc,
  };
  if (el && mixins.checkVarType(el) === 'object') return el[returnLabel[purpose]];
  return el;
};

/**
 * Yang dilakukan ketika input kehilangan focus.
 *
 * @param withoutCheck True apabila ketika lose focus langsung jalankan validasi pengecekan error.
 */
const loseFocus = (withoutCheck = false) => {
  currentlyFocused.value = false;
  if (!keepContainer.value) dropdownOpen.value = false;
  everFocused.value = true;
  if (withoutCheck) checkError();

  // If multiSelect is true, format the inputValue with selected labels and count
  if (props.multiselect) {
    // Get all the labels from selected objects
    const selectedLabels = selectedObjects.value.map((x) => pickValue(x, 'label'));
    const selectedCount = selectedLabels.length; // Number of selected items
    // Format as "n selected: item A, item B, ..."
    inputValue.value = `(${selectedCount} terpilih) ${selectedLabels.join(', ')}`;
  } else {
    // Single selection behavior (same as original code)
    inputValue.value = selectedObjects.value ? pickValue(selectedObjects.value, 'label') : '';
  }
};

const findInOptions = () => {
  if (props.multiselect) {
    // MULTI-SELECT mode
    const selected = [];
    const labels = [];

    // modelValue is expected to be an array in multi-select
    const values = Array.isArray(props.modelValue) ? props.modelValue : [];

    values.forEach((val) => {
      const match = localOptions.value.find((x) => pickValue(x) == val);
      if (match) {
        selected.push(match);
        labels.push(pickValue(match, 'label'));
      } else {
        // fallback if no match in options (could be async not loaded yet)
        labels.push(val);
      }
    });

    selectedObjects.value = selected;
    if (currentlyFocused.value) inputValue.value = '';
  } else {
    // SINGLE-SELECT mode (original behavior)
    let flag = false;
    localOptions.value.forEach((x) => {
      if (!flag && pickValue(x) == props.modelValue) {
        selectedObjects.value = x;
        inputValue.value = x ? pickValue(x, 'label') : '';
        flag = true;
      }
    });
    if (!flag) inputValue.value = props.modelValue;
  }
};

/**
 * Mengisi list options, sekaligus melakukan filter terhadap options sesuai input field
 * Apabila async, maka fungsi ini akan melakukan request ke API server sesuai user input. Keseluruhan hasil bergantung
 * pada backend, component tidak melakukan filtering lagi.
 * Apabila sync, maka fungsi ini akan melakukan filtering wildcard sesuai user input.
 *
 * @param search user input sebagai patokan filter
 */
const asyncSearch = (loc = '', search = '', initialFind = false) => {
  console.log(`Triggered from ${loc}`);
  if (props.asyncUrl) {
    const params = structuredClone(props.asyncOtherParam);
    params[props.asyncParamKey] = search;
    clearTimeout(isSearching);
    isSearching = setTimeout(() => {
      loading.value = true;

      const defaultThen = (res) => {
        isSearchError.value = false;
        localOptions.value = props.asyncDestructure(res.data.content);
        if (initialFind) findInOptions();
      };
      const defaultCatch = () => {
        isSearchError.value = true;
      };
      const defaultFinal = () => {
        loading.value = false;
      };

      if (mixins.checkVarType(props.asyncUrl) === 'array') {
        switch (props.asyncUrl[0]) {
          case 'pnr':
            pnrRequest
              .setBody(props.asyncUrl[2] ?? {})
              .setUrlParams({...props.asyncUrl[2], ...params} ?? {})
              .setHeaders(props.asyncUrl[3] ?? {})
              .get(props.asyncUrl[1], props.asyncUrl[2] ?? {})
              .then(defaultThen)
              .catch(defaultCatch)
              .finally(defaultFinal);
            break;
          case 'srf':
          default:
            srfRequest
              .setBody(props.asyncUrl[2] ?? {})
              .setUrlParams({...props.asyncUrl[2], ...params} ?? {})
              .setHeaders(props.asyncUrl[3] ?? {})
              .get(props.asyncUrl[1], props.asyncUrl[2] ?? {})
              .then(defaultThen)
              .catch(defaultCatch)
              .finally(defaultFinal);
            break;
        }
      } else axios.get(props.asyncUrl, { params }).then(defaultThen).catch(defaultCatch).finally(defaultFinal);
    }, 500);
  } else if (!search) {
    const opt = props.options;
    localOptions.value = structuredClone(isReactive(opt) ? toRaw(opt) : opt);
  } else {
    localOptions.value = localOptions.value.filter((a) => {
      const check = a && mixins.checkVarType(a, 'object');
      const searchVal = search.toLowerCase();
      return check ? a[props.optionLabel].toLowerCase().includes(searchVal) : a.toLowerCase().includes(searchVal);
    });
  }
};

/**
 * Mengirim hasil opsi yang dipilih ke parent component. Hasil yang dikirim hanya key saja, tanpa keseluruhan object.
 *
 * @param e Object yang akan dikirim
 * @param emptyInput Mengatur field input menjadi kosong terlebih dahulu
 */
const doEmit = (e, emptyInput = false) => {
  if (emptyInput) inputValue.value = '';

  // --- Multi-Select Mode ---
  if (props.multiselect) {
    let current = [...selectedObjects.value]; // Copy current selection
    const value = pickValue(e); // The key of the new selection

    if (e === null) {
      // If `e` is null, clear all selected items
      current = [];
    } else {
      const index = current.findIndex((item) => pickValue(item) === value);

      if (index !== -1) {
        // If item is already selected, deselect it
        current.splice(index, 1);
      } else if (e) {
        // If not selected, add to selection
        current.push(e);
      }
    }

    selectedObjects.value = current;

    inputValue.value = ''; // Always clear input for multi-select

    emit('update:modelValue', props.rawEmit ? current : current.map((item) => pickValue(item)));
    emit('change', current);

    // --- Single-Select Mode ---
  } else {
    let emitValue = null;

    if (e) {
      emitValue = pickValue(e);
      selectedObjects.value = e;
      inputValue.value = pickValue(e, 'label');
    } else {
      selectedObjects.value = null;
      inputValue.value = '';
    }

    emit('update:modelValue', props.rawEmit ? selectedObjects.value : emitValue);
    emit('change', e);
    selectInput.value.blur();
    keepContainer.value = false;
    dropdownOpen.value = false;
  }
  checkError();
};

/**
 * Handler dari beberapa event keyboard ketika pointer berada dalam field input.
 *
 * @param ev DOM Event
 */
const handleKeypress = (ev) => {
  if (ev.key === 'ArrowDown') {
    // Scroll highlight options kebawah
    ev.preventDefault();
    highlightIndex.value = Math.min(highlightIndex.value + 1, localOptions.value.length - 1);
    optionData.value?.[highlightIndex.value].scrollIntoView({ block: 'nearest' });
  }
  if (ev.key === 'ArrowUp') {
    // Scroll highlight options keatas
    ev.preventDefault();
    highlightIndex.value = Math.max(highlightIndex.value - 1, 0);
    optionData.value?.[highlightIndex.value].scrollIntoView({ block: 'nearest' });
  }
  if (ev.key === 'Enter') {
    // Memilih options yang sedang dihighlight
    ev.preventDefault();
    doEmit(localOptions.value?.[highlightIndex.value]);
  }
  if (ev.key === 'Tab') loseFocus(); // Berpindah ke form field selanjutnya sekaligus menjalankan loseFocus()
  if (ev.key === 'Escape' || ev.key === 'Esc') {
    // Menutup field dropdown tanpa harus menutup event lain.
    ev.preventDefault();
    ev.stopPropagation();
    dropdownOpen.value = false;
    keepContainer.value = false;
  }
};

/**
 * Mendeteksi ketika ada event klik terjadi, jika diluar component maka hilangkan focus dari component.
 *
 * @param ev DOM Event
 */
const detectClick = (ev) => {
  if (!selectRoot.value.contains(ev.target)) loseFocus(true);
};

/**
 * Ketika input sedang mendapatkan focus
 */
const triggerFocus = () => {
  selectInput.value.focus();
  currentlyFocused.value = true;
  if (!props.readonly) {
    dropdownOpen.value = true;
    inputValue.value = '';
  }
  if (props.asyncUrl) {
    isUserInput.value = false;
    // Membuat konfigurasi async request dalam mempopulasikan options
    asyncSearch('triggerFocus', props.modelValue, true);
  }
  document.addEventListener('click', detectClick);
};

const processModelValue = (onMountedLoad = false) => {
  if (!props.modelValue) {
    selectedObjects.value = props.multiselect ? [] : null;
    inputValue.value = '';
  }
  if (props.asyncUrl) {
    // Membuat konfigurasi async request dalam mempopulasikan options
    isUserInput.value = false;
    if (!onMountedLoad) asyncSearch('processModelValue', props.modelValue, true);
  } else {
    // Mengambil nilai dari options yang sudah dipilih sebelumnya
    findInOptions();
  }
};

// End of Functions Collection

// ===== Watchers Collection
let searchTimeout;
/**
 * Ketika user mengetik/merubah input value
 */
watch(
  inputValue,
  (newVal) => {
    if (!isUserInput.value) return;

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        loading.value = true;
        await asyncSearch('watchInputValue', newVal);
      } finally {
        loading.value = false;
      }
    }, 500);
  },
  { flush: 'post' },
);

watch(
  () => props.modelValue,
  () => {
    processModelValue();
  },
);

// ===== Component's Cycles Events

onMounted(() => {
  processModelValue();
  selectInput.value.addEventListener('input', () => {
    isUserInput.value = true;
  });
});

onUnmounted(() => {
  document.removeEventListener('click', detectClick);
});
</script>

<style></style>
