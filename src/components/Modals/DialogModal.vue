<template>
  <modal-foundation :show="show" :max-width="maxWidth" :closeable="closeable" @close="close">
    <div class="relative">
      <!-- Bagian Atas -->
      <div class="stretch-flex relative">
        <div class="modal-top">
          <h2 class="modal-title-heading"><slot name="title" /></h2>
        </div>

        <div class="modal-top-btn">
          <button v-if="closeable" class="btn-modal-close" @click="close">
            <font-awesome-icon icon="times" size="lg" />
          </button>
        </div>
      </div>

      <div class="modal-content">
        <div>
          <p v-if="hasSubtitle" class="italic text-subtitle text-xs"><slot name="subtitle" /></p>
        </div>

        <!-- Isi dari modal -->
        <div>
          <slot name="content"> </slot>
        </div>
      </div>

      <!-- Bagian bawah -->
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </modal-foundation>
</template>

<script setup>
import { useSlots } from 'vue';
import ModalFoundation from '@/Components/Modals/Core/ModalFoundation.vue';

defineProps({
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
});
const emits = defineEmits(['close']);
const slots = useSlots();

function close() {
  emits('close');
}
function hasSubtitle() {
  return !!slots.subtitle;
}
</script>
