<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import Confirmation from '../../../components/Confirmation.vue'
import { onMounted, ref, computed } from 'vue'
import api from '../../../services/api.js'

// --- Datos ---
const estados = ref([])
const searchQuery = ref('')

// --- Formulario ---
const id_estado_editar = ref(null)
const nombre_estado = ref('')
// ELIMINADAS: descripcion_estado y color_estado

// --- UI States ---
const showModal = ref(false)
const isConnecting = ref(false)
const error = ref(false)
const loadingEstados = ref(false)

// --- Toast & Confirm ---
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const showConfirmation = ref(false)
const deleteId = ref(null)

// ELIMINADAS: Opciones de Color para el Estado (coloresDisponibles)

// --- Utils ---
const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000);
}

const limpiarCampos = () => {
    nombre_estado.value = ''
    // ELIMINADAS: descripcion_estado, color_estado
    id_estado_editar.value = null
    error.value = false
}

const validarFormulario = () => {
    if (!nombre_estado.value.trim()) return false
    return true
}

// --- Computados ---
const estadosFiltrados = computed(() => {
    if (!searchQuery.value) return estados.value
    return estados.value.filter(e => 
        e.nombre_estado.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// --- CRUD ---

const getEstados = async () => {
    loadingEstados.value = true
    try {
        const res = await api.get('/api/estadosentregable')
        estados.value = res.data || []
        console.log('Estados obtenidos:', estados.value)
    } catch (err) {
        console.error('Error al obtener estados:', err)
    } finally {
        loadingEstados.value = false
    }
}

const handleSubmit = async () => {
    isConnecting.value = true
    try {
        if (!validarFormulario()) {
            error.value = true
            isConnecting.value = false
            return
        }
        error.value = false

        const payload = {
            nombre_estado: nombre_estado.value,
            // ELIMINADAS: descripcion_estado y color_estado
        }

        console.log('POST /api/estadosentregable payload:', payload)

        if (id_estado_editar.value) {
            // Editar (ruta de estados de entregable)
            const res = await api.put(`/api/estadosentregable/${id_estado_editar.value}`, payload)
            const idx = estados.value.findIndex(e => e.id_estado_entregable === id_estado_editar.value)
            // Asume que la BD devuelve el estado completo, incluso si solo se actualizó el nombre.
            if (idx !== -1) estados.value[idx] = res.data
            displayToast('Estado actualizado', 'success')
        } else {
            // Crear
            const res = await api.post('/api/estadosentregable', payload)
            estados.value.push(res.data)
            displayToast('Estado creado', 'success')
        }

        showModal.value = false
        limpiarCampos()
        } catch (err) {
        console.error('Error al guardar estado:', err)
        // Normalizar mensaje del servidor a string para Toast
        const data = err?.response?.data
        let serverMsg = ''
        if (!data) {
            serverMsg = err.message || String(err)
        } else if (typeof data === 'string') {
            serverMsg = data
        } else {
            serverMsg = data.message || data.error || JSON.stringify(data)
        }
        console.error('Server response:', serverMsg)
        displayToast(serverMsg || 'Error al procesar la solicitud', 'error')
    } finally {
        isConnecting.value = false
    }
}

const openEditModal = (item) => {
    id_estado_editar.value = item.id_estado_entregable
    nombre_estado.value = item.nombre_estado
    // ELIMINADAS: descripcion_estado y color_estado
    showModal.value = true
}

const requestDelete = (id) => {
    deleteId.value = id
    showConfirmation.value = true
}

const deleteEstado = async () => {
    const id = deleteId.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
    await api.delete(`/api/estadosentregable/${id}`)
    estados.value = estados.value.filter(e => e.id_estado_entregable !== id)
    displayToast('Estado eliminado', 'success')
    } catch (err) {
        console.error('Error eliminando:', err)
        displayToast('Error al eliminar estado', 'error')
    } finally {
        isConnecting.value = false
    }
}

onMounted(() => {
    getEstados()
})

// ELIMINADA: Función helper para traducir el string de color a clase de Tailwind (getColorClass)
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Configuración de Estados</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="showModal = true; limpiarCampos()" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="mdi:playlist-plus" width="25" height="25" class="mr-2" />
                    Nuevo Estado
                </button>
            </div>
        </div>

        <div class="mb-3">
            <div class="flex space-x-2">
                <div class="relative flex-1">
                    <Icon
                        icon="material-symbols:search"
                        width="25"
                        height="25"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        v-model="searchQuery"
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar estado..."
                    >
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingEstados">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:loading" width="25" height="25" class="mr-2 animate-spin" />
                            Cargando lista de estados...
                        </div>
                    </div>
                </div>

                <table v-else-if="estadosFiltrados.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">Nombre del Estado</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="estado in estadosFiltrados" :key="estado.id_estado_entregable" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2 font-medium">
                                {{ estado.nombre_estado }}
                            </td>
                            <td class="px-4 py-2 flex items-center gap-2">
                                <button
                                    @click="openEditModal(estado)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    @click="requestDelete(estado.id_estado_entregable)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" />
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else>
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-gray-500 items-center justify-center w-full bg-gray-100 border border-gray-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:list-status" width="25" height="25" class="mr-2" />
                            No hay estados configurados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            size="sm"
            :title="id_estado_editar ? 'Editar Estado' : 'Nuevo Estado'"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mb-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    El nombre es obligatorio.
                </div>

                <form @submit.prevent="handleSubmit" class="mb-2">
                    
                    <div class="flex flex-col mb-3">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            type="text"
                            v-model="nombre_estado"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Ej: En Revisión"
                        >
                    </div>

                    <div class="flex justify-end mt-4">
                        <button 
                            type="submit" 
                            :disabled="isConnecting"
                            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                        >
                            <Icon v-if="isConnecting" icon="mdi:loading" class="animate-spin mr-2"/>
                            Guardar
                        </button>
                    </div>

                </form>
            </div>
        </Modal>

        <Toast :show="showToast" :message="toastMessage" :type="toastType" />
        
        <Confirmation 
            :show="showConfirmation" 
            @confirm="deleteEstado" 
            @cancel="showConfirmation = false" 
            message="¿Estás seguro de eliminar este estado? Podría afectar entregables existentes."
        />
    </div>
</template>