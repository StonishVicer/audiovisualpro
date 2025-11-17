<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Locaciones</h3>
        </div>
        <div
            class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)] p-3">
            <table class="table-auto w-full">
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
                        <td class="px-4 py-2">{{ locacion.idlocacion }}</td>
                        <td class="px-4 py-2">{{ locacion.nombrelocacion }}</td>
                        <td class="px-4 py-2">{{ locacion.direccion }}</td>
                        <td class="px-4 py-2">{{ locacion.descripcionlocacion }}</td>
                        <td class="px-4 py-2 flex items-center gap-1">
                            <button
                                class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" /> Editar
                            </button>
                            <button
                                class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" /> Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
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
                </div>
            </form>
        </Modal>

        <Toast
            v-model="isLoading"
            message="Conectando..."
            type="loading"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, withDirectives } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../../services/api.js'
import Modal from "../../../components/Modal.vue"
import Toast from '../../../components/Toast.vue'

const locaciones = ref([])

const showModal = ref(false)
const isLoading = ref(false)
const error = ref(false)

//LOCACION FORM
const nombre_locacion = ref('')
const direccion = ref('')
const descripcion_locacion = ref('')

const validarFormulario = () => {
    const { nombre, direccion_locacion, descripcion } = {
        nombre: nombre_locacion.value.trim(),
        direccion_locacion: direccion.value.trim(),
        descripcion: descripcion_locacion.value.trim()
    }
    if (!nombre || !direccion_locacion || !descripcion) return false
    return true
}

const limpiarCampos = () => {
    nombre_locacion.value = ''
    direccion.value = ''
    descripcion_locacion.value = ''
}

const createLocacion = () => {
    isLoading.value = true

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
    } catch (err) {
        console.error("Error al crear locacion: ", err)
    } finally {
        isLoading.value = false
    }
}

const getLocaciones = () => {
    try {

    } catch (err) {

    } finally {

    }
}
</script>
