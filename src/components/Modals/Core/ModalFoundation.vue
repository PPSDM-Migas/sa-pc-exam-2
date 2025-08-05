<template>
  <teleport to="body">
    <transition leave-active-class="duration-200">
      <div v-show="show" class="modal-display" scroll-region>
        <transition
          :enter-active-class="`ease-out duration-${faster ? 300 : 100}`"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-show="show" class="fixed inset-0 transform transition-all" @click="close">
            <div class="modal-overlay"></div>
          </div>
        </transition>

        <transition
          :enter-active-class="`ease-out duration-${faster ? 300 : 100}`"
          enter-from-class="opacity-0 -translate-y-8"
          :enter-to-class="`opacity-100 translate-y-0 ${faster ? 'bounce' : ''}`"
          leave-active-class="transition ease-in duration-300"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-8"
        >
          <div v-show="show" class="modal-container" :class="maxWidthClass">
            <slot v-if="show"></slot>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';

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
  faster: Boolean,
});
const emits = defineEmits(['close']);

const close = () => {
  if (props.closeable) {
    emits('close');
  }
};

const closeOnEscape = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));

// eslint-disable-next-line arrow-body-style
const maxWidthClass = computed(() => {
  return {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
  }[props.maxWidth];
});

watch(
  () => props.show,
  () => {
    if (props.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = null;
    }
  },
  { immediate: true },
);
</script>
