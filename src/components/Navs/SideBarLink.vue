<template>
  <div>
    <div v-if="category && !child" class="navbar-title">
      {{ category }}
    </div>

    <Link v-else-if="!child && !category" class="sidebar" :href="href" :class="{ active: isActive }">
      <div class="icon-container">
        <div class="icon">
          <font-awesome-icon :icon="icon" size="lg" />
        </div>
      </div>
      <div class="p-2">
        <slot />
      </div>
    </Link>

    <Disclosure v-else v-slot="{ open }" :default-open="hasActiveClass" as="div">
      <DisclosureButton
        class="sidebar"
        :class="[hasActiveClass ? 'parent-active' : '', open ? 'bg-white/50 dark:bg-light-alt/50' : '']"
        as="div"
      >
        <div class="icon-container">
          <div class="icon">
            <font-awesome-icon :icon="icon" size="lg" />
          </div>
        </div>
        <div class="p-2">
          <slot />
        </div>
        <div class="all-center">
          <div class="h-4 w-4 bg-ternary all-center rounded-full text-white">
            <font-awesome-icon icon="angle-down" :class="open ? 'rotate-180' : ''" size="sm" />
          </div>
        </div>
      </DisclosureButton>

      <TransitionRoot
        :show="open"
        enter="transition-transform duration-300"
        enter-from="transform translate-x-full"
        enter-to="transform translate-x-0"
        leave="transition-transform duration-300"
        leave-from="transform translate-x-0"
        leave-to="transform -translate-x-full"
      >
        <DisclosurePanel
          as="div"
          class="mt-1.5 mx-3 rounded-lg"
          :class="open ? 'bg-white/50 dark:bg-light-alt/50' : ''"
        >
          <transition-group
            class="grid grid-cols-1 gap-2"
            tag="div"
            :appear="open"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
          >
            <Link
              v-for="(c, i) in child"
              :key="i"
              :data-index="i"
              :href="c.href"
              class="sidebar child"
              :class="{ active: c.isActive }"
            >
              <div class="icon-container">
                <div class="icon">
                  <font-awesome-icon :icon="c.icon" />
                </div>
              </div>
              <div class="p-2">
                {{ c.text }}
              </div>
            </Link>
          </transition-group>
        </DisclosurePanel>
      </TransitionRoot>
    </Disclosure>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import { Disclosure, DisclosureButton, DisclosurePanel, TransitionRoot } from '@headlessui/vue';
import gsap from 'gsap';

const props = defineProps({
  icon: [Array, String, Object],
  href: String,
  isActive: Boolean,
  child: Array,
  category: String,
});

const hasActiveClass = ref(false);
if (props.child) {
  props.child.forEach((sub) => {
    if (sub.isActive) {
      hasActiveClass.value = true;
    }
  });
}

function onBeforeEnter(el) {
  // eslint-disable-next-line no-param-reassign
  el.style.opacity = 0;
}

function onEnter(el, done) {
  gsap.to(el, {
    y: 0,
    opacity: 1,
    height: 'auto',
    delay: el.dataset.index * 0.05,
    duration: 0.2,
    startAt: {
      y: -30,
    },
    onComplete: done,
  });
}
</script>
