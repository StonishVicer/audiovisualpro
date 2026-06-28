<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Recursos</h3>
        </div>
        <div
            class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)] p-3">
            <div v-if="loadingRecursosTecnicos">
                <div class="flex items-center justify-center text-center mt-3">
                    <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                        <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                        Cargando recursos tecnicos...
                    </div>
                </div>
            </div>
            <table v-else-if="recursos_tecnicos.length > 0" class="table-auto w-full">
                <thead>
                    <tr class="bg-green-100 text-green-900">
                        <th class="px-4 py-2 text-left">ID</th>
                        <th class="px-4 py-2 text-left">Nombre del Equipo</th>
                        <th class="px-4 py-2 text-left">Tipo de Recurso</th>
                        <th class="px-4 py-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="recurso in recursos_tecnicos" :key="recurso.id_recurso"
                        class="border-b border-green-100 hover:bg-green-50 transition">
                        <td class="px-4 py-2">{{ recurso.id_recurso }}</td>
                        <td class="px-4 py-2">{{ recurso.nombre_equipo }}</td>
                        <td class="px-4 py-2">{{ recurso.nombre_tipo }}</td>
                        <td class="px-4 py-2 flex items-center gap-1">
                            <button
                                @click="openEditModal(recurso)"
                                class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" /> Editar
                            </button>
                            <button
                                @click="requestDeleteRecursoTecnico(recurso.id_recurso)"
                                class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                            >
                                <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" /> Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else>
                <div class="flex items-center justify-center text-center mt-3">
                    <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                        <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                        No hay recursos tecnicos creados.
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-end mt-4">
            <button
                class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors"
                @click="showModal = true">
                <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" /> Nuevo Recurso
            </button>
        </div>

        <Modal
            :show="showModal" @close="showModal = false"
            size="sm"
            title="Nuevo Recurso Tecnico"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form @submit.prevent="createRecursoTecnico" class="mb-2">
                    <div class="mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            type="text"
                            v-model="nombre_equipo"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Nombre"
                        >
                    </div>
                    <div class="mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Tipo de Recurso</label>
                        <select
                            v-model="id_tipo_recurso"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                        >
                            <option :value="null" selected disabled>Seleccione un tipo</option>
                            <option v-for="tipo in tiposRecursos" :key="tipo.id_tipo_recurso" :value="tipo.id_tipo_recurso">{{ tipo.nombre_tipo }}</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                        Crear recurso tecnico
                    </button>
                </form>
                <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                    Limpiar campos
                </button>
            </div>
        </Modal>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />

        <Confirmation
            :show="showConfirmation"
            title="Eliminar recurso tecnico"
            message="¿Está seguro/a que desea eliminar este recurso tecnico?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deleteRecursosTecnicos"
            @cancel="showConfirmation = false"
        />

        <Modal
            v-if="showEditModal" :show="showEditModal" @close="showEditModal = false"
            size="sm"
            title="Editar Recurso Tecnico"
        >
            <div>
                <div v-if="editError" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form @submit.prevent="updateRecursoTecnico" class="mb-2">
                    <div class="mb-2">
                        <label for="nombre_edit" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            id="nombre_edit"
                            type="text"
                            v-model="currentRecurso.nombre_equipo"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Nombre"
                            required
                        >
                    </div>
                    <div class="mb-2">
                        <label for="tipo_edit" class="text-sm font-semibold text-gray-500 mb-1">Tipo de Recurso</label>
                        <select
                            id="tipo_edit"
                            v-model="currentRecurso.id_tipo_recurso"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-1"
                            required
                        >
                            <option v-for="tipo in tiposRecursos" :key="tipo.id_tipo_recurso" :value="tipo.id_tipo_recurso">{{ tipo.nombre_tipo }}</option>
                        </select>
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
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import Toast from '../../components/Toast.vue'
import Confirmation from '../../components/Confirmation.vue'

const recursos_tecnicos = ref([])

const showModal = ref(false)
const isConnecting = ref(false)
const loadingRecursosTecnicos = ref(false)
const error = ref(false)

const showEditModal = ref(false)
const isUpdating = ref(false)
const editError = ref(false)

const currentRecurso = ref({
    id_recurso: null,
    nombre_equipo: '',
    id_tipo_recurso: null,
    nombre_tipo: ''
})

const showConfirmation = ref(false)
const recursoDeleteID = ref(null)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const openEditModal = (recurso) => {
    currentRecurso.value = { ...recurso }
    editError.value = false
    showEditModal.value = true
}

const requestDeleteRecursoTecnico = (id) => {
    recursoDeleteID.value = id
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

//form
const tiposRecursos = ref([])
const nombre_equipo = ref('')
const id_tipo_recurso = ref(null)

const limpiarCampos = () => {
    nombre_equipo.value = ''
    id_tipo_recurso.value = null
    console.log('Campos limpiados')
}

const validarFormulario = () => {
    const nombrevalido = nombre_equipo.value && nombre_equipo.value.trim().length > 0
    const idvalida = id_tipo_recurso.value !== null
    return nombrevalido && idvalida
}

const cargarTiposRecursos = async () => {
    try {
        const res = await api.get('/api/tiposrecursos')
        tiposRecursos.value = res.data
    } catch (err) {
        console.error('Error al cargar los tipos de recurso:', err);
    }
}

const createRecursoTecnico = async () => {
    if(!validarFormulario()) {
        error.value = true
        return
    }
    error.value = false

    isConnecting.value = true

    try {
        const res = await api.post('/api/recursostecnicos', {
            nombre_equipo: nombre_equipo.value,
            id_tipo_recurso: id_tipo_recurso.value
        })

        const tipoSeleccionado = tiposRecursos.value.find(tipo => tipo.id_tipo_recurso === res.data.id_tipo_recurso)
        const nuevoRecurso = {
            ...res.data,
            nombre_tipo: tipoSeleccionado ? tipoSeleccionado.nombre_tipo : 'Desconocido'
        }

        console.log('Recurso tecnico creado exitosamente: ', nuevoRecurso);
        recursos_tecnicos.value.push(nuevoRecurso)
        limpiarCampos()
        showModal.value = false
        displayToast('Recurso tecnico creado', 'success')
    } catch (err) {
        console.log('Error al crear nuevo recurso tecnico: ', err)
        displayToast('Error al crear el recurso tecnico', 'error')
    } finally {
        isConnecting.value = false
    }
}

const getRecursosTecnicos = async () => {
    loadingRecursosTecnicos.value = true

    try {
        const res = await api.get('/api/recursostecnicos')
        recursos_tecnicos.value = res.data
        console.log('Recursos tecnicos obtenidos: ', recursos_tecnicos.value)
    } catch (err) {
        console.log('Error al obtener los recursos tecnicos:', err)
    } finally {
        loadingRecursosTecnicos.value = false
    }
}

const deleteRecursosTecnicos = async () => {
    const id = recursoDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/recursostecnicos/${id}`)
        recursos_tecnicos.value = recursos_tecnicos.value.filter(recurso => recurso.id_recurso !== id)
        displayToast('Recurso tecnico eliminado', 'success')
    } catch (err) {
        console.log('Error al eliminar el recurso tecnico')
        displayToast('Error al eliminar el recurso tecnico', 'error')
    } finally {
        isConnecting.value = false
    }
}

const updateRecursoTecnico = async () => {
    if (!currentRecurso.value.nombre_equipo.trim() || !currentRecurso.value.id_tipo_recurso) {
        editError.value = true
        return
    }
    editError.value = false
    isUpdating.value = true

    try {
        const id = currentRecurso.value.id_recurso

        const res = await api.put(`/api/recursostecnicos/${id}`, {
            nombre_equipo: currentRecurso.value.nombre_equipo,
            id_tipo_recurso: currentRecurso.value.id_tipo_recurso
        })

        const updatedData = res.data;
        const tipoSeleccionado = tiposRecursos.value.find(tipo => tipo.id_tipo_recurso === updatedData.id_tipo_recurso);

        const recursoActualizado = {
            ...updatedData,
            nombre_tipo: tipoSeleccionado ? tipoSeleccionado.nombre_tipo : 'Desconocido'
        }

        const index = recursos_tecnicos.value.findIndex(recurso => recurso.id_recurso === id)
        if (index !== -1) {
            recursos_tecnicos.value[index] = recursoActualizado
        }

        showEditModal.value = false
        displayToast('Recurso actualizado con éxito', 'success')
    } catch (err) {
        console.error('Error al actualizar el recurso técnico:', err)
        var errMsj = 'Error al actualizar el recurso tecnico.'
        if (err.response?.status === 409) {
            errMsj = 'No se puede actualizar el recurso tecnico. Esta vinculado a un proyecto.'
        }
        displayToast(errMsj, 'error')
    } finally {
        isUpdating.value = false
    }
}

onMounted(() => {
    cargarTiposRecursos()
    getRecursosTecnicos()
})
</script>
