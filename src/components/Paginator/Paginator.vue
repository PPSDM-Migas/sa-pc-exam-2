<script setup>
/* eslint-disable no-bitwise */
import BasicCard from '@/Components/Cards/BasicCard.vue';
import BasicButton from '@/Components/Buttons/BasicButton.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import FormInput from '@/Components/Forms/FormInput.vue';
import PageButton from '@/Components/Buttons/PageButton.vue';

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
  totalPage: {
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
});

const selectPage = ref(0);

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
  end: Math.min(props.maxPage, sectionSize),
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

onMounted(() => {
  selectPage.value = props.currentPage;
  if (props.maxPage <= 5) {
    pageControl.start = 1;
    pageControl.end = props.maxPage;
  } else if (props.currentPage <= 3) {
    pageControl.start = 1;
    pageControl.end = 5;
  } else if (props.currentPage >= props.maxPage - 2) {
    pageControl.start = props.maxPage - 4;
    pageControl.end = props.maxPage;
  } else {
    pageControl.start = props.currentPage - 2;
    pageControl.end = props.currentPage + 2;
  }
});
</script>

<template>
  <div class="flex justify-between items-center gap-2">
    <basic-card v-if="!onlyToggle || onlyInfo">
      <form v-if="searchBar.display" @submit.prevent="emits('submitSearch')"  class="flex gap-1.5 items-center">
        <FormInput id="searching-page" ref="searchInput" v-model="searchVal" label="Cari" m0 />
        <BasicButton icon="paper-plane" tooltip="Mulai Cari" as-submit />
        <BasicButton icon="reply" color="ternary" tooltip="Kembali" @click="searchBar.display = false" />
      </form>
      <div v-else class="flex gap-1.5 items-center justify-start flex-col md:flex-row">
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
            @click="emits('clickRefresh')"
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
    </basic-card>
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
            <v-dropdown v-if="!withoutManualToggle">
              <div class="all-center mx-2 text-sm text-ld">
                Hal {{ currentPage }}/{{ maxNum }}
                <font-awesome-icon v-if="!withoutManualToggle" icon="pencil" class="ml-1.5" size="xs" />
              </div>

              <template #popper>
                <div class="p-2 inline-flex items-center gap-1 bg-light dark:bg-dark">
                  <form-input
                    id="page-select"
                    v-model="selectPage"
                    label="No. Hal"
                    class="w-28"
                    type="number"
                    :max-val="maxPage"
                    :min-val="maxPage > 0 ? 0 : 1"
                    m0
                  ></form-input>
                  <basic-button
                    icon="paper-plane"
                    @click="emits(props.onPageToggle ? 'pageToggle' : 'manualPage', selectPage)"
                  />
                </div>
              </template>
            </v-dropdown>

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
</template>

<style scoped></style>
