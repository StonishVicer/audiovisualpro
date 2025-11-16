<script setup>
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
    modelValue: Boolean,
    message: String,
    type: { type: String, default: 'loading' }
})

const toastClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-green-100 border-green-300 text-green-700'
        case 'error':
            return 'bg-red-100 border-red-300 text-red-700'
        case 'loading':
        default:
            return 'bg-blue-100 border-blue-300 text-blue-700'
    }
})

const toastIcon = computed(() => {
    switch (props.type) {
        case 'success':
            return 'material-symbols:check-circle'
        case 'error':
            return 'mdi:alert-circle'
        case 'loading':
        default:
            return 'mdi:loading'
    }
})

const emit = defineEmits(['update:modelValue'])
const visible = ref(props.modelValue)

watch(
    () => props.modelValue,
    (val) => (visible.value = val)
)

watch(visible, (val) => emit('update:modelValue', val))
</script>

<template>
    <transition name="fade">
        <div
            v-if="visible"
            class="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white border border-green-100 shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 z-50"
            :class="toastClass"
        >
            <Icon :icon="toastIcon" width="20" height="20" :class="{ 'animate-spin': props.type === 'loading' }" />
            <p class="text-sm font-semibold">
                {{ message }}
            </p>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade.leave-to {
    opacity: 0;
}
</style>
