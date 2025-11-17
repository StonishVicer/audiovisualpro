<template>
  <div :class="['flex mb-4', { 'justify-end': isClientMessage }]">
    <div :class="[
      'max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-white shadow-md',
      isClientMessage 
        ? 'bg-green-600 rounded-br-none' 
        : 'bg-gray-700 rounded-tl-none'
    ]">
      <p class="text-sm break-words">{{ message.text }}</p>
      <span class="block text-xs text-right opacity-80 mt-1">{{ message.time }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const isClientMessage = computed(() => props.message.author === 'client');
</script>