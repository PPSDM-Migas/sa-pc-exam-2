<script setup>

import {reactive, ref} from 'vue';
import FormTextarea from '@/components/Forms/FormTextarea.vue';
import BasicButton from "@/components/Buttons/BasicButton.vue";
import DialogModal from "@/components/Modals/DialogModal.vue";

const modalControl = ref(false);
const expression = ref('');
let result = ref(0);

function appendNumber(number) {
  if (expression.value === '' && number === '0') {
    return;
  }

  expression.value += number;

}

function calculate() {

  if(expression.value === '') {
    return;
  }

  try {
    result.value = eval(expression.value);
  } catch (e) {
    result.value = 'Error';
  }

  expression.value = result.value;
}

function cleanAll() {
  expression.value = '';
  result.value = 0;
}

function deleteLast() {
  if(expression.value.length === 1) {
    expression.value = '';
  } else {
    expression.value = expression.value.slice(0, -1);
  }
}

function toggleSign() {
  if (expression.value === '' || ['+', '-', '*', '/', '%'].includes(expression.value.slice(-1))) {
    return;
  }

  if (expression.value.startsWith('-')) {
    expression.value = Math.abs(eval(expression.value)).toString();
  } else {
    expression.value = '-(' + expression.value + ')';
  }

  calculate();

}

function percentage() {
  expression.value = eval(expression.value) / 100;
  calculate();
}

</script>

<template>
  <div>
    <div class="all-center w-full">
      <div class="grid grid-cols-1 gap-2">
        <textarea id="form" class="text-ld bg-white dark:bg-gray-700" v-model="expression"></textarea>

        <div class="flex gap-2">
          <div class="calc-btn" @click="cleanAll">CA</div>
          <div class="calc-btn" @click="percentage">&percnt;</div>
          <div class="calc-btn" @click="appendNumber('/')">&divide;</div>
          <div class="calc-btn" @click="deleteLast">&lArr;</div>
        </div>

        <div class="flex gap-2">
          <div class="calc-btn" @click="appendNumber(7)">7</div>
          <div class="calc-btn" @click="appendNumber(8)">8</div>
          <div class="calc-btn" @click="appendNumber(9)">9</div>
          <div class="calc-btn" @click="appendNumber('*')">&times;</div>
        </div>

        <div class="flex gap-2">
          <div class="calc-btn" @click="appendNumber(4)">4</div>
          <div class="calc-btn" @click="appendNumber(5)">5</div>
          <div class="calc-btn" @click="appendNumber(6)">6</div>
          <div class="calc-btn" @click="appendNumber('-')">&minus;</div>
        </div>

        <div class="flex gap-2">
          <div class="calc-btn" @click="appendNumber(1)">1</div>
          <div class="calc-btn" @click="appendNumber(2)">2</div>
          <div class="calc-btn" @click="appendNumber(3)">3</div>
          <div class="calc-btn" @click="appendNumber('+')">&plus;</div>
        </div>

        <div class="flex gap-2">
          <div class="calc-btn" @click="toggleSign">+/-</div>
          <div class="calc-btn" @click="appendNumber(0)">0</div>
          <div class="calc-btn" @click="appendNumber('.')">,</div>
          <div class="calc-btn" @click="calculate">&equals;</div>
        </div>
      </div>
    </div>
  </div>
</template>
