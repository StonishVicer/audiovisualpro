<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

const emit = defineEmits(['created', 'cancel'])

const loading = ref(false)
const error = ref('')

const nombre = ref('')
const direccion = ref('')
const descripcion = ref('')

const showForm = ref(false)

const submit = async () => {
    if (!nombre.value.trim() || !direccion.value.trim()) {
        error.value = 'Nombre y Direccion son obligatorios'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const res = await api.crearLocacionInline({
            nombre_locacion: nombre.value.trim(),
            direccion: direccion.value.trim(),
            descripcion_locacion: descripcion.value.trim() || null
        })
        emit('created', res.data)
        nombre.value = ''
        direccion.value = ''
        descripcion.value = ''
        showForm.value = false
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al crear locacion'
    } finally {
        loading.value = false
    }
}

const toggle = () => {
    showForm.value = !showForm.value
    error.value = ''
}

defineExpose({ showForm, toggle })
</script>

<template>
    <div>
        <button v-if="!showForm" @click="toggle"
            class="w-full flex items-center justify-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer font-medium">
            <Icon icon="mdi:plus" class="w-4 h-4" />
            Crear nueva locacion
        </button>

        <div v-else class="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
            <p class="text-xs font-bold text-blue-800 uppercase">Nueva Locacion</p>
            <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ error }}</div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs font-medium text-gray-600">Nombre *</label>
                    <input v-model="nombre" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Direccion *</label>
                    <input v-model="direccion" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>
                <div class="col-span-2">
                    <label class="text-xs font-medium text-gray-600">Descripcion</label>
                    <textarea v-model="descripcion" rows="2" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-2 justify-end">
                <button @click="toggle" :disabled="loading"
                    class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                <button @click="submit" :disabled="loading"
                    class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition cursor-pointer disabled:opacity-50">
                    <Icon v-if="loading" icon="mdi:loading" class="animate-spin w-4 h-4 inline" />
                    <span v-else>Guardar</span>
                </button>
            </div>
        </div>
    </div>
</template>
