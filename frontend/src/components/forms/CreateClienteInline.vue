<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

const emit = defineEmits(['created', 'cancel'])

const loading = ref(false)
const error = ref('')

const rif = ref('')
const nombre = ref('')
const email = ref('')
const telefono = ref('')

const showForm = ref(false)

const submit = async () => {
    if (!rif.value.trim() || !nombre.value.trim()) {
        error.value = 'RIF y Nombre son obligatorios'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const res = await api.crearClienteInline({
            rif_cliente: rif.value.trim(),
            nombre_cliente: nombre.value.trim(),
            email_cliente: email.value.trim() || null,
            telefono_cliente: telefono.value.trim() || null
        })
        emit('created', res.data)
        rif.value = ''
        nombre.value = ''
        email.value = ''
        telefono.value = ''
        showForm.value = false
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al crear cliente'
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
            class="w-full flex items-center justify-center gap-1 text-sm bg-green-50 text-green-600 px-3 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition cursor-pointer font-medium">
            <Icon icon="mdi:plus" class="w-4 h-4" />
            Crear nuevo cliente
        </button>

        <div v-else class="bg-green-50/50 p-3 rounded-lg border border-green-100 space-y-2">
            <p class="text-xs font-bold text-green-800 uppercase">Nuevo Cliente</p>
            <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ error }}</div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs font-medium text-gray-600">RIF *</label>
                    <input v-model="rif" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Nombre *</label>
                    <input v-model="nombre" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Email</label>
                    <input v-model="email" type="email" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Telefono</label>
                    <input v-model="telefono" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400 focus:outline-none" />
                </div>
            </div>
            <div class="flex gap-2 justify-end">
                <button @click="toggle" :disabled="loading"
                    class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                <button @click="submit" :disabled="loading"
                    class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition cursor-pointer disabled:opacity-50">
                    <Icon v-if="loading" icon="mdi:loading" class="animate-spin w-4 h-4 inline" />
                    <span v-else>Guardar</span>
                </button>
            </div>
        </div>
    </div>
</template>
