<template>
  <TooltipProvider v-if="tooltip">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          :type="btnType"
          class="y__btn"
          :class="[colorSet, paddingConfig, customClass]"
          :form="form"
          :disabled="disabled || onLoading"
          @click="emits('click')"
        >
          <font-awesome-icon
            v-if="icon || onLoading"
            :icon="onLoading ? 'cog' : icon"
            :class="{ 'mr-2': $slots.default }"
            :size="small ? undefined : 'lg'"
            :spin="onLoading"
          />
          <slot />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p class="text-xs">{{ tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <button
    v-else
    :type="btnType"
    class="y__btn"
    :class="[colorSet, paddingConfig, customClass]"
    :form="form"
    :disabled="disabled || onLoading"
    @click="emits('click')"
  >
    <font-awesome-icon
      v-if="icon || onLoading"
      :icon="onLoading ? 'cog' : icon"
      :class="{ 'mr-2': $slots.default }"
      :size="small ? undefined : 'lg'"
      :spin="onLoading"
    />
    <slot />
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';

const emits = defineEmits(['click'])

const props = defineProps({
  /**
   * Rubah button sebagai tombol submit dari form.
   * Note: Apabila ini didefinisi, maka component akan mengabaikan prop type.
   * Default: False
   */
  asSubmit: {
    type: Boolean,
    default: false,
  },
  /**
   * Warna dari button
   * Default: Blue
   * Possible options: red, white, blue, green, purple, <define it yourself>
   */
  color: {
    type: String,
    default: 'secondary',
  },
  small: Boolean,

  /**
   * Class kalau mau merubah.
   * Default: ''
   */
  customClass: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Maksimalkan ukuran button (Hanya berlaku ketika tombol hanya mengandung icon)
   * Default: false
   */
  expanded: {
    type: Boolean,
    default: false,
  },
  /**
   * Icon di sebelah kiri tulisan di dalam button
   * Note: Apabila tidak ada props ini maka tag icon tidak akan di render
   * Default: null
   */
  icon: {
    type: [String, Array, Object],
    required: false,
  },
  /**
   * Menampilkan tooltip apabila dihover
   */
  tooltip: String,
  /**
   * Tipe dari button sesuai standar html
   * Default: Button
   * Possible options: button, submit
   */
  type: {
    type: String,
    default: 'button',
  },
  onLoading: Boolean,
  form: String,
});
const slots = useSlots();

/**
 * Konfigurasi tipe dari button. Didahulukan nilai dari asSubmit.
 * @return {string}
 */
const btnType = computed(() => {
  if (props.asSubmit) return 'submit';
  return props.type;
});

/**
 * Pengaturan warna berdasar props color
 * @return {String|string}
 */
const colorSet = computed(() => mixins.buttonColorSet(props.color));

/**
 * Mengatur padding dari button sesuai apakah ada isi atau hanya icon saja
 * @return {string}
 */
const paddingConfig = computed(() => mixins.buttonPaddingConfig(!!slots.default, props.expanded, props.small));
</script>

<style scoped></style>
