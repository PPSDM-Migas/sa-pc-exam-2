<script setup>
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

defineProps({
  icon: [String, Object],
  iconCss: { type: String, default: 'text-gray-700' },
  href: String,
  active: Boolean,
  count: [Number, String],
});

const emit = defineEmits(['clickEvent']);
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div style="margin: 0" class="z-1" @click="emit('clickEvent')">
          <div class="navbar-btn" :class="{ active: active }">
            <div class="relative">
              <font-awesome-icon :class="iconCss" :icon="icon" size="lg" />
              <span v-if="count" class="absolute -top-1.5 -right-1.5 rounded-full bg-red-700 px-1 text-[10px]">{{
                count
              }}</span>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div class="text-xs">
          <slot name="tooltip" />
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
