<template>
  <TooltipProvider v-if="tooltip">
    <Tooltip>
      <TooltipTrigger as-child>
        <a v-if="!disabled" class="y__btn" :class="[colorSet, paddingConfig]" :href="href" :target="target">
          <font-awesome-icon
            v-if="icon || onLoading"
            :icon="onLoading ? 'cog' : icon"
            :class="{ 'mr-2': $slots.default }"
            :size="small ? undefined : 'lg'"
            :spin="onLoading"
          />
          <slot />
        </a>
        <button v-else class="y__btn" :class="[colorSet, paddingConfig]" disabled>
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

  <template v-else>
    <a v-if="!disabled" class="y__btn" :class="[colorSet, paddingConfig]" :href="href" :target="target">
      <font-awesome-icon
        v-if="icon || onLoading"
        :icon="onLoading ? 'cog' : icon"
        :class="{ 'mr-2': $slots.default }"
        :size="small ? undefined : 'lg'"
        :spin="onLoading"
      />
      <slot />
    </a>
    <button v-else class="y__btn" :class="[colorSet, paddingConfig]" disabled>
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
</template>

<script setup>
import { computed, useSlots } from 'vue';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip/index.js";

const props = defineProps({
  /**
   * Warna dari button
   * Default: Blue
   * Possible options: red, white, blue, green, purple, <define it yourself>
   */
  color: {
    type: String,
    default: 'secondary',
  },
  /**
   * Menonaktifkan tombol.
   * Tapi karena inertia-link itu bentuknya <a> maka diakali dengan merubahnya menjadi button.
   */
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
   * Menghubungkan dengan form sebagai tombol submit
   * Default: null
   */
  form: String,
  href: {
    type: [String, Object, Function],
    required: true,
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
   * Aksi yang dilakukan
   * Default: _blank
   * Possible options: button, submit
   */
  target: {
    type: String,
    default: '_blank',
  },
  /**
   * Menampilkan tooltip apabila dihover
   */
  tooltip: String,
  small: Boolean,
  onLoading: Boolean,
});
const slots = useSlots();
/**
 * Pengaturan warna berdasar props color
 * @return {String|string}
 */
const colorSet = computed(() => mixins.buttonColorSet(props.color));

/**
 * Mengatur padding dari button sesuai apakah ada isi atau hanya icon saja
 * @return {string}
 */
const paddingConfig = computed(() => mixins.buttonPaddingConfig(!!slots.default, props.expanded));
</script>
