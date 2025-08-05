<script setup>
import { computed, reactive, watch } from 'vue';
import FormSelect from '@/Components/Forms/FormSelect.vue';

const props = defineProps({
  level: {
    type: [String, Number],
    default: 4,
  },
  prefix: String,
  suffix: String,
  formOnly: {
    type: String,
    validator: (val) => !val || ['prov', 'kab', 'kec', 'kel'].includes(val),
    default: '',
  },
  modelValue: {
    type: [Number, Array, String],
    default: '',
  },
  required: Boolean,
  returnSingle: {
    type: String,
    validator: (val) => !val || ['prov', 'kab', 'kec', 'kel'].includes(val),
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const prefixStr = computed(() => (props.prefix ? `${props.prefix} ` : ''));
const suffixStr = computed(() => (props.suffix ? ` ${props.suffix}` : ''));

const vModel = reactive({
  province: '',
  regency: '',
  district: '',
  village: '',
});

const emitValue = () => {
  const map = {
    prov: vModel.province,
    kab: vModel.regency,
    kec: vModel.district,
    kel: vModel.village,
  };

  if (props.formOnly) {
    emit('update:modelValue', map[props.formOnly]);
  } else if (props.returnSingle) {
    emit('update:modelValue', map[props.returnSingle]);
  } else {
    emit(
      'update:modelValue',
      [vModel.province, vModel.regency, vModel.district, vModel.village].splice(0, props.level),
    );
  }
};

const updateVModel = () => {
  if (typeof props.modelValue === 'number' || typeof props.modelValue === 'string') {
    if (props.formOnly === null) {
      vModel.province = props.modelValue;
    } else {
      const map = {
        prov: 'province',
        kab: 'regency',
        kec: 'district',
        kel: 'village',
      };
      const key = map[props.formOnly];
      if (key) {
        vModel[key] = props.modelValue;
      }
    }
  } else if (Array.isArray(props.modelValue)) {
    const keys = Object.keys(vModel);
    props.modelValue.forEach((value, index) => {
      if (index < keys.length) {
        vModel[keys[index]] = value;
      }
    });
  }
};

// Watch for changes in vModel and emit value
watch(() => props.modelValue, updateVModel, { immediate: true });

// Watching for changes in vModel.province
watch(
  () => vModel.province,
  () => {
    vModel.regency = '';
    vModel.district = '';
    vModel.village = '';
  },
);

// Watching for changes in vModel.regency
watch(
  () => vModel.regency,
  () => {
    vModel.district = '';
    vModel.village = '';
  },
);

// Watching for changes in vModel.district
watch(
  () => vModel.district,
  () => {
    vModel.village = '';
  },
);
</script>

<template>
  <FormSelect
    v-if="['', 'prov'].includes(formOnly)"
    :id="`${prefix}-prov`"
    v-model="vModel.province"
    :async-url="route('api.loc.province', { unlimited: 1 })"
    async-param-key="filter"
    :label="`${prefixStr}Provinsi${suffixStr}`"
    option-key="id"
    option-label="name"
    :required="required"
    @update:model-value="emitValue"
  >
    <template v-if="!vModel.province && level >= 2 && formOnly === ''" #description>
      Pilih Provinsi terlebih dahulu untuk memunculkan form Kabupaten.
    </template>
  </FormSelect>
  <FormSelect
    v-if="(vModel.province && level >= 2) || formOnly === 'kab'"
    :id="`${prefix}-reg`"
    v-model="vModel.regency"
    :async-url="route('api.loc.regency', { provId: vModel.province ?? null })"
    async-param-key="filter"
    :label="`${prefixStr}Kabupaten${suffixStr}`"
    option-key="id"
    option-label="name"
    :required="required"
    @update:model-value="emitValue"
  >
    <template v-if="!vModel.regency && level >= 3 && formOnly === ''" #description>
      Pilih Kabupaten terlebih dahulu untuk memunculkan form Kecamatan.
    </template>
  </FormSelect>
  <FormSelect
    v-if="(vModel.regency && level >= 3) || formOnly === 'kec'"
    :id="`${prefix}-dis`"
    v-model="vModel.district"
    :async-url="route('api.loc.district', { kabId: vModel.regency ?? null })"
    async-param-key="filter"
    :label="`${prefixStr}Kecamatan${suffixStr}`"
    option-key="id"
    option-label="name"
    :required="required"
    @update:model-value="emitValue"
  >
    <template v-if="!vModel.district && level >= 4 && formOnly === ''" #description>
      Pilih Kecamatan terlebih dahulu untuk memunculkan form Kelurahan.
    </template>
  </FormSelect>
  <FormSelect
    v-if="(vModel.district && level === 4) || formOnly === 'kel'"
    :id="`${prefix}-vil`"
    v-model="vModel.village"
    :async-url="route('api.loc.village', { kecId: vModel.district ?? null })"
    async-param-key="filter"
    :label="`${prefixStr}Kelurahan${suffixStr}`"
    option-key="id"
    option-label="name"
    :required="required"
    @update:model-value="emitValue"
  />
</template>

<style scoped></style>
