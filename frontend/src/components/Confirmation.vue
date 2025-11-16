<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false },
    message: { type: String, default: '¿Está seguro/a que desea realizar esta acción?' },
    title: { type: String, default: 'Confirmación' },
    confirmText: { type: String, default: 'Aceptar' },
    cancelText: { type: String, default: 'Cancelar' }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmAction = () => {
    emit('confirm');
};

const cancelAction = () => {
    emit('cancel');
};
</script>

<template>
    <transition name="modal-fade">
        <div
            v-if="show"
            class="border border-green-100 fixed inset-0 z-50 flex items-start justify-center px-4 py-3 bg-opacity-40"
        >
            <div
                class="bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 p-4
                       transform transition-all duration-300 scale-100 opacity-100"
            >
                <h3 class="text-md font-bold text-gray-800 mb-2 border-b pb-2">{{ title }}</h3>

                <p class="text-gray-600 text-sm mb-2">{{ message }}</p>

                <div class="grid grid-cols-2 justify-end gap-3">
                    <button
                        @click="cancelAction"
                        class="cursor-pointer py-1 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                    >
                        {{ cancelText }}
                    </button>
                    <button
                        @click="confirmAction"
                        class="cursor-pointer py-1 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                    >
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>
