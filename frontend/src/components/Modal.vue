<script setup>
import { ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue';

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Titulo'
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)

watch(() => visible.value, (val) => {
  if (!val) emit('close')
})

onMounted(() => {
  visible.value = true
})

const closeModal = () => {
  visible.value = false
  setTimeout(() => emit('close'), 300)
}

const closeModalOnBackdrop = (e) => {
  if (e.target === e.currentTarget) {
    closeModal()
  }
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      @click="closeModalOnBackdrop"
      class="fixed inset-0 flex items-center justify-center bg-green-100/25 backdrop-blur-sm z-50"
    >
      <transition name="scale">
        <div
          v-if="visible"
          class="bg-white border border-green-100 p-6 rounded-2xl shadow-lg w-96 transform transition-transform"
        >
          <div class="flex justify-between items-center mb-3 border-b border-gray-200 pb-3">
            <h2 class="text-xl font-bold text-black">{{ title }}</h2>
            <button @click="closeModal" class="text-white bg-red-500 p-1 rounded-lg hover:bg-red-600 transition-colors">
              <Icon icon="mdi:close" width="24" height="24" />
            </button>
          </div>
          <slot />
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}
.scale-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.scale-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
