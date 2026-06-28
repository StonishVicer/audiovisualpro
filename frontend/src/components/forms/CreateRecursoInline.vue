<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'
import CreateTipoRecursoInline from './CreateTipoRecursoInline.vue'

const emit = defineEmits(['created', 'cancel'])

const loading = ref(false)
const error = ref('')

const nombre = ref('')
const id_tipo_recurso = ref(null)
const tiposRecurso = ref([])

const showForm = ref(false)
const showCreateTipo = ref(false)

const cargarTipos = async () => {
    try {
        const res = await api.get('/api/tiposrecursos')
        tiposRecurso.value = res.data
    } catch (err) {
        console.error('Error al cargar tipos de recurso:', err)
    }
}

const submit = async () => {
    if (!nombre.value.trim() || !id_tipo_recurso.value) {
        error.value = 'Nombre y Tipo son obligatorios'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const res = await api.crearRecursoInline({
            nombre_equipo: nombre.value.trim(),
            id_tipo_recurso: id_tipo_recurso.value
        })
        emit('created', res.data)
        nombre.value = ''
        id_tipo_recurso.value = null
        showForm.value = false
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al crear recurso'
    } finally {
        loading.value = false
    }
}

const onTipoCreado = (tipo) => {
    tiposRecurso.value.push(tipo)
    id_tipo_recurso.value = tipo.id_tipo_recurso
    showCreateTipo.value = false
}

const toggle = () => {
    showForm.value = !showForm.value
    error.value = ''
    if (showForm.value) cargarTipos()
}

defineExpose({ showForm, toggle })
</script>

<template>
    <div>
        <button v-if="!showForm" @click="toggle"
            class="w-full flex items-center justify-center gap-1 text-sm bg-purple-50 text-purple-600 px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition cursor-pointer font-medium">
            <Icon icon="mdi:plus" class="w-4 h-4" />
            Crear nuevo recurso
        </button>

        <div v-else class="bg-purple-50/50 p-3 rounded-lg border border-purple-100 space-y-2">
            <p class="text-xs font-bold text-purple-800 uppercase">Nuevo Recurso Tecnico</p>
            <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ error }}</div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-xs font-medium text-gray-600">Nombre *</label>
                    <input v-model="nombre" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Tipo *</label>
                    <select v-model="id_tipo_recurso" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white">
                        <option :value="null" disabled>Seleccione tipo</option>
                        <option v-for="tipo in tiposRecurso" :key="tipo.id_tipo_recurso" :value="tipo.id_tipo_recurso">{{ tipo.nombre_tipo }}</option>
                    </select>
                </div>
            </div>
            <CreateTipoRecursoInline @created="onTipoCreado" @cancel="showCreateTipo = false" />
            <div class="flex gap-2 justify-end">
                <button @click="toggle" :disabled="loading"
                    class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                <button @click="submit" :disabled="loading"
                    class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition cursor-pointer disabled:opacity-50">
                    <Icon v-if="loading" icon="mdi:loading" class="animate-spin w-4 h-4 inline" />
                    <span v-else>Guardar</span>
                </button>
            </div>
        </div>
    </div>
</template>
