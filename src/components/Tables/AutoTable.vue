<template>
  <div class="auto-table-container">
    <!-- Awal sebelum table -->
    <div class="mb-2">
      <!-- Search form -->
      <div v-if="withSearch || onClickFilter" class="stretch-flex w-full">
        <div>
          <BasicButton v-if="onClickFilter" icon="filter" color="ternary" @click="emits('clickFilter')" />
        </div>

        <div v-if="withSearch" class="inline-flex items-center gap-2 md:w-64">
          <p class="font-extrabold text-sm"><font-awesome-icon icon="magnifying-glass" /></p>
          <input v-model="searchString" type="text" class="table-search-form" placeholder="Cari data..." />
        </div>
      </div>
    </div>

    <!-- The Table -->
    <div class="overflow-x-auto">
      <table class="auto-table">
        <thead>
          <!-- Auto generated header based on headers props -->
          <tr>
            <th v-if="withIndex" class="w-10 text-center" @click="applySort(-1)">No.</th>
            <th
              v-for="(h, i) in localHeader"
              :key="i"
              :class="[h.class, h.sortable ? 'sortable' : '']"
              class="text-left"
              @click="applySort(i)"
            >
              <div class="flex gap-1 items-center w-full">
                <div v-if="h.sortable || (withSearch && h.searchable)" class="flex-freeze">
                  <!-- Icon Kaca Pembesar akan muncul apabila data bisa dicari berdasarkan kolom ini -->
                  <font-awesome-icon
                    v-if="withSearch && h.searchable"
                    icon="magnifying-glass"
                    size="xs"
                    class="mr-0.5 opacity-70"
                  />
                  <!-- Icon Panah akan muncul apabila data bisa diurutkan berdasarkan kolom ini -->
                  <!-- 3 klik Rule: Tidak diurutkan (2 panah), Diurutkan ke bawah (Panah bawah), Diurutkan ke atas
                  (Panah atas) -->
                  <template v-if="h.sortable">
                    <font-awesome-icon
                      v-if="appliedSort.index === i"
                      :icon="appliedSort.asc ? 'sort-down' : 'sort-up'"
                      class="mr-0.5"
                    />
                    <font-awesome-icon v-else icon="sort" class="opacity-40 mr-0.5" />
                  </template>
                </div>

                <!-- Nama Kolom -->
                <div class="w-full">
                  {{ h.name }}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Indikator Loading -->
          <tr v-if="isLoading">
            <td colspan="100%" class="text-center p-4">
              <slot v-if="!$slots.customLoading" name="customLoading" />
              <loading-card v-else icon-type="truck" with-time />
            </td>
          </tr>

          <!-- Indikator Error ketika fetch data -->
          <tr v-else-if="asyncTable && isError">
            <td colspan="100%">
              <slot v-if="$slots.customError" name="customError" />
              <div v-else class="flex flex-col items-center p-4 w-full">
                <p>Gagal memuat data.</p>
                <basic-button icon="arrows-rotate" @click="refreshTable">Coba Lagi</basic-button>
              </div>
            </td>
          </tr>

          <!-- Indikator Data Kosong -->
          <tr v-else-if="localAllContent.length <= 0">
            <td colspan="100%" class="text-center p-4">
              <slot v-if="$slots.customEmpty" name="customEmpty" />
              <template v-else>
                <font-awesome-icon icon="ghost" class="truck" size="4x" />
                <p class="text-2xl font-extrabold mt-4">Tidak Ada Data</p>
              </template>
            </td>
          </tr>

          <!-- Render setiap data -->
          <template v-else>
            <tr v-for="(c, i) in localContent" :key="i">
              <!-- Nomor apabila user ingin menampilkan -->
              <td v-if="withIndex" class="text-center">{{ dataStartAt + 1 + i }}</td>

              <!-- Body yang disusun ulang pada localContent berdasarkan isi dari props content -->
              <template v-if="!slots.customRows">
                <td v-for="(h, j) in headers" :key="j">
                  {{ c[h.label] ?? '--' }}
                </td>
              </template>

              <!-- Ketika dev ingin menyajikan setiap baris secara custom. Data setiap baris disimpan dalam c -->
              <template v-else>
                <slot name="customRows" :content="c" v-bind="c"></slot>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div class="table-footer">
      <p v-if="localAllContent.length <= 0">Tidak ada Data.</p>
      <div v-else-if="displayPerPage === 'all'" class="flex">
        <p>Total {{ localAllContent.length }} data.</p>
        <div class="flex">
          <p>(</p>
          <select v-model="displayPerPage" class="table-count-selector text-center text-sm">
            <option v-for="(opt, i) in perPageOptions" :key="i" :value="opt" :selected="displayPerPage === opt">
              {{ opt }}
            </option>
            <option value="all" :selected="displayPerPage === 'all' || !perPageOptions.includes(displayPerPage)">
              Semua
            </option>
          </select>
          <p>per hal)</p>
        </div>
      </div>
      <p v-else-if="isError">Ada kesalahan</p>
      <template v-else>
        <!-- Display per page management -->
        <div class="inline-flex items-center gap-1">
          <!-- Refresh tabel -->
          <v-tooltip v-if="asyncTable">
            <button class="table-page-change bg-secondary" @click="refreshTable">
              <font-awesome-icon icon="arrows-rotate" class="text-white" />
            </button>
            <template #popper>
              <p class="text-sm">Muat ulang data.</p>
            </template>
          </v-tooltip>

          <!-- Data counter -->
          <p class="text-bold">{{ dataStartAt + 1 }} - {{ dataFinishedAt }} dari {{ totalData ?? 1 }}</p>

          <div>
            <v-tooltip>
              <div class="flex">
                <p>(</p>
                <select v-model="displayPerPage" class="table-count-selector text-center text-sm">
                  <option v-for="(opt, i) in perPageOptions" :key="i" :value="opt" :selected="displayPerPage === opt">
                    {{ opt }}
                  </option>
                  <option value="all" :selected="displayPerPage === 'all' || !perPageOptions.includes(displayPerPage)">
                    Semua
                  </option>
                </select>
                <p>per hal)</p>
              </div>
              <template #popper>
                <p class="text-sm">Halaman saat ini/Pilih halaman</p>
              </template>
            </v-tooltip>
          </div>
        </div>

        <!-- Page management -->
        <div class="flex items-center gap-0.5">
          <!-- First page -->
          <v-tooltip>
            <button class="table-page-change" :disabled="currentPage === 1" @click="currentPage = 1">
              <font-awesome-icon icon="angles-left" />
            </button>
            <template #popper>
              <p class="text-sm">Ke halaman awal <span v-if="currentPage !== 1">(Hal 1)</span></p>
            </template>
          </v-tooltip>

          <!-- Prev page -->
          <v-tooltip class="pl-1">
            <button class="table-page-change" :disabled="currentPage === 1" @click="currentPage--">
              <font-awesome-icon icon="angle-left" />
            </button>
            <template #popper>
              <p class="text-sm">
                Ke halaman sebelumnya <span v-if="currentPage !== 1">(Hal {{ currentPage - 1 }})</span>
              </p>
            </template>
          </v-tooltip>

          <!-- Free select page -->
          <v-tooltip>
            <select v-model="currentPage" class="table-count-selector text-center">
              <option v-for="x in mixins.arrayRange(lastPage, 1)" :key="x" :value="x" :selected="currentPage === x">
                {{ x }}
              </option>
            </select>
            <template #popper>
              <p class="text-sm">Halaman saat ini/Pilih halaman</p>
            </template>
          </v-tooltip>
          <p class="pr-1">dari {{ lastPage }}</p>

          <!-- Next page -->
          <v-tooltip>
            <button class="table-page-change" :disabled="lastPage === currentPage" @click="currentPage++">
              <font-awesome-icon icon="angle-right" />
            </button>
            <template #popper>
              <p class="text-sm">
                Ke halaman selanjutnya <span v-if="lastPage !== currentPage">(Hal {{ currentPage + 1 }})</span>
              </p>
            </template>
          </v-tooltip>

          <!-- Last page -->
          <v-tooltip>
            <button class="table-page-change" :disabled="lastPage === currentPage" @click="currentPage = lastPage">
              <font-awesome-icon icon="angles-right" />
            </button>
            <template #popper>
              <p class="text-sm">
                Ke halaman terakhir <span v-if="lastPage !== currentPage">(Hal {{ lastPage }})</span>
              </p>
            </template>
          </v-tooltip>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable vue/no-side-effects-in-computed-properties */
import { computed, onMounted, reactive, ref, useSlots, watch } from 'vue';
import { mixins } from '@/Mixins/mixinDeprecate';
import BasicButton from '@/Components/Buttons/BasicButton.vue';
import LoadingCard from '@/Components/Cards/LoadingCard.vue';

const slots = useSlots();
const props = defineProps({
  /**
   * Struktur dari headers.
   * Berisi Array of Strings atau config dari setiap kolom yang berbentuk Object dengan struktur sebagai berikut:
   * => name: String -- Label yang ditulis di header,
   * => label: String -- Key di dalam content untuk penyajian data di tabel yang presisi,
   * => sortable: Boolean -- Apakah data di tabel bisa diurutkan berdasarkan kolom ini?
   *      [Apabila value sortLogic diisi namun ini tidak, maka sortable menjadi true]
   * => sortLogic: Function -- Logika untuk melakukan sort. Harap define fungsi untuk melakukan sort secara ascending,
   * => searchable: Boolean -- Apakah data di tabel bisa difilter berdasarkan hasil pencarian kolom ini?
   *      [Apabila value searchLogic diisi namun ini tidak, maka sortable menjadi true]
   * => searchLogic: Function -- Logika yang digunakan untuk pencarian. Pastikan return merupakan string atau number.
   */
  headers: Array,
  /**
   * Isi dari table
   */
  content: {
    type: Array,
    default: () => [],
  },
  // ===== Table Attribute Purpose =====
  /**
   * Menampilkan kolom nomor di ujung kiri tabel.
   */
  withIndex: Boolean,
  /**
   * Menampilkan field search untuk melakukan filter.
   */
  withSearch: Boolean,
  // TODO: Wild search method => Bisa mencari berdasarkan isi object body dari semua key.
  // ===== Pagination Purpose =====
  /**
   * Halaman yang akan dirender pertama kali ketika tabel selesai dimuat.
   */
  startPage: {
    type: Number,
    default: 1,
  },
  /**
   * Jumlah dari semua data. Digunakan untuk merender penomoran halaman terutama mencari nomor halaman terakhir.
   * Wajib apabila table merupakan asyncTable, atau table tidak bisa merender jumlah halaman.
   */
  totalData: Number,
  /**
   * Angka untuk menampilkan berapa data yang harus ditampilkan dalam 1 halaman.
   * Harus sinkron dengan props perPageOptions agar data bisa ditampilkan dengan sempurna.
   */
  perPage: {
    type: [Number, String],
    default: 20,
  },
  /**
   * Array berisi angka pilihan untuk menampilkan berapa data yang harus ditampilkan dalam 1 halaman.
   */
  perPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 25, 50, 100, 250],
  },
  // ===== Async Table Purpose =====
  /**
   * Data yang dimasukkan ke tabel didapatkan dalam proses async.
   * Apabila true, parent component harus menghandle event get data, filter, sort, dan search yang dikirim component ini
   * melalui event manipulateTable.
   */
  asyncTable: Boolean,
  /**
   * Mengirim sinyal ke AutoTable untuk menampilkan tampilan loading.
   * Berguna ketika status data masih dalam proses penarikan dari server.
   */
  isLoading: Boolean,
  /**
   * Mengirim sinyal ke AutoTable untuk menampilkan tampilan error.
   * Berguna ketika status data gagal ditarik dari server.
   */
  isError: Boolean,
  onClickFilter: Function,
});

/**
 * Semua data yang tersimpan di local. Dalam tabel async, data yang dirender dilihat langsung dari props ini. Namun
 * apabila dalam tabel normal, variabel ini digunakan sebagai kumpulan data sebelum dipecah ke tampilan per halaman oleh
 * localContent.
 *
 * Diinisiasi oleh props content.
 * Dalam normal table, dipengaruhi oleh sorting dan filter, namun tidak page number.
 * @type {*}
 */
const localAllContent = ref(props.content);
/**
 * Jumlah data yang ditampilkan di page saat ini.
 *
 * Diinisiasi oleh props perPage, lalu nantinya dikontrol oleh component AutoTable sendiri.
 * String yang diterima hanya "all" untuk menampilkan semua data, Selain itu harus angka Number atau string angka.
 * @type {Ref<UnwrapRef<number|string>>}
 */
const displayPerPage = ref(props.perPage);
/**
 * Halaman yang ditampilkan saat ini.
 *
 * Diinisiasi oleh startPage props, lalu nantinya dikontrol oleh component AutoTable sendiri.
 * @type {Ref<UnwrapRef<number>>}
 */
const currentPage = ref(props.startPage);
/**
 * Perhitungan untuk mencari halaman terakhir.
 * Apabila async, dipengaruhi oleh props totalData. Apabila normal, dipengaruhi oleh jumlah data di localAllContent.
 * @type {ComputedRef<number>}
 */
const lastPage = computed(() => {
  if (!props.asyncTable) return Math.ceil(localAllContent.value.length / displayPerPage.value);
  if (props.totalData) return Math.ceil(props.totalData / displayPerPage.value);

  return currentPage;
});
const dataStartAt = ref(0);
const dataFinishedAt = ref(0);
/**
 * Data yang ditampilkan dalam tabel.
 *
 * Dipengaruhi oleh currentPage sebagai nomor halaman.
 * @type {ComputedRef<*>}
 */
const localContent = computed(() => {
  if (displayPerPage.value === 'all') return localAllContent.value;

  dataStartAt.value = displayPerPage.value * (currentPage.value - 1);

  if (currentPage.value === lastPage.value) {
    dataFinishedAt.value = dataStartAt.value + (localAllContent.value.length % displayPerPage.value);
    return props.asyncTable ? localAllContent.value : localAllContent.value.slice(dataStartAt.value);
  }

  dataFinishedAt.value = displayPerPage.value * currentPage.value;
  return props.asyncTable
    ? localAllContent.value
    : localAllContent.value.slice(dataStartAt.value, dataFinishedAt.value);
});

function mapHeader(item) {
  const isString = mixins.checkVarType(item) === 'string' || mixins.checkVarType(item) === 'number';

  if (isString) {
    return {
      name: item,
      label: null,
      sortable: true,
      class: '',
      sortLogic: (a, b) => a - b,
      searchable: props.withSearch,
      searchLogic: (a) => a,
    };
  }

  // For disabling function purpose.
  const emptyFunction = () => {};
  let sort;
  let search;

  if (props.asyncTable) {
    /**
     * Jika tabel merupakan async:
     * - Matikan sortLogic dan searchLogic. Karena data dikontrol dari backend.
     * - sortable dan searchable didasarkan pada apakah ada label? Label merupakan nama kolom di db atau keyword untuk
     * melakukan sort di backend. Apabila tidak ada maka false.
     */

    sort = {
      func: emptyFunction,
      able: item.label ? item.sortable ?? true : false,
    };
    const ableToSearch = item.label ? item.searchable ?? false : false;
    search = {
      func: emptyFunction,
      able: props.withSearch ? ableToSearch : false,
    };
  } else if (slots.customRows) {
    /**
     * Jika tabel tidak async namun rows yang dirender custom:
     * - Semua didasarkan pada apakah user menentukan logika untuk sorting maupun searching.
     * - Selain itu false.
     */

    sort = {
      func: item.sortLogic ?? emptyFunction,
      able: item.sortLogic ? item.sortable ?? true : false,
    };

    const ableToSearch = item.searchLogic ? item.searchable ?? true : false;
    search = {
      func: item.searchLogic ?? emptyFunction,
      able: props.withSearch ? ableToSearch : false,
    };
  } else {
    /**
     * Jika semua kondisi diatas salah:
     * - Semua didasarkan pada kontrol sortable dan searchable menggunakan logika default, namun melihat apakah ada
     * labelnya atau tidak.
     */

    const defaultSort = (a, b) => a - b;
    sort = {
      func: item.sortLogic ?? defaultSort,
      able: item.sortable && !!item.label,
    };
    const defaultSearch = (a) => a[item.label];
    search = {
      func: item.searchLogic ?? defaultSearch,
      able: item.searchable && !!item.label,
    };
  }
  return {
    name: item.name ?? '-',
    label: item.label ?? null,
    class: item.class ?? '',
    sortable: sort.able,
    sortLogic: sort.func,
    searchable: search.able,
    searchLogic: search.func,
  };
}

/**
 * Mengeneralkan semua object di array header agar memiliki semua properti yang dibutuhkan saat rendering.
 * Karena user bisa menuliskan header sebagai array of string maupun array of object namun tidak semua item dituliskan.
 */
const localHeader = computed(() => props.headers.map(mapHeader));

/**
 * Watcher apabila ada data baru, maka localAllContent akan berubah sesuai data baru.
 */
watch(
  () => props.content,
  (newVal) => {
    localAllContent.value = newVal;
  },
);

// ===== Sorting Data Purpose =====
/**
 * Variabel kontrol sort. Index merupakan index dari header, sedangkan label ya label ._.
 * @type {UnwrapNestedRefs<{asc: boolean, index: number, label: string}>}
 */
const appliedSort = reactive({
  index: -1, // -1 berarti no
  label: '',
  asc: true,
});

/**
 * Fungsi untuk menerapkan sort.
 * @param index {String|Number} index dari posisi user menekan header.
 */
function applySort(index) {
  // Apakah kolom yang dipilih bisa disort? (sortable)
  if (!localHeader.value[index].sortable) return;

  // 3 kali klik rule
  // No sort => Ascending sort => Descending sort => Release sort (-1)
  if (appliedSort.index === index) {
    if (!appliedSort.asc) {
      appliedSort.index = -1;
      appliedSort.label = '';
    } else appliedSort.asc = false;
  } else {
    appliedSort.index = index;
    appliedSort.asc = true;
    appliedSort.label = localHeader.value.map((e) => e.label)[index];
  }

  // Apabila tabel dalam mode async, berhenti disini.
  if (props.asyncTable) return;
  if (appliedSort.index === -1) {
    localAllContent.value = props.content;
    return;
  }

  localAllContent.value.sort(localHeader.value[index].sortLogic);
  if (!appliedSort.asc) localAllContent.value.reverse();
}

const searchString = ref('');
const emits = defineEmits(['manipulateTable', 'clickFilter']);

/**
 * Kirim event manipulate ke parent component.
 * @param type {String} Jenis event yang dikirim.
 */
function emitManipulate(type) {
  if (props.asyncTable) {
    const x = {
      type,
      searchProps: {
        find: searchString.value,
        searchIn: localHeader.value.filter((e) => e.searchable).map((e) => e.label),
      },
      sortProps: appliedSort,
      pageProps: {
        pos: currentPage.value,
        perPage: displayPerPage.value,
      },
    };
    emits('manipulateTable', x);
  }
}

let emitSearchTimeout;

/**
 * Listener 3 event manipulasi tabel
 */
watch(searchString, () => {
  clearTimeout(emitSearchTimeout);
  emitSearchTimeout = setTimeout(() => {
    emitManipulate('search');
  }, 750);
});
watch(appliedSort, () => {
  emitManipulate('sort');
});
watch(currentPage, () => {
  emitManipulate('page-change');
});
watch([() => props.perPage, displayPerPage], () => {
  emitManipulate('per-page-change');
});

function refreshTable() {
  emitManipulate('refresh');
}

onMounted(() => {
  emitManipulate('init');
});

defineExpose({
  refreshTable,
});
</script>

<style scoped></style>
