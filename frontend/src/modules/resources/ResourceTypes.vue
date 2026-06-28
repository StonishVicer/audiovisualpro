<script setup>
import { Icon } from "@iconify/vue";
import Toast from '../../components/Toast.vue'
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import Confirmation from '../../components/Confirmation.vue'
import Modal from '../../components/Modal.vue'

const isConnecting = ref(false)
const loadingTiposRecursos = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showEditModal = ref(false)
const isUpdating = ref(false)
const currentTipoRecurso = ref({
    id_tipo_recurso: null,
    nombre_tipo: ''
})
const editError = ref(false)

const showConfirmation = ref(false)
const tipoDeleteID = ref(null)

const openEditModal = (tipo) => {
    currentTipoRecurso.value = { ...tipo }
    editError.value = false
    showEditModal.value = true
}

const requestDeleteTipoRecurso = (id) => {
    tipoDeleteID.value = id
    showConfirmation.value = true
}

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, 3000);
}

const nombre_tipo = ref('')

const tipos_recursos = ref([])

const getTiposRecursos = async () => {
    loadingTiposRecursos.value = true

    try {
        const res = await api.get('/api/tiposrecursos')
        tipos_recursos.value = res.data
        console.log('Tipos de recurso obtenidos con exito:', tipos_recursos.value)
    } catch (err) {
        console.log('Error al obtener los tipos de recurso')
    } finally {
        loadingTiposRecursos.value = false
    }
}

const createTiposRecursos = async () => {
    isConnecting.value = true

    try {
        const res = await api.post('/api/tiposrecursos', {
            nombre_tipo: nombre_tipo.value
        })

        console.log('Tipo de recurso creado con exito:', res.data)
        tipos_recursos.value.push(res.data)
        nombre_tipo.value = ''
        displayToast('Tipo de recurso creado', 'success')
    } catch (err) {
        console.log('Error al crear tipo de recurso:', err);
        displayToast('Error al crear tipo de recurso', 'error')
    } finally {
        isConnecting.value = false
    }
}

const deleteTiposRecursos = async () => {
    const id = tipoDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/tiposrecursos/${id}`)
        tipos_recursos.value = tipos_recursos.value.filter(tipo => tipo.id_tipo_recurso !== id)
        displayToast('Tipo de recurso eliminado', 'success')
    } catch (err) {
        console.log('Error al eliminar el tipo de recurso:', err)
        if(err.response && err.response.status === 409) {
            displayToast(err.response.data.message, 'error')
        } else {
            displayToast('Error al eliminar. Intentelo denuevo.', 'error')
        }
    } finally {
        isConnecting.value = false
    }
}

const updateTipoRecurso = async () => {
    isUpdating.value = true
    editError.value = false

    try {
        if (!currentTipoRecurso.value.nombre_tipo.trim()) {
            editError.value = true
            return
        }
        const id = currentTipoRecurso.value.id_tipo_recurso
        const res = await api.put(`/api/tiposrecursos/${id}`, {
            nombre_tipo: currentTipoRecurso.value.nombre_tipo
        })
        const index = tipos_recursos.value.findIndex(tipo => tipo.id_tipo_recurso === id)
        if (index !== -1) {
            tipos_recursos.value[index] = res.data
        }
        showEditModal.value = false
        displayToast('Tipo de recurso actualizado', 'success')
    } catch (err) {
        console.error('Error al actualizar el tipo de recurso:', err)
        let errorMensj = 'Error al actualizar. Inténtalo de nuevo.'
        if (err.response?.status === 409) {
            errorMensj = err.response.data.message
        }
        displayToast(errorMensj, 'error')
    } finally {
        isUpdating.value = false
    }
}

onMounted(() => {
    getTiposRecursos()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4 flex justify-center">
            <h3 class="text-center font-bold text-lg">Gestion de Tipos de Recurso</h3>
        </div>

        <div class="mb-4 border-b border-gray-200 pb-3">
            <p class="text-sm font-semibold text-gray-(500 mb-1">Nuevo tipo</p>
            <form @submit.prevent="createTiposRecursos">
                <div class="flex space-x-2">
                    <div class="relative flex-1">
                        <input
                            v-model="nombre_tipo"
                            type="text"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Crear tipo"
                            required
                        >
                    </div>
                    <button type="submit" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                        <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" />
                        Crear Tipo
                    </button>
                </div>
            </form>
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
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar tipo"
                    >
                </div>

            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingTiposRecursos">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            Cargando tipos de recursos...
                        </div>
                    </div>
                </div>
                <table v-else-if="tipos_recursos.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">ID</th>
                            <th class="px-4 py-2 text-left">Nombre Tipo</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tipos in tipos_recursos" :key="tipos.id_tipo_recurso" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">{{ tipos.id_tipo_recurso }}</td>
                            <td class="px-4 py-2">{{ tipos.nombre_tipo }}</td>
                            <td class="px-4 py-2 flex items-center gap-1">
                                <button
                                    @click="openEditModal(tipos)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    @click="requestDeleteTipoRecurso(tipos.id_tipo_recurso)"
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
                        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            No hay tipos de recursos creados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />

        <Confirmation
            :show="showConfirmation"
            title="Eliminar tipo recurso"
            message="¿Está seguro/a que desea eliminar este tipo de recurso?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deleteTiposRecursos"
            @cancel="showConfirmation = false"
        />

        <Modal
            v-if="showEditModal" :show="showEditModal" @close="showEditModal = false"
            size="sm"
            title="Editar Tipo de Recurso"
        >
            <div v-if="editError" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                El nombre del tipo de recurso no puede estar vacío.
            </div>

            <form @submit.prevent="updateTipoRecurso" class="mb-2">
                <div class="mb-2">
                    <div class="flex flex-col mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            type="text"
                            v-model="currentTipoRecurso.nombre_tipo"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Nombre del tipo de recurso"
                            required
                        >
                    </div>
                </div>
                <button 
                    type="submit" 
                    :disabled="isUpdating"
                    class="w-full flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors disabled:bg-blue-300">
                    {{ isUpdating ? 'Actualizando...' : 'Guardar Cambios' }}
                </button>
            </form>
            <button @click="showEditModal = false" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors mt-2">
                Cancelar
            </button>
        </Modal>
    </div>
</template>
