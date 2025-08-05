<template>
  <div class="banner-wrapper">
    <div class="banners">
      <TransitionGroup name="toast" tag="div">
        <the-toast
          v-for="(mail, m) in mailQueue"
          :id="m"
          :key="m"
          :message="mail.content"
          :banner-type="mail.type"
          :duration="mail.duration"
          :delay="mail.delay"
          :title="mail.title"
          @close="handleClose"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import TheToast from '@/Components/Toasts/TheToast.vue';
import { computed, onMounted, reactive, watch } from 'vue';
import { mixins } from '@/assets/js/Mixins/mixinDeprecate';

/**
 * Pesan didalam banner
 * @return {boolean|string|((commentsFile: string) => string)|string}
 */
const message = computed(() => '');

const mailQueue = reactive({});
let x = 1;
function pushIntoQueue(content, id = null) {
  const fillQueue = (val, i = null) => {
    mailQueue[i ?? `${Date.now()}-${x++}`] = {
      content: val.content,
      type: val.type ?? 'info',
      duration: val.duration ?? 5,
      delay: val.delay ?? 0,
      title: val.title ?? 'Info',
    };
  };
  if (content) {
    if (mixins.checkVarType(content) === 'array') {
      content.forEach((v, i) => {
        if (v.content) fillQueue(v, id ? `${id}-${i}` : `${Date.now()}-${x++}-${i}`);
        else fillQueue({ content: v }, id ? `${id}-${i}` : `${Date.now()}-${x++}-${i}`);
      });
    } else {
      fillQueue(mixins.checkVarType(content) === 'object' ? content : { content }, id);
    }
  }
}

defineExpose({
  pushIntoQueue,
});

onMounted(() => {
  if (message.value) {
    pushIntoQueue(message.value);
  }
});
watch(message, (newVal) => {
  if (newVal.content) pushIntoQueue(newVal);
});

function handleClose(targetId) {
  delete mailQueue[targetId];
}
</script>

<style scoped>
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-30px) translateY(-60px);
}

.toast-leave-active {
  position: absolute;
  z-index: 1;
}
</style>
