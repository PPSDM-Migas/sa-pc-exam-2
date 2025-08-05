<script setup>
/* eslint-disable no-bitwise */
import BasicCard from '@/Components/Cards/BasicCard.vue';
import BasicButton from '@/Components/Buttons/BasicButton.vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import FormInput from '@/Components/Forms/FormInput.vue';
import PageButton from '@/Components/Buttons/PageButton.vue';
import LoadingCard from '@/Components/Cards/LoadingCard.vue';
import NotificationCard from '@/Components/Cards/NotificationCard.vue';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';

const props = defineProps({
  amountShown: {
    type: [String, Number],
    default: '0',
  },
  amountTotal: {
    type: [String, Number],
    default: '0',
  },
  currentPage: {
    type: [String, Number],
    default: '0',
  },
  maxPage: {
    type: [String, Number],
    default: '0',
  },
  itemText: {
    type: String,
    default: 'Data',
  },
  disableNext: Boolean,
  disablePrev: Boolean,
  onClickCreate: Function,
  onClickFilter: Function,
  onClickRefresh: Function,
  onSubmitSearch: Function,
  withoutManualToggle: Boolean,
  onlyInfo: Boolean,
  onlyToggle: Boolean,
  onPageToggle: Function,
  appliedSearch: String,

  loadStatus: Number,
  errorMessage: String,
  data: Array,
  gridView: {
    type: String,
    default: 'grid grid-cols-1 gap-2',
  },
});

const selectPage = ref(props.currentPage);

const emits = defineEmits([
  'clickCreate',
  'clickRefresh',
  'clickFilter',
  'prevPage',
  'nextPage',
  'manualPage',
  'pageToggle',
  'submitSearch',
]);

const maxNum = computed(() => {
  if ((props.maxPage || props.maxPage === 0) && props.maxPage !== '0') return props.maxPage;
  return Math.ceil(props.amountTotal / props.amountShown) || 0;
});

// ===== Soal Search =====

const searchInput = ref(null);
const searchBar = reactive({
  display: false,
  applied: '',
});
const searchVal = defineModel();

const openSearch = () => {
  searchBar.display = true;
  searchInput.value?.triggerFocus();
};

// ===== Soal Pagination ====

const isThereNext = computed(() => props.currentPage === props.maxPage);
const isTherePrev = computed(() => props.currentPage <= 1);

const sectionSize = 5;

const pageControl = reactive({
  start: 1,
  end: Math.min(maxNum.value, sectionSize),
});

const pages = computed(() => {
  const pageList = [];
  for (let i = pageControl.start; i <= pageControl.end; i++) {
    pageList.push(i);
  }
  return pageList;
});

const pageScroll = (asc = false) => {
  const controlVar = asc ? sectionSize : -sectionSize;

  const newStart = pageControl.start + controlVar;
  const newEnd = pageControl.end + controlVar;

  pageControl.start = Math.max(1, Math.min(props.maxPage - 4, newStart));
  pageControl.end = Math.min(props.maxPage, Math.max(5, newEnd));
};

const showLeftEllipsis = computed(() => pageControl.start > 1);
const showRightEllipsis = computed(() => pageControl.end < props.maxPage);

const triggerClickRefresh = () => {
  emits('clickRefresh');
};

const updatePageControl = () => {
  if (props.maxPage <= sectionSize) {
    pageControl.start = 1;
    pageControl.end = props.maxPage;
  } else if (props.currentPage <= Math.ceil(sectionSize / 2)) {
    pageControl.start = 1;
    pageControl.end = sectionSize;
  } else if (props.currentPage >= props.maxPage - Math.floor(sectionSize / 2)) {
    pageControl.start = props.maxPage - sectionSize + 1;
    pageControl.end = props.maxPage;
  } else {
    pageControl.start = props.currentPage - Math.floor(sectionSize / 2);
    pageControl.end = props.currentPage + Math.floor(sectionSize / 2);
  }
  pageControl.end = Math.min(pageControl.end, props.maxPage);
  pageControl.start = Math.max(pageControl.start, 1);
};

watch(
  () => props.maxPage,
  () => {
    updatePageControl();
  },
);

onMounted(() => {
  updatePageControl();
});
</script>

<template>
  <LoadingCard v-if="loadStatus === 0" with-time />
  <NotificationCard
    v-else-if="loadStatus === -1"
    border-color="red"
    title="Terjadi Kesalahan"
    icon="exclamation-triangle"
  >
    <div class="text-center my-4 flex flex-col gap-2 items-center">
      <font-awesome-icon icon="heart-crack" size="3x" class="text-subtitle" beat />
      <p class="text-sm mt-2">
        {{ errorMessage }}
      </p>
      <basic-button icon="arrows-rotate" @click="triggerClickRefresh">Coba Lagi</basic-button>
    </div>
  </NotificationCard>
  <div v-else>
    <div class="mb-2 flex justify-between items-center gap-2">
      <basic-card v-if="!onlyToggle || onlyInfo">
        <div v-if="!searchBar.display" class="flex gap-1.5 items-center justify-start flex-col md:flex-row">
          <div class="btn-group">
            <basic-button
              v-if="onClickCreate"
              icon="plus"
              color="green"
              :tooltip="`Tambah ${itemText} Baru`"
              @click="emits('clickCreate')"
            />
            <basic-button
              v-if="onClickRefresh"
              icon="arrows-rotate"
              :tooltip="`Perbarui Data`"
              @click="triggerClickRefresh(3)"
            />
            <basic-button
              v-if="onClickFilter"
              icon="filter"
              color="ternary"
              tooltip="Gunakan Filter"
              @click="emits('clickFilter')"
            />
            <basic-button
              v-if="onSubmitSearch"
              icon="magnifying-glass"
              color="ternary"
              tooltip="Cari..."
              class="block md:hidden"
              @click="openSearch()"
            />
          </div>
          <div>
            <h5>Menampilkan {{ amountShown }}</h5>
            <p class="text-xs">
              <template v-if="appliedSearch">{{ amountTotal }} Hasil Pencarian "{{ appliedSearch }}"</template>
              <template v-else>Total {{ amountTotal }} {{ itemText }}</template>
            </p>
          </div>
        </div>
        <div v-else>
          <form v-if="onSubmitSearch" class="flex gap-1.5 items-center" @submit.prevent="emits('submitSearch')">
            <FormInput id="searching-page" ref="searchInput" v-model="searchVal" label="Cari" m0 />
            <BasicButton icon="paper-plane" tooltip="Mulai Cari" as-submit />
            <BasicButton icon="reply" tooltip="Kembali" color="red" @click="searchBar.display = false" />
          </form>
        </div>
      </basic-card>
      <div class="w-72 hidden md:block">
        <form v-if="onSubmitSearch" class="flex gap-1.5 items-center" @submit.prevent="emits('submitSearch')">
          <FormInput id="searching-page" ref="searchInput" v-model="searchVal" label="Cari" m0 />
          <BasicButton icon="paper-plane" tooltip="Mulai Cari" as-submit />
        </form>
      </div>
    </div>
    <NotificationCard v-if="data.length < 1" border-color="red">
      <div class="text-center my-4 flex flex-col gap-2 items-center">
        <font-awesome-icon icon="ghost" size="2x" class="truck text-subtitle" />
        <p class="text-xs italic text-subtitle">Maaf belum ada {{ itemText }} ._.</p>
        <div class="btn-group">
          <BasicButton icon="arrows-rotate" @click="triggerClickRefresh">Coba Lagi</BasicButton>
        </div>
      </div>
    </NotificationCard>

    <div v-else>
      <!-- Content Here -->
      <div :class="gridView">
        <div v-for="(c, i) in data" :key="i">
          <slot :item="c" :index="i"></slot>
        </div>
      </div>

      <div class="mt-2 flex justify-end">
        <basic-card v-if="!onlyInfo || onlyToggle">
          <div class="all-center">
            <div class="btn-group items-center mb-1.5">
              <BasicButton
                v-if="showLeftEllipsis"
                icon="ellipsis"
                small
                tooltip="5 halaman sebelumnya"
                @click="pageScroll()"
              />
              <PageButton
                v-for="(p, i) in pages"
                :key="i"
                :current-page="currentPage === p"
                @click="emits(props.onPageToggle ? 'pageToggle' : 'manualPage', p)"
              >
                {{ p }}
              </PageButton>
              <BasicButton
                v-if="showRightEllipsis"
                icon="ellipsis"
                small
                tooltip="5 halaman setelahnya"
                @click="pageScroll(true)"
              />
            </div>
          </div>
          <div class="flex justify-center">
            <div class="flex flex-row items-center gap-1">
              <BasicButton
                icon="angles-left"
                small
                :disabled="disablePrev || isTherePrev"
                :tooltip="`Halaman Pertama (1)`"
                @click="emits(props.onPageToggle ? 'pageToggle' : 'prevPage', 1)"
              />
              <BasicButton
                icon="angle-left"
                small
                :disabled="disablePrev || isTherePrev"
                :tooltip="`Halaman Sebelumnya (${Math.max(1, currentPage - 1)})`"
                @click="emits(props.onPageToggle ? 'pageToggle' : 'prevPage', currentPage - 1)"
              />
              <div class="flex-shrink-0">
                <Popover v-if="!withoutManualToggle">
                  <PopoverTrigger>
                    <div class="all-center mx-2 text-sm text-ld">
                      Hal {{ currentPage }}/{{ maxNum }}
                      <font-awesome-icon v-if="!withoutManualToggle" icon="pencil" class="ml-1.5" size="xs" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent class="">
                    <div class="p-2 inline-flex items-center gap-1 bg-light dark:bg-dark">
                      <form-input
                        id="page-select"
                        v-model="selectPage"
                        label="No. Hal"
                        class="w-28"
                        type="number"
                        :max-val="maxPage"
                        :min-val="maxPage > 0 ? 1 : 0"
                        m0
                      ></form-input>
                      <basic-button
                        icon="paper-plane"
                        @click="emits(props.onPageToggle ? 'pageToggle' : 'manualPage', selectPage)"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <div v-else class="all-center mx-2 text-sm text-ld">
                  Hal {{ currentPage }} dari {{ maxNum }}
                  <font-awesome-icon v-if="!withoutManualToggle" icon="pencil" class="ml-1.5" size="xs" />
                </div>
              </div>
              <BasicButton
                icon="angle-right"
                small
                :disabled="disableNext || isThereNext"
                :tooltip="`Halaman Selanjutnya (${Math.min(currentPage + 1, maxPage)})`"
                @click="emits(props.onPageToggle ? 'pageToggle' : 'nextPage', currentPage + 1)"
              />
              <BasicButton
                icon="angles-right"
                small
                :disabled="disableNext || isThereNext"
                :tooltip="`Halaman Terakhir (${maxPage})`"
                @click="emits(props.onPageToggle ? 'pageToggle' : 'nextPage', maxPage)"
              />
            </div>
          </div>
        </basic-card>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
