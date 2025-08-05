<template>
  <basic-button
    :disabled="controlVariable ? controlVariable.disableStatus() : false"
    color="red"
    :icon="closeIcon"
    @click="closeFunc"
    >{{ closeText }}</basic-button
  >
  <basic-button
    :disabled="controlVariable ? controlVariable.disableStatus() : false"
    color="green"
    :icon="submitIcon"
    :as-submit="!submitFunc"
    :form="form"
    >{{ submitText }}</basic-button
  >
</template>

<script setup>
import BasicButton from '@/Components/Buttons/BasicButton.vue';

defineProps({
  controlVariable: Object,
  form: String,
  closeFunc: Function,
  submitFunc: Function,
  closeText: {
    type: String,
    default: 'Tidak Jadi',
  },
  submitText: {
    type: String,
    default: 'Kirim Data',
  },
  closeIcon: {
    type: String,
    default: 'times-circle',
  },
  submitIcon: {
    type: String,
    default: 'paper-plane',
  },
});
</script>

<style scoped></style>
