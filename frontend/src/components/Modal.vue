<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Titulo'
  },
  size: {
    type: String,
    default: 'md'
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)

const maxWidthClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'max-w-md'
        case 'lg': return 'max-w-4xl'
        case 'xl': return 'max-w-6xl'
        default: return 'max-w-2xl'
    }
})

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
      class="fixed inset-0 flex items-center justify-center bg-green-900/40 backdrop-blur-sm z-50 p-4" 
    >
        <transition name="scale">
        <div
          v-if="visible"
          :class="['bg-white border border-green-100 p-6 rounded-2xl shadow-2xl transform transition-transform w-full', maxWidthClass]"
        >
          <div class="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
            <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
            <button @click="closeModal" class="cursor-pointer text-gray-500 bg-gray-100 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
              <Icon icon="mdi:close" width="20" height="20" />
            </button>
          </div>
          
          <div class="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <slot />
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.3s ease; }
.scale-enter-from, .scale-leave-to { transform: scale(0.95); opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>