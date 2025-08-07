<template>
    <modal-foundation :show="show" :max-width="maxWidth" :closeable="closeable" @close="close">
        <!-- Bagian Atas -->

        <div class="modal-content mx-16">
            <div class="py-3 px-10 flex justify-center flex-col">

                <h2 class="modal-title-heading my-5 text-center">
                    <slot name="title"></slot>
                </h2>
                <div class="my-5 flex justify-center items-center">
                    <slot name="image"></slot>
                </div>
                <div class="my-5 w-full">
                    <slot name="description"></slot>
                </div>

                <!-- Isi dari modal -->
                <div class="flex justify-center my-5">
                    <slot name="close-btn"> </slot>
                </div>
            </div>
        </div>

        <!-- Bagian bawah -->

    </modal-foundation>
</template>

<script setup>
import ModalFoundation from '@/components/Modals/Core/ModalFoundation.vue';

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

function close() {
    emits('close');
}
</script>
