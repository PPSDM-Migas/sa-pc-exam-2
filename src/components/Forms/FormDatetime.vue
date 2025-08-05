<template>
  <div
    ref="dateRoot"
    :class="{
      'form-parent': true,
      'select-component': true,
      err: everFocused && countErrors,
      'form-disabled': readonly,
      'has-value': pickedDates.length > 0,
    }"
    @blur="loseFocus(false, true)"
    @mouseenter="keepContainer = true"
    @mouseleave="keepContainer = false"
  >
    <!-- Seen part of form even when not focused -->
    <div :class="`form-group select-component ${dropdownOpen ? 'opened' : ''}`">
      <!-- Input for search purpose -->
      <input
        v-model="inputValue"
        class="input w-full"
        :class="{ error: hasError, 'opacity-70': readonly, 'has-value': !!inputValue }"
        :disabled="disabled"
        readonly
        @focus="triggerFocus"
        @keydown="handleKeypress"
      />
      <input-label :class="{ 'control-label': true, 'required-star': required }" :for="id">{{ label }}</input-label>

      <!-- Right side form for buttons -->
      <div class="right-form">
        <!-- Clear selection button -->
        <button
          v-if="emittedDates != null"
          tabindex="-1"
          class="input-attr-btn"
          type="button"
          @click.stop="doEmit(true)"
        >
          <font-awesome-icon icon="times-circle" size="sm" />
        </button>
        <!-- Just an indicator of it's a datetime container -->
        <button tabindex="-1" class="input-attr-btn" type="button" @click="triggerFocus">
          <font-awesome-icon icon="calendar" size="sm" />
        </button>
      </div>
    </div>

    <!-- The floating datetime container -->
    <div class="relative w-full">
      <transition name="slide-fade" mode="out-in">
        <!-- The Date container -->
        <div v-if="dropdownOpen && !disabled && !readonly" class="options-absolute calendar">
          <div class="options-container p-2">
            <!-- ===== View 1: Main Selection View: Monthly View ===== -->
            <template v-if="calendarDisplay === 1">
              <template v-if="!['time', 'timeRange'].includes(mode)">
                <!-- Header Section -->
                <div class="cal-header">
                  <button
                    class="cal-icon-buttons"
                    type="button"
                    :disabled="view2Pos.mon === 0 && view2Pos.yr - 1 < 1901"
                    @click="monthChange(true)"
                  >
                    <font-awesome-icon icon="angle-left" />
                  </button>

                  <!-- Selector bulan -->
                  <div class="cal-switch-buttons" @click="switchDisplayMode(2)">
                    {{ getCalString(view2Pos.mon, 'month') }}
                  </div>
                  <!-- Selector tahun -->
                  <div class="cal-switch-buttons" @click="switchDisplayMode(3)">{{ view2Pos.yr }}</div>

                  <button
                    class="cal-icon-buttons"
                    type="button"
                    :disabled="view2Pos.mon === 11 && view2Pos.yr + 1 > 2100"
                    @click="monthChange(false)"
                  >
                    <font-awesome-icon icon="angle-right" />
                  </button>
                </div>

                <!-- Body of Calendar -->
                <div class="cal-body">
                  <!-- Day Row -->
                  <div class="flex border-b-2 mb-1 border-gray-400">
                    <div v-if="withWeekNumber" class="calendar-date font-extrabold no-click text-xs week-number">
                      #Mg
                    </div>
                    <div class="cal-date-rows">
                      <div v-for="day in Array(7).keys()" :key="day" class="calendar-date font-extrabold no-click">
                        {{ getCalString(day, 'day', true) }}
                      </div>
                    </div>
                  </div>

                  <!-- Date Rows -->
                  <div class="grid grid-cols-1 gap-1 mb-1">
                    <div v-for="week in [...Array(6).keys()]" :key="week" class="flex gap-1">
                      <div v-if="withWeekNumber" class="calendar-date italic text-xs font-extrabold week-number">
                        {{ dateNum(week, 0).weekOfYear }}
                      </div>
                      <div class="cal-date-rows">
                        <div
                          v-for="day in [...Array(7).keys()]"
                          :key="day"
                          class="calendar-date"
                          :class="{
                            'mark-today': dateNum(week, day).isToday,
                            'date-shadow-picked': dateNum(week, day).inBetweenRange,
                            'date-picked': dateNum(week, day).isSelected,
                            'date-disabled': dateNum(week, day).disabled,
                            'month-offset': dateNum(week, day).offset !== 0,
                          }"
                          @click="clickAtDate(dateNum(week, day))"
                          @dblclick="mode === 'date' ? doEmit() : () => {}"
                        >
                          <span>{{ dateNum(week, day).date }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Clock 1 -->
              <div v-if="['dateTime', 'dateTimeRange', 'time', 'timeRange'].includes(mode)" class="cal-clock pb-1">
                <div class="flex items-center text-primary font-extrabold">
                  <div><font-awesome-icon icon="clock" class="mr-1" size="lg" /></div>
                  <p v-if="['dateTimeRange', 'timeRange'].includes(mode)" class="text-sm">Awal</p>
                </div>
                <div class="flex gap-1 items-center">
                  <!-- Hour -->
                  <div class="flex items-center">
                    <input
                      v-model="clockInput1.hour"
                      class="input-style clock-form text-center"
                      placeholder="HH"
                      @keydown="handleHourKeypress($event, 'h', true)"
                      @wheel="handleHourScroll($event, 'h', true)"
                    />
                    <div class="flex flex-col items-center">
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('h', false, true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-up" />
                      </div>
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('h', true, true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-down" />
                      </div>
                    </div>
                  </div>
                  <div>:</div>

                  <!-- Minute -->
                  <div class="flex items-center">
                    <input
                      v-model="clockInput1.min"
                      class="input-style clock-form text-center"
                      placeholder="MM"
                      @keydown="handleHourKeypress($event, 'm', true)"
                      @wheel="handleHourScroll($event, 'm', true)"
                    />
                    <div class="flex flex-col items-center">
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('m', false, true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-up" />
                      </div>
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('m', true, true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-down" />
                      </div>
                    </div>
                  </div>

                  <!-- Second -->
                  <template v-if="withSecond">
                    <div>:</div>
                    <div class="flex items-center">
                      <input
                        v-model="clockInput1.sec"
                        class="input-style clock-form text-center"
                        placeholder="SS"
                        @keydown="handleHourKeypress($event, 's', true)"
                        @wheel="handleHourScroll($event, 's', true)"
                      />
                      <div class="flex flex-col items-center">
                        <div
                          class="caret-button"
                          @mousedown="handleHourKeyhold('s', false, true)"
                          @mouseup="handleHourKeyRelease"
                        >
                          <font-awesome-icon icon="caret-up" />
                        </div>
                        <div
                          class="caret-button"
                          @mousedown="handleHourKeyhold('s', true, true)"
                          @mouseup="handleHourKeyRelease"
                        >
                          <font-awesome-icon icon="caret-down" />
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Clock 2 -->
              <div v-if="['dateTimeRange', 'timeRange'].includes(mode)" class="cal-clock pb-1">
                <div class="flex items-center text-primary font-extrabold">
                  <div><font-awesome-icon icon="clock" class="mr-1" size="lg" /></div>
                  <p class="text-sm">Akhir</p>
                </div>
                <div class="flex gap-1 items-center">
                  <!-- Hour -->
                  <div class="flex items-center">
                    <input
                      v-model="clockInput2.hour"
                      class="input-style clock-form text-center"
                      placeholder="HH"
                      @keydown="handleHourKeypress($event, 'h')"
                      @wheel="handleHourScroll($event, 'h')"
                    />
                    <div class="flex flex-col items-center">
                      <div class="caret-button" @mousedown="handleHourKeyhold('h')" @mouseup="handleHourKeyRelease">
                        <font-awesome-icon icon="caret-up" />
                      </div>
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('h', true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-down" />
                      </div>
                    </div>
                  </div>
                  <div>:</div>

                  <!-- Minute -->
                  <div class="flex items-center">
                    <input
                      v-model="clockInput2.min"
                      class="input-style clock-form text-center"
                      placeholder="MM"
                      @keydown="handleHourKeypress($event, 'm')"
                      @wheel="handleHourScroll($event, 'm')"
                    />
                    <div class="flex flex-col items-center">
                      <div class="caret-button" @mousedown="handleHourKeyhold('m')" @mouseup="handleHourKeyRelease">
                        <font-awesome-icon icon="caret-up" />
                      </div>
                      <div
                        class="caret-button"
                        @mousedown="handleHourKeyhold('m', true)"
                        @mouseup="handleHourKeyRelease"
                      >
                        <font-awesome-icon icon="caret-down" />
                      </div>
                    </div>
                  </div>

                  <!-- Second -->
                  <template v-if="withSecond">
                    <div>:</div>
                    <div class="flex items-center">
                      <input
                        v-model="clockInput2.sec"
                        class="input-style clock-form text-center"
                        placeholder="SS"
                        @keydown="handleHourKeypress($event, 's')"
                        @wheel="handleHourScroll($event, 's')"
                      />
                      <div class="flex flex-col items-center">
                        <div class="caret-button" @mousedown="handleHourKeyhold('s')" @mouseup="handleHourKeyRelease">
                          <font-awesome-icon icon="caret-up" />
                        </div>
                        <div
                          class="caret-button"
                          @mousedown="handleHourKeyhold('s', true)"
                          @mouseup="handleHourKeyRelease"
                        >
                          <font-awesome-icon icon="caret-down" />
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="cal-clock">
                <div class="flex-grow-0">
                  <template v-if="mode === 'date' || mode === 'dateTime'">
                    <p v-if="pickedDates.length < 1" class="italic text-sm">Pilih 1 tanggal</p>
                    <template v-else>
                      <p class="text-xs font-bold italic text-primary">{{ pickedDates.length }} Tanggal Terpilih</p>
                      <p class="text-sm">{{ mixins.translateDate(pickedDates[0], true, null, true, true) }}</p>
                    </template>
                  </template>

                  <template v-else-if="mode.includes('dateRange') || mode === 'dateTimeRange'">
                    <p v-if="pickedDates.length < 2" class="italic text-sm">Pilih 2 rentang tanggal</p>
                    <template v-else>
                      <p class="text-xs font-bold italic text-primary">{{ pickedDates.length }} Tanggal Terpilih</p>
                      <p class="text-sm">{{ mixins.translateDate(pickedDates[0], true, null, true, true) }} s.d</p>
                      <p class="text-sm">
                        {{ mixins.translateDate(pickedDates[pickedDates.length - 1], true, null, true, true) }}
                      </p>
                    </template>
                  </template>

                  <template v-else-if="mode === 'datePicks'">
                    <p v-if="pickedDates.length < 2" class="italic text-sm">
                      Pilih {{ maxPicks > 0 ? maxPicks : 'beberapa' }} tanggal
                    </p>
                    <template v-else>
                      <p class="text-xs font-bold italic text-primary">
                        {{ pickedDates.length }}{{ maxPicks ? `/${maxPicks}` : '' }} Tanggal Terpilih
                      </p>
                      <p class="text-sm">{{ mixins.translateDate(pickedDates[0], true, null, true, true) }} s.d</p>
                      <p class="text-sm">
                        {{ mixins.translateDate(pickedDates[pickedDates.length - 1], true, null, true, true) }}
                      </p>
                    </template>
                  </template>

                  <template v-else-if="['time', 'timeRange'].includes(mode)">
                    <p class="italic text-sm">Masukkan {{ mode === 'timeRange' ? 2 : 1 }} waktu</p>
                  </template>
                </div>
                <div class="btn-group">
                  <basic-button
                    icon="times-circle"
                    color="red"
                    tooltip="Batal dan tutup kalender"
                    @click="loseFocus(false, true)"
                  />
                  <basic-button
                    icon="trash-alt"
                    color="red"
                    tooltip="Hapus pilihan saat ini"
                    :disabled="pickedDates.length < 1"
                    @click="trashAllSelected"
                  />
                  <basic-button
                    icon="check-circle"
                    color="green"
                    tooltip="Simpan pilihan"
                    :disabled="['time', 'timeRange'].includes('mode') && pickedDates.length < 1"
                    @click="doEmit"
                  />
                </div>
              </div>
            </template>

            <!-- ===== View 2: Month Selection View ===== -->
            <template v-else-if="calendarDisplay === 2">
              <div class="cal-header">
                <button
                  class="cal-icon-buttons"
                  type="button"
                  :disabled="view2Pos.yr - 1 < 1901"
                  @click="view2Pos.yr - 1 < 1901 ? view2Pos.yr : view2Pos.yr--"
                >
                  <font-awesome-icon icon="angle-left" />
                </button>
                <div class="cal-switch-buttons" @click="switchDisplayMode(3)">{{ view2Pos.yr }}</div>
                <button
                  class="cal-icon-buttons"
                  type="button"
                  :disabled="view2Pos.yr + 1 > 2100"
                  @click="view2Pos.yr + 1 > 2100 ? view2Pos.yr : view2Pos.yr++"
                >
                  <font-awesome-icon icon="angle-right" />
                </button>
              </div>

              <!-- Body -->
              <div class="cal-body w-72">
                <div class="cal-month-rows">
                  <div
                    v-for="mon in [...Array(12).keys()]"
                    :key="mon"
                    :class="{
                      'calendar-mon': true,
                      'wide-selection': true,
                      'mark-today': checkIsToday(undefined, mon + 1),
                      'bg-secondary/60': mon === view1Pos.mon && view2Pos.yr === view1Pos.yr,
                    }"
                    @click="nonDateClick(2, mon)"
                  >
                    {{ months[mon] }}
                  </div>
                </div>
              </div>
            </template>

            <!-- ===== View 3: Year Selection View ===== -->
            <template v-else-if="calendarDisplay === 3">
              <div class="cal-header">
                <button
                  class="cal-icon-buttons"
                  type="button"
                  :disabled="view2Pos.view3Start < 1901"
                  @click="yearRangeChange(true)"
                >
                  <font-awesome-icon icon="angle-left" />
                </button>
                <div class="cal-switch">{{ view2Pos.view3Start + 1 }} - {{ view2Pos.view3Start + 10 }}</div>
                <button
                  class="cal-icon-buttons"
                  type="button"
                  :disabled="view2Pos.view3Start > 2089"
                  @click="yearRangeChange(false)"
                >
                  <font-awesome-icon icon="angle-right" />
                </button>
              </div>

              <!-- Body -->
              <div class="cal-body w-72">
                <div class="cal-year-rows">
                  <div
                    v-for="yr in [...Array(10).keys()]"
                    :key="yr"
                    :class="{
                      'calendar-mon': true,
                      'bg-secondary/60': view2Pos.view3Start + 1 + yr === view1Pos.yr,
                      'wide-selection': true,
                      'mark-today': checkIsToday(view2Pos.view3Start + 1 + yr),
                    }"
                    @click="nonDateClick(3, view2Pos.view3Start + 1 + yr)"
                  >
                    {{ view2Pos.view3Start + 1 + yr }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>

    <!-- Bottom of the form -->
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
/* eslint-disable no-case-declarations */
import InputLabel from '@/Components/Forms/Core/InputLabel.vue';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import BasicButton from '@/Components/Buttons/BasicButton.vue';
import { mixins } from '@/Mixins/mixinDeprecate';

dayjs.extend(isToday);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

// TODO: Mode return => Date object ato date ISO string
const props = defineProps({
  modelValue: {
    type: [String, Array, Date, null],
    default: () => null,
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
  placeholder: {
    type: String,
    default: 'Ketik untuk mencari',
  },
  /**
   * Popup yang muncul di form apabila ada kesalahan regex/required.
   */
  title: String,
  serverSideError: [String, Object],
  hideValidation: Boolean,
  /**
   * Memilih mode bagaimana kalendar akan bertindak dan apa yang direturn. Mode tersedia:
   * - date = Hanya pick 1 tanggal. Return Date(), waktu diset ke 00:00.
   * - dateRange = User memilih 2 tanggal. Return [Date(), Date()], semua waktu diset ke 00:00.
   * - dateRangeAll = User memilih 2 tanggal, Return [...Date()] dengan semua tanggal diantara rentang scr inklusif,
   * waktu diset ke 00:00.
   * - datePicks = User memilih N tanggal hingga menekan Done atau sesuai dengan jumlah yang diatur dengan props
   * maxPick, Return [...Date()] berisi semua tanggal yang dipilih, semua waktu diset ke 00:00.
   * - dateTime = Pick 1 tanggal dan 1 waktu. Return Date().
   * - dateTimeRange = Pick 2 tanggal dan 2 waktu, Return [Date(), Date()].
   * - time = Hanya pick 1 waktu. Return string 'hh:mm:ss'.
   * - timeRange = Pick 2 waktu. Return ['hh:mm:ss', 'hh:mm:ss'].
   */
  mode: {
    type: String,
    validator: (val) => {
      const opt = ['date', 'dateRange', 'dateRangeAll', 'datePicks', 'dateTime', 'dateTimeRange', 'time', 'timeRange'];
      return opt.includes(val);
    },
    default: () => 'date',
  },
  /**
   * Apabila mode merupakan `datePicks`, prop ini digunakan untuk mengatur jumlah tanggal maksimal yang bisa diambil.
   * Apabila nilainya 0, maka user bisa mengambil tanggal sebanyak mungkin.
   */
  maxPicks: {
    type: [Number, String],
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  withSecond: Boolean,
  withWeekNumber: Boolean,
  /**
   * Batas minimal tanggal bisa dipilih (Inklusif: Date yang disebutkan masih bisa dipilih)
   */
  minDate: [Date, String],
  /**
   * Batas maksimal tanggal bisa dipilih (Inklusif: Date yang disebutkan masih bisa dipilih)
   */
  maxDate: [Date, String],
  returnStringDate: Boolean,
});
const emit = defineEmits(['update:modelValue', 'change']);

// ==> Reactive Variables Collection <==

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
 * @type {Ref<UnwrapRef<string>>}
 */
const inputValue = ref('');

/**
 * Object dari options yang dipilih pengguna dan dikirim ke Parent Component
 * @type {Ref<UnwrapRef<any[]>>}
 */
const pickedDates = ref([]);
const emittedDates = ref(null);

const everFocused = ref(false);

const countErrors = ref(0);

/**
 * Posisi bulan dan tahun yang muncul di tampilan View 2 maupun 3.
 *
 * @type {UnwrapNestedRefs<{yr: number, mon: number}>}
 */
const view2Pos = reactive({
  mon: dayjs().month(),
  yr: dayjs().year(),
  view3Start: 0,
});

/**
 * Posisi bulan dan tahun yang muncul di tampilan view 1.
 *
 * @type {UnwrapNestedRefs<{yr: UnwrapRef<number>, mon: UnwrapRef<number>}>}
 */
const view1Pos = reactive({
  mon: view2Pos.mon,
  yr: view2Pos.yr,
});

/**
 * Object tanggal untuk hari ini dalam Day.js
 * @type {Ref<UnwrapRef<dayjs.Dayjs>>}
 */
const today = ref(dayjs());

/**
 * Mode kalender yang ditampilkan.
 * @type {Ref<UnwrapRef<string>>}
 */
const calendarDisplay = ref(1);

/**
 * Variabel yang dibutuhkan selama perhitungan untuk membuat tampilan bulan
 * @type {UnwrapNestedRefs<{cur: {last: number, first: number}, prev: {last: number}}>}
 */
const monthMath = reactive({
  prev: {
    last: 30,
  },
  cur: {
    first: 0,
    last: 30,
  },
});

const clockInput1 = reactive({
  hour: today.value.hour(),
  min: today.value.minute(),
  sec: props.withSecond ? today.value.second() : 0,
});

const clockInput2 = reactive({
  hour: today.value.hour(),
  min: today.value.minute(),
  sec: props.withSecond ? today.value.second() : 0,
});

// End of Reactive Variable Collections <==

// ==> Event

let holdIncrement = null;

// ==> HTML Ref Variable Collections <==
/**
 * Referensi dari DOM yang merupakan root dari component ini.
 * @type {Ref<any>}
 */
const dateRoot = ref();

// End of HTML Ref Variable Collection

// Constant Variable for Definitions

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// ===== Computed Variables Collection
const getCalString = (number, calType = 'day', short = false) => {
  if (calType === 'day') {
    return days[number].substring(0, short ? 3 : undefined);
  }

  return months[number].substring(0, short ? 3 : undefined);
};

const validityChecker = computed(() => {
  const returnVal = {
    req: true,
  };

  if (!props.hideValidation) {
    if (props.required && !pickedDates.value.length > 0) returnVal.req = false;
  }
  return returnVal;
});

// ===== Function Collections =====
/**
 * Menghapus semua tanggal yang sudah dipilih dalam temporary.
 */
const trashAllSelected = () => {
  pickedDates.value.length = 0;
};

/**
 * Merubah nilai jam menggunakan toggler/bukan dengan user input.
 * @param {string} type Tipe bagian jam yang akan dirubah. Gunakan salah satu dari berikut [h, m, s].
 * @param {boolean} isDecrement Pemilihan arah, apakah decrement atau increment.
 * @param {boolean} isTargetClock1 Pemilihan jam yang akan dirubah. True apabila clock 1, false apabila clock 2.
 */
const changeClockVal = (type, isDecrement = false, isTargetClock1 = false) => {
  const dict = {
    h: 'hour',
    m: 'min',
    s: 'sec',
  };

  const clockOrMin = type === 'h' ? 23 : 59;
  const clockInput = {
    hour: isTargetClock1 ? clockInput1.hour : clockInput2.hour,
    min: isTargetClock1 ? clockInput1.min : clockInput2.min,
    sec: isTargetClock1 ? clockInput1.sec : clockInput2.sec,
  };
  const temp = parseInt(clockInput[dict[type]], 10) + 1 * (isDecrement ? -1 : 1);
  if (temp > clockOrMin) clockInput[dict[type]] = 0;
  else if (temp < 0) clockInput[dict[type]] = clockOrMin;
  else clockInput[dict[type]] = temp;

  Object.assign(isTargetClock1 ? clockInput1 : clockInput2, {
    hour: clockInput.hour,
    min: clockInput.min,
    sec: clockInput.sec,
  });
};

/**
 * Handling event ketika user menekan panah atas dan panah bawah.
 * @param {Event} ev Event DOM
 * @param {string} formType Tipe form clock yang dituju. Gunakan [h, m, s]
 * @param {boolean} isTargetClock1 Apakah target merupakan clock1. True maka clock1, false maka clock2.
 */
const handleHourKeypress = (ev, formType, isTargetClock1 = false) => {
  if (ev.keyCode == 38) changeClockVal(formType, false, isTargetClock1);
  else if (ev.keyCode == 40) changeClockVal(formType, true, isTargetClock1);
  if (ev.keyCode < 48 || ev.keyCode > 57) ev.preventDefault();
};

/**
 * Handle event ketika user menahan klik pada salah satu tombol panah.
 * @param formType
 * @param isDecrement
 * @param isTargetClock1
 */
const handleHourKeyhold = (formType, isDecrement = false, isTargetClock1 = false) => {
  holdIncrement = setInterval(() => {
    changeClockVal(formType, isDecrement, isTargetClock1);
  }, 150);
};

/**
 * Handle event ketika user melakukan scroll ketika fokus di dalam form jam
 * @param ev
 * @param formType
 * @param isTargetClock1
 */
const handleHourScroll = (ev, formType, isTargetClock1 = false) => {
  // Scroll up
  if (ev.deltaY < 0) changeClockVal(formType, false, isTargetClock1);
  // Scroll Down
  else if (ev.deltaY > 0) changeClockVal(formType, true, isTargetClock1);
};

/**
 * Handle event setelah user melepas tahan klik dari tombol panah
 */
const handleHourKeyRelease = () => {
  clearInterval(holdIncrement);
};

/**
 * Mengirim hasil opsi yang dipilih ke parent component. Hasil yang dikirim hanya key saja, tanpa keseluruhan object.
 *
 * @param {Boolean} [setNull=false] Apabila true, maka component akan return null.
 * @param dontEmit
 */
const doEmit = (setNull = false, dontEmit = false) => {
  const appendClock = (date, useClock1 = false) => {
    const h = useClock1 ? mixins.leadZero(clockInput1.hour) : mixins.leadZero(clockInput2.hour);
    const m = useClock1 ? mixins.leadZero(clockInput1.min) : mixins.leadZero(clockInput2.min);
    const s = useClock1 ? mixins.leadZero(clockInput1.sec) : mixins.leadZero(clockInput2.sec);
    return `${date.substring(0, 10)}T${h}:${m}:${s}`;
  };

  if (setNull === true || (!['time', 'timeRange'].includes(props.mode) && pickedDates.value.length === 0)) {
    pickedDates.value = [];
    inputValue.value = '';
    emittedDates.value = null;
  } else if (props.mode === 'date') {
    inputValue.value = mixins.translateDate(pickedDates.value[0], true);
    emittedDates.value = new Date(pickedDates.value[0]);
  } else if (['dateRange', 'dateRangeAll', 'datePicks'].includes(props.mode)) {
    const amountPicked = pickedDates.value.length;
    const firstDate = mixins.translateDate(pickedDates.value[0], true);
    const secondDate = mixins.translateDate(pickedDates.value[amountPicked - 1], true);
    inputValue.value = `(${amountPicked} terpilih) ${firstDate} - ${secondDate}`;
    emittedDates.value = pickedDates.value.map((a) => new Date(a));
  } else if (props.mode === 'dateTime') {
    const wTime = mixins.createLocalDate(appendClock(pickedDates.value[0], true));
    inputValue.value = mixins.translateDate(wTime, true, '@', true, true);
    emittedDates.value = wTime;
  } else if (props.mode === 'dateTimeRange') {
    let amountPicked = pickedDates.value.length;

    let firstDt = pickedDates.value[0];
    let secondDt;

    if (amountPicked === 2) {
      secondDt = pickedDates.value[amountPicked - 1];
      if (firstDt > secondDt) {
        const temp = firstDt;
        firstDt = secondDt;
        secondDt = temp;
      }
      firstDt = mixins.createLocalDate(appendClock(firstDt, true));
      secondDt = mixins.createLocalDate(appendClock(secondDt));
    } else {
      firstDt = mixins.createLocalDate(appendClock(pickedDates.value[0], true));
      secondDt = mixins.createLocalDate(appendClock(pickedDates.value[0]));
      pickedDates.value.push(pickedDates.value[0]);
      amountPicked += 1;
    }

    if (firstDt > secondDt) {
      const temp = firstDt;
      firstDt = secondDt;
      secondDt = temp;
    }

    const firstDtStr = mixins.translateDate(firstDt, true, '@', true, true);
    const secondDtStr = mixins.translateDate(secondDt, true, '@', true, true);
    inputValue.value = `(${amountPicked} terpilih) ${firstDtStr} - ${secondDtStr}`;
    emittedDates.value = [firstDt, secondDt];
  } else if (props.mode === 'time') {
    const h = mixins.leadZero(clockInput1.hour);
    const m = mixins.leadZero(clockInput1.min);
    const s = mixins.leadZero(clockInput1.sec);
    const result = `${h}:${m}:${s}`;
    inputValue.value = result;
    emittedDates.value = result;
  } else if (props.mode === 'timeRange') {
    const h1 = mixins.leadZero(clockInput1.hour);
    const m1 = mixins.leadZero(clockInput1.min);
    const s1 = mixins.leadZero(clockInput1.sec);
    const time1 = `${h1}:${m1}:${s1}`;
    const h2 = mixins.leadZero(clockInput2.hour);
    const m2 = mixins.leadZero(clockInput2.min);
    const s2 = mixins.leadZero(clockInput2.sec);
    const time2 = `${h2}:${m2}:${s2}`;
    inputValue.value = `${time1} - ${time2}`;
    emittedDates.value = [time1, time2];
  }

  if (!dontEmit) {
    if (props.returnStringDate) {
      if (mixins.checkVarType(emittedDates.value) === 'date') {
        emit('update:modelValue', dayjs(emittedDates.value).format('YYYY-MM-DD HH:mm:ss'));
      } else if (mixins.checkVarType(emittedDates.value) === 'array') {
        emit(
          'update:modelValue',
          ['time', 'timeRange'].includes(props.mode)
            ? emittedDates.value
            : emittedDates.value.map((x) => dayjs(x).format('YYYY-MM-DD HH:mm:ss')),
        );
      }
    } else {
      emit('change');
      emit('update:modelValue', emittedDates.value);
    }
    keepContainer.value = false;
    dropdownOpen.value = false;
  }
};

const roundToPrev10 = (num) => Math.floor(num / 10) * 10;

/**
 * Mengecek apakah tanggal/bulan/tahun sesuai dengan hari ini
 * @param {Number} yr Tahun
 * @param {Number} mon Bulan
 * @param {Number} dt Tanggal
 * @returns {*|boolean}
 */
const checkIsToday = (yr = undefined, mon = undefined, dt = undefined) => {
  const y = yr ?? view2Pos.yr;
  if (mon === undefined && dt === undefined) {
    return today.value.year() === y;
  }

  const m = typeof mon === 'number' || !Number.isNaN(Number(mon)) ? mon - 1 : view2Pos.mon;
  if (dt === undefined) {
    return today.value.year() === y && today.value.month() === m;
  }

  const d = dt ?? 1;
  return today.value.startOf('day').isSame(
    dayjs()
      .date(d)
      .month(m - 1)
      .year(y)
      .startOf('day'),
  );
};

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
 * Yang dilakukan ketika input kehilangan focus.
 *
 * @param withoutCheck True apabila ketika lose focus langsung jalankan validasi pengecekan error.
 * @param force Apabila True, maka container akan ditutup meskipun kondisi keepContainer true.
 */
const loseFocus = (withoutCheck = false, force = false) => {
  if (force || !keepContainer.value) dropdownOpen.value = false;
  everFocused.value = true;
  if (withoutCheck) checkError();
};

/**
 * Mendeteksi ketika ada event klik terjadi, jika diluar component maka hilangkan focus dari component.
 *
 * @param ev DOM Event
 */
const detectClick = (ev) => {
  if (!dateRoot.value.contains(ev.target)) loseFocus(true);
};

/**
 * Ketika input sedang mendapatkan focus
 */
const triggerFocus = () => {
  dropdownOpen.value = true;
  document.addEventListener('click', detectClick);
};

/**
 * Mencari index HARI tanggal 1 untuk bulan yang dikirim.
 * @param {Number} month
 * @param {Number} year
 * @returns {number}
 */
const detectFirstDay = (month = null, year = null) => {
  const current = dayjs();
  return dayjs()
    .year(parseInt(year, 10) ?? current.year())
    .month(parseInt(month, 10) ?? current.month())
    .date(1)
    .day();
};

/**
 * Mencari TANGGAL terakhir dari bulan yang dikirim.
 * @param {Number} month
 * @param {Number} year
 * @returns {number}
 */
const findLastDateOfMonth = (month = null, year = null) => {
  const current = dayjs();
  return dayjs()
    .year(parseInt(year, 10) ?? current.year())
    .month(parseInt(month, 10) ?? current.month())
    .endOf('month')
    .date();
};

/**
 * Melakukan perhitungan yang diperlukan agar bisa mengenerate tampilan bulan yang dipilih
 * @param {Number} month
 * @param {Number} year
 */
const configureCalendar = (month = null, year = null) => {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  monthMath.prev.last = findLastDateOfMonth(prevMonth, prevYear);
  monthMath.cur.last = findLastDateOfMonth(month, year);
  monthMath.cur.first = detectFirstDay(month, year);
};

/**
 * Ketika user menekan panah di view 3. Cycle setiap 10 tahun
 * @param {boolean} decrement Arah dari cycle. True apabila ke -10, false apabila +10.
 */
const yearRangeChange = (decrement = false) => {
  if (decrement) view2Pos.view3Start = view2Pos.view3Start - 10 < 1900 ? view2Pos.view3Start : view2Pos.view3Start - 10;
  else view2Pos.view3Start = view2Pos.view3Start + 10 >= 2100 ? view2Pos.view3Start : view2Pos.view3Start + 10;
};

/**
 * Logic ketika cycle bulan.
 * @param {boolean} decrement Arah dari cycle. True apabila -1, false apabila +1.
 */
const monthChange = (decrement = false) => {
  if (decrement) {
    if (--view2Pos.mon < 0) {
      view2Pos.mon = 11;
      view2Pos.yr--;
    }
  } else if (++view2Pos.mon > 11) {
    view2Pos.mon = 0;
    view2Pos.yr++;
  }

  configureCalendar(view2Pos.mon, view2Pos.yr);
};

/**
 * Ketika user menekan sebuah tanggal di view 1.
 * @param date
 */
const clickAtDate = (date) => {
  if (date.disabled) return;
  const picked = `${date.year}-${mixins.leadZero(date.month)}-${mixins.leadZero(date.date)}T00:00:00Z`;

  if (date.offset !== 0) monthChange(date.offset === -1);

  switch (props.mode) {
    case 'dateTime':
    case 'date':
      if (pickedDates.value.length < 1) pickedDates.value = [picked];
      pickedDates.value[0] = picked;
      break;
    case 'dateTimeRange':
    case 'dateRange':
    case 'dateRangeAll':
      if (pickedDates.value.length > 1) pickedDates.value = [picked];
      else pickedDates.value.push(picked);

      if (pickedDates.value.length === 2) {
        // Kalau dateRangeAll, maka reset semua isinya terus isi ulang dengan semua value dari loop.
        if (props.mode === 'dateRangeAll') {
          let start = new Date(pickedDates.value[0]);
          let finish = new Date(pickedDates.value[1]);
          if (start.getTime() > finish.getTime()) {
            const temp = start;
            start = finish;
            finish = temp;
          }
          pickedDates.value = [];

          while (start <= finish) {
            pickedDates.value.push(new Date(start));
            start.setDate(start.getDate() + 1);
          }
        }
        pickedDates.value.sort((a, b) => new Date(a) - new Date(b));
      }
      break;
    case 'datePicks':
      // eslint-disable-next-line no-case-declarations
      const ind = pickedDates.value.indexOf(picked);
      if (ind >= 0) pickedDates.value.splice(ind, 1);
      else if (props.maxPicks && pickedDates.value.length >= props.maxPicks) break;
      else pickedDates.value.push(picked);

      pickedDates.value.sort((a, b) => new Date(a) - new Date(b));
      break;
    default:
  }
};

/**
 * Generate tanggal yang butuh ditampilkan di kalender sesuai kolom hari dan baris minggu.
 *
 * @param {Number} weekNumber Nomor minggu (Baris)
 * @param {Number} dayNumber Nomor hari, minggu adalah 0 dan sabtu adalah 6 (Kolom)
 * @returns {{date: *, weekOfYear: *, month: number, offset: number, year: UnwrapRef<number>, isToday: *, isSelected: *,
 * disabled: *, inBetweenRange: (*|boolean)}}
 */
const dateNum = (weekNumber, dayNumber) => {
  let offset = 0;
  let returnVal = null;
  let thisMon = view2Pos.mon;
  let thisYr = view2Pos.yr;
  if (weekNumber === 0) {
    if (dayNumber < monthMath.cur.first) {
      offset = -1;
      if (view2Pos.mon - 1 < 0) {
        thisMon = 11;
        thisYr = view2Pos.yr - 1;
      } else thisMon = view2Pos.mon - 1;
      returnVal = monthMath.prev.last - monthMath.cur.first + dayNumber + 1; // Days of previous month
    } else returnVal = dayNumber - monthMath.cur.first + 1; // Days of current month's first week
  }
  if (returnVal === null) {
    returnVal = weekNumber * 7 - monthMath.cur.first + dayNumber + 1; // Days of current month
    if (returnVal > monthMath.cur.last) {
      offset = 1;
      if (view2Pos.mon + 1 > 11) {
        thisMon = 0;
        thisYr = view2Pos.yr + 1;
      } else thisMon = view2Pos.mon + 1;
      returnVal -= monthMath.cur.last; // Days of next month
    }
  }

  const modDate = dayjs().month(thisMon).year(thisYr).date(returnVal);
  const rangeCheck = () => {
    const objLen = pickedDates.value.length;
    if ((props.mode === 'dateRange' || props.mode === 'dateTimeRange') && objLen === 2) {
      return modDate.isBetween(pickedDates.value[0], pickedDates.value[objLen - 1], null, '()');
    }
    return false;
  };

  const disableThisDate = () => {
    const minChecker = props.minDate && modDate.isBefore(dayjs(props.minDate));
    const maxChecker = props.maxDate && modDate.isAfter(dayjs(props.maxDate).add(1, 'day'));
    return !!(minChecker || maxChecker);
  };

  return {
    date: returnVal,
    month: thisMon + 1,
    year: thisYr,
    offset,
    disabled: disableThisDate(),
    isToday: modDate.isToday(),
    inBetweenRange: rangeCheck(),
    isSelected: pickedDates.value.map((dt) => dayjs(dt).startOf('day')).some((dt) => dt.isSame(modDate.startOf('day'))),
    weekOfYear: modDate.week(),
  };
};

const switchDisplayMode = (mode) => {
  if ([1, 2, 3].includes(mode)) {
    calendarDisplay.value = mode;
    return;
  }
  calendarDisplay.value = 1;
};

const nonDateClick = (target, value) => {
  if ([2, 3].includes(target)) {
    calendarDisplay.value = target - 1;
    switch (target) {
      case 3:
        view2Pos.yr = value;
        break;
      case 2:
        view1Pos.yr = view2Pos.yr;
        view1Pos.mon = value;
        view2Pos.mon = value;

        configureCalendar(view2Pos.mon, view2Pos.yr);
        break;
      default:
    }
  }
};

/**
 * Handler dari beberapa event keyboard ketika pointer berada dalam field input.
 * @param {Event} ev DOM Event
 */
const handleKeypress = (ev) => {
  if (ev.key === 'ArrowLeft') {
    // Scroll highlight options kebawah
    ev.preventDefault();
    monthChange(true);
  }
  if (ev.key === 'ArrowRight') {
    // Scroll highlight options keatas
    ev.preventDefault();
    monthChange(false);
  }
  if (ev.key === 'Tab') loseFocus(); // Berpindah ke form field selanjutnya sekaligus menjalankan loseFocus()
  if (ev.key === 'Enter') {
    ev.preventDefault();
    if (pickedDates.value.length > 0) doEmit();
  }
  if (ev.key === 'Escape' || ev.key === 'Esc') {
    // Menutup field dropdown tanpa harus menutup event lain.
    ev.preventDefault();
    ev.stopPropagation();
    dropdownOpen.value = false;
    keepContainer.value = false;
  }
};

// End of Functions Collection

// ===== Watchers Collection
watch(view2Pos, (newVal, oldVal) => {
  if (newVal.yr !== oldVal.yr) {
    view2Pos.view3Start = roundToPrev10(view2Pos.yr === 2100 ? view2Pos.yr - 1 : view2Pos.yr);
  }
});

// ===== Component's Cycles Events

onMounted(() => {
  configureCalendar(view2Pos.mon, view2Pos.yr);
  view2Pos.view3Start = roundToPrev10(view2Pos.yr);

  // ['date', 'dateRange', 'dateRangeAll', 'datePicks', 'dateTime', 'dateTimeRange', 'time', 'timeRange']

  if (props.modelValue) {
    const varType = mixins.checkVarType(props.modelValue);
    const tempValue = [];
    switch (props.mode) {
      case 'date':
        if (varType === 'date' || varType === 'string') {
          const conversion = new Date(props.modelValue);
          if (!Number.isNaN(conversion.getTime())) pickedDates.value = [conversion.toISOString()];
        } else if (varType === 'array') {
          let flag = false;
          props.modelValue.forEach((x) => {
            if (flag) return;
            const conversion = new Date(x);
            if (!Number.isNaN(conversion.getTime())) {
              pickedDates.value = [conversion.toISOString()];
              flag = true;
            }
          });
        }
        break;
      case 'dateRange':
      case 'dateRangeAll':
      case 'datePicks':
        if (varType === 'date' || varType === 'string') {
          const conversion = new Date(props.modelValue);
          if (!Number.isNaN(conversion.getTime())) pickedDates.value = [conversion.toISOString()];
        } else if (varType === 'array') {
          props.modelValue.forEach((x) => {
            const conversion = new Date(x);
            if (!Number.isNaN(conversion.getTime())) pickedDates.value.push(conversion.toISOString());
          });
        }
        break;
      case 'dateTime':
        let conversion;
        if (varType === 'date' || varType === 'string') conversion = new Date(props.modelValue);
        else if (varType === 'array') conversion = new Date(props.modelValue[0]);

        if (!Number.isNaN(conversion.getTime())) {
          pickedDates.value = [conversion.toISOString()];
          clockInput1.hour = conversion.getHours();
          clockInput1.min = conversion.getMinutes();
          clockInput1.sec = conversion.getSeconds();
        }

        break;
      case 'dateTimeRange':
        if (varType === 'date' || varType === 'string') {
          const dtConversion = new Date(props.modelValue);

          if (!Number.isNaN(dtConversion.getTime())) {
            tempValue.push(dtConversion.toISOString());
            clockInput1.hour = dtConversion.getHours();
            clockInput1.min = dtConversion.getMinutes();
            clockInput1.sec = dtConversion.getSeconds();
          }
        } else if (varType === 'array') {
          props.modelValue.forEach((x) => {
            if (tempValue.length === 2) return;

            const dtConversion = new Date(x);

            if (!Number.isNaN(dtConversion.getTime())) {
              tempValue.push(dtConversion.toISOString());

              if (tempValue.length === 1) {
                clockInput1.hour = dtConversion.getHours();
                clockInput1.min = dtConversion.getMinutes();
                clockInput1.sec = dtConversion.getSeconds();
              } else if (tempValue.length === 2) {
                clockInput2.hour = dtConversion.getHours();
                clockInput2.min = dtConversion.getMinutes();
                clockInput2.sec = dtConversion.getSeconds();
              }
            }
          });
        }

        pickedDates.value = tempValue;
        break;
      case 'time':
      case 'timeRange':
        const timeRegCheck = (inp) => inp.match(/^(?:[01]?[0-9]|2[0-3]):[0-5]?[0-9](?::[0-5]?[0-9])?$/);
        const dtRegCheck = (inp) => {
          const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
          const sql = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
          return inp.match(iso) || inp.match(sql);
        };
        const checkTime = (val, inpType = 'string', for2nd = false) => {
          if (inpType === 'string') {
            let spl;
            let flag = false;
            if (timeRegCheck(val)) {
              spl = val.split(':');
              flag = true;
            } else if (dtRegCheck(val)) {
              spl = val.substring(11, 19).split(':');
              flag = true;
            }

            if (flag) {
              const [h, m, s] = spl;
              if (for2nd) {
                clockInput2.hour = h;
                clockInput2.min = m ?? '0';
                clockInput2.sec = s ?? '0';
              } else {
                clockInput1.hour = h;
                clockInput1.min = m ?? '0';
                clockInput1.sec = s ?? '0';
              }
              return true;
            }
          } else if (inpType === 'date') {
            if (for2nd) {
              clockInput2.hour = val.getHours();
              clockInput2.min = val.getMinutes();
              clockInput2.sec = val.getSeconds();
            } else {
              clockInput1.hour = val.getHours();
              clockInput1.min = val.getMinutes();
              clockInput1.sec = val.getSeconds();
            }
            return true;
          }

          return false;
        };

        if (varType === 'array') {
          props.modelValue.forEach((x) => {
            if (tempValue.length === 2) return;

            if (checkTime(x, mixins.checkVarType(x), tempValue.length === 1)) tempValue.push(x);
          });
        } else if (checkTime(props.modelValue, varType)) tempValue.push(props.modelValue);

        pickedDates.value = tempValue;
        break;
      default:
    }

    doEmit(false, true);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', detectClick);
});
</script>

<style></style>
