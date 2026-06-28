<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

const showForm = ref(false)
const nombre_tipo = ref('')
const loading = ref(false)
const error = ref('')

const emit = defineEmits(['created', 'cancel'])

const submit = async () => {
    if (!nombre_tipo.value.trim()) {
        error.value = 'El nombre es obligatorio'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const res = await api.crearTipoRecursoInline({ nombre_tipo: nombre_tipo.value.trim() })
        emit('created', res.data)
        nombre_tipo.value = ''
        showForm.value = false
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al crear tipo de recurso'
    } finally {
        loading.value = false
    }
}

const toggle = () => {
    showForm.value = !showForm.value
    error.value = ''
}
</script>

<template>
    <div>
        <button v-if="!showForm" @click="toggle"
            class="text-xs text-purple-500 hover:text-purple-700 underline cursor-pointer">
            + Crear nuevo tipo
        </button>

        <div v-else class="bg-purple-50 p-2 rounded border border-purple-100 flex gap-2 items-end">
            <div class="flex-1">
                <label class="text-xs font-medium text-gray-600">Nombre del tipo</label>
                <input v-model="nombre_tipo" type="text" class="w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
            <button @click="submit" :disabled="loading"
                class="bg-purple-600 text-white px-2 py-1.5 rounded text-xs hover:bg-purple-700 transition cursor-pointer disabled:opacity-50">
                <Icon v-if="loading" icon="mdi:loading" class="animate-spin w-3 h-3 inline" />
                <span v-else>OK</span>
            </button>
            <button @click="toggle" :disabled="loading"
                class="bg-gray-300 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-400 transition cursor-pointer">X</button>
        </div>
    </div>
</template>
