<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Locaciones</h3>
        </div>
        <div
            class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)] p-3">
            <div v-if="loadingLocaciones">
                <div class="flex items-center justify-center text-center mt-3">
                    <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                        <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                        Cargando locaciones...
                    </div>
                </div>
            </div>
            <table v-else-if="locaciones.length > 0" class="table-auto w-full">
                <thead>
                    <tr class="bg-green-100 text-green-900">
                        <th class="px-4 py-2 text-left">ID</th>
                        <th class="px-4 py-2 text-left">Nombre</th>
                        <th class="px-4 py-2 text-left">Dirección</th>
                        <th class="px-4 py-2 text-left">Descripción</th>
                        <th class="px-4 py-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="locacion in locaciones" :key="locacion.idlocacion"
                        class="border-b border-green-100 hover:bg-green-50 transition">
                        <td class="px-4 py-2">{{ locacion.id_locacion }}</td>
                        <td class="px-4 py-2">{{ locacion.nombre_locacion }}</td>
                        <td class="px-4 py-2">{{ locacion.direccion }}</td>
                        <td class="px-4 py-2">{{ locacion.descripcion_locacion }}</td>
                        <td class="px-4 py-2 flex items-center gap-1">
                            <button
                                class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" /> Editar
                            </button>
                            <button
                                @click="requestDeleteLocacion(locacion.id_locacion)"
                                class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
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
                        No hay locaciones creadas.
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-end mt-4">
            <button
                class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors"
                @click="showModal = true">
                <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" /> Nueva Locación
            </button>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            title="Nueva Locacion"
        >
            <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                Complete todos los campos.
            </div>

            <form @submit.prevent="createLocacion" class="mb-2">
                <div class="mb-2">
                    <div class="flex flex-col mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            type="text"
                            v-model="nombre_locacion"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Nombre"
                        >
                    </div>
                    <div class="flex flex-col mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Direccion</label>
                        <textarea
                            v-model="direccion"
                            class="resize-none transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Direccion"
                            rows="2"
                        >
                        </textarea>
                    </div>
                    <div class="flex flex-col mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Descripcion</label>
                        <textarea
                            v-model="descripcion_locacion"
                            class="resize-none transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Descripcion"
                            rows="5"
                        >
                        </textarea>
                    </div>
                </div>
                <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                    Crear locacion
                </button>
            </form>
            <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                Limpiar campos
            </button>
        </Modal>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />

        <Confirmation
            :show="showConfirmation"
            title="Eliminar locacion"
            message="¿Está seguro/a que desea eliminar esta locacion?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deleteLocaciones"
            @cancel="showConfirmation = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../../services/api.js'
import Modal from "../../../components/Modal.vue"
import Toast from '../../../components/Toast.vue'
import Confirmation from "../../../components/Confirmation.vue";

const locaciones = ref([])

const showModal = ref(false)
const isConnecting = ref(false)
const loadingLocaciones = ref(false)
const error = ref(false)

const showConfirmation = ref(false)
const locacionDeleteID = ref(null)

//LOCACION FORM
const nombre_locacion = ref('')
const direccion = ref('')
const descripcion_locacion = ref('')

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, 3000);
}

const requestDeleteLocacion = (id) => {
    locacionDeleteID.value = id
    showConfirmation.value = true
}

const validarFormulario = () => {
    const { nombre, direccion_locacion, descripcion } = {
        nombre: nombre_locacion.value.trim(),
        direccion_locacion: direccion.value.trim(),
        descripcion: descripcion_locacion.value.trim()
    }
    if (!nombre || !direccion_locacion || !descripcion) return true
    return false
}

const limpiarCampos = () => {
    nombre_locacion.value = ''
    direccion.value = ''
    descripcion_locacion.value = ''
}

const createLocacion = async () => {
    isConnecting.value = true

    try {
        if (validarFormulario()) {
            error.value = true
            return
        }
        error.value = false

        const res = await api.post('/api/locacion', {
            nombre_locacion: nombre_locacion.value,
            direccion: direccion.value,
            descripcion_locacion: descripcion_locacion.value
        })

        console.log('Locacion creada con exito')
        locaciones.value.push(res.data)
        limpiarCampos()
        showModal.value = false
        displayToast('Locacion creada', 'success')
    } catch (err) {
        console.error("Error al crear locacion: ", err)
        displayToast('Error al crear locacion', 'error')
    } finally {
        isConnecting.value = false
    }
}

const getLocaciones = async () => {
    loadingLocaciones.value = true

    try {
        const res = await api.get('/api/locacion')
        locaciones.value = res.data
        console.log('Locaciones obtenidas:', locaciones.value)
    } catch (err) {
        console.log('Error al obtener locaciones:', err)
    } finally {
        loadingLocaciones.value = false
    }
}

const deleteLocaciones = async () => {
    const id = locacionDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/locacion/${id}`)
        locaciones.value = locaciones.value.filter(locacion => locacion.id_locacion !== id)
        displayToast('Locacion eliminada', 'success')
    } catch (err) {
        console.error('Error al eliminar la locacion: ', err)
        displayToast('Error al eliminar locacion', 'error')
    } finally {
        isConnecting.value = false
    }
}

onMounted(() => {
    getLocaciones()
})
</script>
