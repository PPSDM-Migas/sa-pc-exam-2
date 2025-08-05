<script setup>
import BasicCard from '@/Components/Cards/BasicCard.vue';
import BasicButton from '@/Components/Buttons/BasicButton.vue';
import { computed, ref, watchEffect } from 'vue';
import AnchorButton from '@/Components/Buttons/AnchorButton.vue';

const props = defineProps({
  modelValue: {
    type: File,
    default: () => null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  accepts: {
    type: [Array, String],
    default: () => ['image/jpeg', 'image/png', 'image/jpg'],
  },
  maxSize: [Number, String],
  label: String,
});

const emit = defineEmits(['update:modelValue']);

const valueFile = ref(null);
const valuePreview = ref('');
const valueIsImage = ref(false);
const valueIsPdf = ref(false);
const fileInp = ref('');
const cardError = ref('');

function uploadStudentCard() {
  fileInp.value.click();
}

function sizeStringToBytes(sizeString, withSuffix = false) {
  const sizeMatch = sizeString.match(/^(\d+(?:\.\d+)?)([a-z]*)$/);
  if (!sizeMatch) {
    throw new Error('Invalid size string');
  }

  const [, size, suffix] = sizeMatch;
  const suffixes = {
    b: 1,
    kb: 1024 ** 1,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
    pb: 1024 ** 5,
    eb: 1024 ** 6,
    zb: 1024 ** 7,
    yb: 1024 ** 8,
  };

  const multiplier = suffixes[suffix] || 1;
  return withSuffix ? [parseFloat(size) * multiplier, size, suffix] : parseFloat(size) * multiplier;
}

const sizeLimit = computed(() => {
  if (!props.maxSize) return 0;

  const sizeString = props.maxSize.trim().toLowerCase();
  return sizeStringToBytes(sizeString);
});

// Refactored normalizeByteSize function
function sizeInString() {
  const [byte, num, unit] = sizeStringToBytes(props.maxSize, true);

  const bracket = byte < 1024 ? `${byte.toLocaleString('id-ID')} Byte` : `${(byte / 1024).toLocaleString('id-ID')} KB`;

  // Format the output string with correct capitalization
  return `${num} ${unit.toUpperCase()} (${bracket})`;
}

function deleteImg() {
  valueFile.value = null;
  valuePreview.value = '';
  cardError.value = '';
}

const uploadFile = (event) => {
  deleteImg();

  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    if (!props.accepts.includes(file.type)) {
      reader.abort();
      cardError.value = 'Maaf format file salah :(';
      return;
    }

    if (sizeLimit.value > 0 && file.size >= sizeLimit.value) {
      reader.abort();
      cardError.value = 'Maaf ukuran file terlalu besar :(';
      return;
    }

    valueIsImage.value = file.type.startsWith('image/');
    valueIsPdf.value = file.type.startsWith('application/pdf');

    valueFile.value = file;
    valuePreview.value = e.target.result;
    emit('update:modelValue', file);
  };

  reader.readAsDataURL(file);
};

const getAcceptedFormats = () => {
  // Mapping MIME types or patterns to human-readable format descriptions
  const formatMap = {
    'image/jpeg': '.jpeg',
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/heic': '.heic',
    'image/*': 'gambar semua format',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogg',
    'video/*': 'video semua format',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  };

  // Initialize an empty array to hold the format descriptions
  const acceptedFormats = [];

  // Iterate over the input array
  props.accepts.forEach((type) => {
    // Check if the type is in the mapping object
    if (formatMap[type]) {
      // Add the corresponding format description to the array
      acceptedFormats.push(formatMap[type]);
    }
  });

  // Join the format descriptions with commas
  return acceptedFormats.length > 0 ? `Hanya menerima format ${acceptedFormats.join(', ')}` : '._.';
};

const uploadedFileName = computed(() => {
  return valueFile.value ? valueFile.value.name : null;
});

watchEffect(() => {
  if (props.modelValue) {
    const mv = props.modelValue;

    // Assuming props.modelValue is a File object
    valueFile.value = mv;

    valueIsImage.value = mv.type.startsWith('image/');
    valueIsPdf.value = mv.type.startsWith('application/pdf');
    if (valueIsImage.value || valueIsPdf.value) {
      valuePreview.value = URL.createObjectURL(mv);
    }
  }
});
</script>

<template>
  <BasicCard class="mb-2">
    <div class="stretch-flex sm-col gap-2">
      <div>
        <input ref="fileInp" type="file" :accept="accepts.join(', ')" class="hidden" @change="uploadFile" />
        <div v-if="required" class="flex items-center gap-2 text-red-500 text-xs mb-1">
          <font-awesome-icon icon="triangle-exclamation" size="md" class="" />

          Wajib Dilampirkan
        </div>
        <p class="text-sm font-bold">{{ label }}</p>
        <p class="text-xs italic">{{ getAcceptedFormats() }}</p>
        <p v-if="maxSize" class="text-xs italic">Ukuran maksimal {{ sizeInString() }}</p>
        <div class="my-2 btn-group">
          <BasicButton icon="file-arrow-up" @click="uploadStudentCard()">
            {{ valueFile ? 'Ganti' : 'Unggah' }}
          </BasicButton>
          <basic-button v-if="valueFile" icon="trash-alt" color="red" @click="deleteImg()">Hapus </basic-button>
        </div>
        <div v-if="uploadedFileName">
          <p>{{ uploadedFileName  }}</p>
        </div>
        <p v-if="cardError" class="text-xs italic text-red-500">
          {{ cardError }}
        </p>
      </div>
      <div>
        <template v-if="valuePreview">
          <img v-if="valueIsImage" :src="valuePreview" alt="Uploaded image" class="h-20 max-w-md" />
          <AnchorButton v-else-if="valueIsPdf" target="_blank" :href="valuePreview" icon="eye" />
          <font-awesome-icon v-else icon="file" size="3x" />
        </template>
      </div>
    </div>
  </BasicCard>
</template>

<style scoped></style>
