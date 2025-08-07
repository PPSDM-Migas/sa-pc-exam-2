<template>
  <confirmation-modal
    use-img="/storage/svg/Trash.svg"
    icon-color="bg-red-400"
    :show="controlVariable.displayStatus()"
    :closeable="controlVariable.disableStatus()"
    @close="controlVariable.allFalse()"
  >
    <template #title>
      <template v-if="$slots.title">
        <slot name="title" />
      </template>
      <template v-else>Konfirmasi Menghapus {{ title }}</template>
    </template>
    <template #content>
      <template v-if="$slots.default">
        <slot />
      </template>
      <p v-else>
        Apakah anda yakin untuk menghapus <span class="red-mark">{{ name }}</span
        >?
      </p>
    </template>
    <template #footer>
      <basic-button icon="times-circle" color="green" @click="controlVariable.allFalse()">Tidak Jadi</basic-button>
      <basic-button icon="trash-alt" color="red" @click="deleteEvent">Iya, Hapus</basic-button>
    </template>
  </confirmation-modal>
</template>

<script setup>
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';

const props = defineProps({
  /**
   * Gunakan Object dari Class FormModalTemplate yang setidaknya berisi object yang key dan valuenya
   */
  controlVariable: {
    type: Object,
    required: true,
  },
  deleteRoute: String,
  title: String,
  name: String,
  keyToDelete: {
    type: String,
    default: 'id',
  },
  additionalParam: {
    type: Object,
    default: () => ({}),
  },
});

function deleteEvent() {
  const deleteParam = { ...props.additionalParam };
  deleteParam[props.keyToDelete] = props.controlVariable.getForm(props.keyToDelete);
  props.controlVariable.defaultDeleteEvent(props.deleteRoute, deleteParam);
}
</script>

<style scoped></style>
