<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { saToast } from '@bpmlib/vue-satoast';
import BasicCard from '@/components/Cards/BasicCard.vue';
import BasicButton from '@/components/Buttons/BasicButton.vue';
import FormSwitch from '@/components/Forms/FormSwitch.vue';

const emit = defineEmits<{
  agree: [];
  back: [];
}>();

const { t } = useI18n();

const agreed = ref<boolean>(false);

const onNext = () => {
  if (!agreed.value) {
    saToast.error(t('cameraAgree.mustAgree'));
    return;
  }
  emit('agree');
};
</script>

<template>
  <BasicCard header-color="secondary">
    <template #header>
      <p class="text-center font-extrabold">{{ t('cameraAgree.title') }}</p>
    </template>

    <div>
      <p class="mb-2">{{ t('cameraAgree.preamble') }}</p>
      <ol class="pl-8 list-decimal mb-2">
        <li>{{ t('cameraAgree.p1') }}</li>
        <li>{{ t('cameraAgree.p2') }}</li>
        <li>{{ t('cameraAgree.p3') }}</li>
        <li>{{ t('cameraAgree.p4') }}</li>
        <li>{{ t('cameraAgree.p5') }}</li>
        <li>{{ t('cameraAgree.p6') }}</li>
        <li>{{ t('cameraAgree.p7') }}</li>
        <li class="font-extrabold text-red-500">{{ t('cameraAgree.p8') }}</li>
        <li>{{ t('cameraAgree.p9') }}</li>
        <li>{{ t('cameraAgree.p10') }}</li>
      </ol>
    </div>
  </BasicCard>

  <BasicCard>
    <FormSwitch v-model="agreed" :label="t('cameraAgree.switchLabel')" />

    <div class="flex gap-2 mt-3">
      <BasicButton icon="times-circle" expanded color="red" @click="emit('back')">
        {{ t('cameraAgree.wrong') }}
      </BasicButton>
      <BasicButton v-if="agreed" icon="save" expanded color="green" @click="onNext">
        {{ t('cameraAgree.next') }}
      </BasicButton>
    </div>
  </BasicCard>
</template>

<style scoped></style>
