<template>
  <modal-foundation :show="show" :max-width="maxWidth" :closeable="closeable" faster @close="close">
    <div class="relative">
      <div class="absolute top-0 left-0 z-10 flex w-full justify-center">
        <div v-if="checkAnyIcon" class="w-40 h-40 rounded-2xl all-center" :class="[iconColor]">
          <font-awesome-icon
            v-if="useFa"
            :icon="pickFaIcon()"
            :size="mixins.checkVarType(useImg) === 'array' ? useFa[1] ?? '6x' : '6x'"
          />
          <img
            v-else-if="useImg"
            :src="mixins.checkVarType(useImg) === 'array' ? useImg[0] : useImg"
            :alt="mixins.checkVarType(useImg) === 'array' ? useImg[1] ?? 'icon' : 'icon'"
            :class="mixins.checkVarType(useImg) === 'array' ? useImg[1] ?? 'w-36' : 'w-36'"
          />
        </div>
      </div>
      <div class="absolute w-full">
        <div class="modal-content rounded-t-lg text-center" :class="{ 'mt-20': checkAnyIcon }">
          <h2 class="mb-2" :class="{ 'mt-20': checkAnyIcon }"><slot name="title" /></h2>
          <!-- Isi dari modal -->
          <div>
            <slot name="content"> </slot>
          </div>
        </div>

        <!-- Bagian bawah -->
        <div class="modal-footer center">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </modal-foundation>
</template>

<script setup>
import { computed } from 'vue';
import ModalFoundation from '@/components/Modals/Core/ModalFoundation.vue';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: '2xl',
  },
  closeable: {
    type: Boolean,
    default: true,
  },
  /**
   * Use Font Awesome icon. There is 2 way to define:
   * Use String => iconName
   * Use Array => [iconName, size?]
   */
  useFa: {
    type: [String, Array, Object],
    validator(prop) {
      if (prop instanceof Array) return prop.length === 1 || prop.length === 2;
      return ['Object', 'object', 'string'].includes(typeof prop);
    },
  },
  /**
   * Image source path. There is 2 way to define:
   * Use String => path
   * Use Array => [path, class? (opt), altText? (opt)]
   */
  useImg: {
    type: [String, Array],
    validator(prop) {
      if (prop instanceof Array) return prop.length > 0 && prop.length <= 3;
      return typeof prop === 'string';
    },
  },
  iconColor: {
    type: String,
    default: 'bg-secondary text-white',
  },
});
const emits = defineEmits(['close']);

const checkAnyIcon = computed(() => props.useFa || props.useImg);

function close() {
  emits('close');
}

function pickFaIcon() {
  return (
    {
      array: props.useFa[0],
      string: props.useFa,
      object: props.useFa,
    }[mixins.checkVarType(props.useFa)] ?? 'info'
  );
}
</script>

<style scoped></style>
