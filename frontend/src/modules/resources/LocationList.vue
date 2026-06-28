<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Locaciones</h3>
        </div>
        <div
            class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[450px] max-h-[calc(100vh-260px)] p-3">
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
                        <th></th>
                        <th class="px-4 py-2 text-left">Nombre</th>
                        <th class="px-4 py-2 text-left">Dirección</th>
                        <th class="px-4 py-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="locacion in locaciones" :key="locacion.idlocacion"
                        class="border-b border-green-100 hover:bg-green-50 transition">
                        <td :style="getImageBackgroundStyle(locacion.url_imagen)"
                            class="relative w-40 p-0 overflow-hidden" 
                            :class="{ '': !locacion.url_imagen }"
                        >
                            <div class="h-full">
                                <div class="absolute inset-0"
                                     style="background: linear-gradient(to right, transparent 0%, white 100%);">
                                </div>
                            </div>
                            
                            <div v-if="!locacion.url_imagen" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                Sin imagen
                            </div>
                        </td>
                        <td class="px-4 py-2">{{ locacion.nombre_locacion }}</td>
                        <td class="px-4 py-2">{{ locacion.direccion }}</td>
                        <td class="px-4 py-2 flex items-center gap-1">
                            <div class="grid grid-cols-2 gap-1">
                                <button
                                    @click="openEditModal(locacion)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">Editar
                                </button>
                                <button
                                    @click="requestDeleteLocacion(locacion.id_locacion)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                    Eliminar
                                </button>
                                <button
                                    @click="mostrarDetallesLocacion(locacion)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-2 py-1 rounded-lg transition-colors col-span-2"
                                >
                                    Ver Detalles
                                </button>
                            </div>
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
            :show="showModal" @close="showModal = false"
            size="sm"
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
                    <div class="flex flex-col mb-2">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Imagen de Referencia <span class="text-red-700">(Opcional)</span></label>
                        <div class="flex flex-col items-center">

                            <label class="border-2 border-gray-300 text-gray-500 w-full relative cursor-pointer hover:bg-green-100 transition hover:text-green-500 hover:outline-none hover:border-green-500 rounded-lg py-2 px-2 font-semibold ease-in-out transform border-dashed">
                                <span class="flex items-center space-x-2">
                                    <Icon icon="flowbite:upload-solid" width="30" height="30" />
                                    <span>Subir imagen...</span>
                                </span>
                                <input 
                                    type="file"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    @change="manejarSubidaImagen"
                                >
                            </label>

                            <p class="mt-2 text-green-600 italic text-sm">{{ imagenNombreDisplay }}</p>
                        </div>
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

        <Modal
            v-if="showEditModal" :show="showEditModal" @close="showEditModal = false"
            size="sm"
            title="Editar Locacion"
        >
            <div v-if="editError" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                Complete todos los campos.
            </div>
            <form @submit.prevent="updateLocacion" class="mb-2"> <div class="mb-2">
                    <div class="flex flex-col mb-2">
                        <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                        <input
                            type="text"
                            v-model="currentLocacion.nombre_locacion" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Nombre"
                        >
                    </div>
                    <div class="flex flex-col mb-2">
                        <label for="direccion" class="text-sm font-semibold text-gray-500 mb-1">Dirección</label>
                        <textarea
                            v-model="currentLocacion.direccion" class="resize-none transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Direccion"
                            rows="2"
                        >
                        </textarea>
                    </div>
                    <div class="flex flex-col mb-2">
                        <label for="descripcion" class="text-sm font-semibold text-gray-500 mb-1">Descripción</label>
                        <textarea
                            v-model="currentLocacion.descripcion_locacion" class="resize-none transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Descripcion"
                            rows="5"
                        >
                        </textarea>
                    </div>
                    <div class="mb-2">
                        <div class="flex flex-col mb-2 border border-gray-200 p-3 rounded-lg bg-gray-50">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Imagen Actual</label>
                            
                            <div v-if="currentLocacion.url_imagen" class="flex items-center space-x-3 mb-3">
                                <img :src="currentLocacion.url_imagen" alt="Imagen actual" class="w-20 h-20 object-cover rounded-md shadow-md"/>
                                <p class="text-xs text-gray-500 italic">Se mantendrá si no seleccionas una nueva.</p>
                            </div>
                            <div v-else class="text-xs text-gray-500 mb-3">(No hay imagen actual)</div>
                            
                            <label class="text-sm font-semibold text-gray-500 mb-1">Reemplazar Imagen (Opcional)</label>

                            <label class="border-2 border-gray-300 text-gray-500 w-full relative cursor-pointer hover:bg-blue-100 transition hover:text-blue-500 hover:outline-none hover:border-blue-500 rounded-lg py-2 px-2 font-semibold ease-in-out transform border-dashed">
                                <span class="flex items-center space-x-2">
                                    <Icon icon="flowbite:upload-solid" width="30" height="30" />
                                    <span>Seleccionar nuevo archivo...</span>
                                </span>
                                <input
                                    type="file"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    @change="manejarSubidaImagenEdicion" >
                            </label>

                            <p class="mt-2 text-blue-600 italic text-sm">{{ editImagenNombreDisplay }}</p>
                        </div>
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

        <Modal
            v-if="showModalDetalles" :show="showModalDetalles" @close="showModalDetalles = false"
            size="sm"
            :title="'Detalles: ' + detallesActuales.nombre_locacion"
        >
            <div class="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <h4 class="font-semibold text-gray-600 mb-2">Imagen de Referencia</h4>
                <div v-if="detallesActuales.url_imagen" class="w-full">
                    <img 
                        :src="detallesActuales.url_imagen" 
                        alt="Imagen de la locación" 
                        class="w-full object-cover rounded-md shadow-md max-h-60"
                    />
                </div>
                <div v-else class="text-xs text-gray-500 text-center py-4 border border-dashed rounded-md">
                    Sin imagen
                </div>
            </div>
            <div class="space-y-2">
                <h4 class="font-semibold text-gray-600 border-b pb-1">Información General</h4>
                <p>
                    <span class="font-semibold text-gray-700">Nombre:</span> 
                    {{ detallesActuales.nombre_locacion }}
                </p>
                <p>
                    <span class="font-semibold text-gray-700">Dirección:</span> 
                    {{ detallesActuales.direccion }}
                </p>
                <div>
                    <span class="font-semibold text-gray-700 block">Descripción:</span> 
                    <p class="mt-1 p-2 bg-gray-50 border rounded-md whitespace-pre-wrap">{{ detallesActuales.descripcion_locacion }}</p>
                </div>
            </div>
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
import api from '../../services/api.js'
import Modal from "../../components/Modal.vue"
import Toast from '../../components/Toast.vue'
import Confirmation from "../../components/Confirmation.vue";

const locaciones = ref([])

const showModal = ref(false)
const isConnecting = ref(false)
const loadingLocaciones = ref(false)
const error = ref(false)

const showModalDetalles = ref(false)

const showEditModal = ref(false)
const isUpdating = ref(false)
const editError = ref(false)
const currentLocacion = ref({
    id_locacion: null,
    nombre_locacion: '',
    direccion: '',
    descripcion_locacion: ''
})

const showConfirmation = ref(false)
const locacionDeleteID = ref(null)

//LOCACION FORM
const nombre_locacion = ref('')
const direccion = ref('')
const descripcion_locacion = ref('')
const imagen_locacion = ref(null)

//DETALES
const detallesActuales = ref({
    idlocacionn: null,
    nombrelocacion: '',
    direccionlocacion: '',
    descripcionlocacion: '',
    imagenlocacion: null
})

//REFERENCIAS NECESARIAS
const imagenInputRef = ref(null)
const imagenNombreDisplay = ref('Archivo no seleccionado.')

//EDICION IMAGEN
const editImagenLocacion = ref(null)
const editImagenNombreDisplay = ref('Mantener imagen.')

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const getImageBackgroundStyle = (url) => {
    if (!url) {
        return {};
    }
    
    return {
        'background-image': `url('${url}')`,
        'background-size': 'cover',
        'background-position': 'center right',
        'background-repeat': 'no-repeat',
    };
}

const mostrarDetallesLocacion = (locacion) => {
    detallesActuales.value = { ...locacion }
    showModalDetalles.value = true
}

const manejarSubidaImagen = (event) => {
    const file = event.target.files ? event.target.files[0] : null
    imagen_locacion.value = file
    imagenNombreDisplay.value = file ? file.name : 'Archivo no seleccionado.'
}

const manejarSubidaImagenEdicion = (event) => {
    const file = event.target.files ? event.target.files[0] : null
    editImagenLocacion.value = file
    if (file) {
        editImagenNombreDisplay.value = `Nueva imagen: ${file.name}`
    } else {
        editImagenNombreDisplay.value = 'Mantener imagen.'
    }
}

const openEditModal = (locacion) => {
    currentLocacion.value = { ...locacion }
    editError.value = false
    showEditModal.value = true
    editImagenLocacion.value = null
    editImagenNombreDisplay.value = 'Mantener igual.'
}

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

const validarFormularioEdicion = () => {
    const { nombre, direccion_locacion, descripcion } = {
        nombre: currentLocacion.value.nombre_locacion.trim(),
        direccion_locacion: currentLocacion.value.direccion.trim(),
        descripcion: currentLocacion.value.descripcion_locacion.trim()
    }
    if (!nombre || !direccion_locacion || !descripcion) return true
    return false
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
    imagen_locacion.value = null
    imagenNombreDisplay.value = 'Archivo no seleccionado.'
    if (imagenInputRef.value) {
        imagenInputRef.value = ''
    }
}

const createLocacion = async () => {
    isConnecting.value = true

    try {
        if (validarFormulario()) {
            error.value = true
            return
        }
        error.value = false

        const formData = new FormData()

        formData.append('nombre_locacion', nombre_locacion.value)
        formData.append('direccion', direccion.value)
        formData.append('descripcion_locacion', descripcion_locacion.value)

        if (imagen_locacion.value) {
            formData.append('imagen', imagen_locacion.value)
        }

        const res = await api.post('/api/locacion', formData)

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
        if(err.response && err.response.status === 409) {
            displayToast(err.response.data.message, 'error')
        } else {
            displayToast('Error al eliminar. Intentelo denuevo.', 'error')
        }
    } finally {
        isConnecting.value = false
    }
}

const updateLocacion = async () => {
    isUpdating.value = true
    editError.value = false

    try {
        if (validarFormularioEdicion()) {
            editError.value = true
            return
        }

        const formData = new FormData()

        formData.append('nombre_locacion', currentLocacion.value.nombre_locacion)
        formData.append('direccion', currentLocacion.value.direccion)
        formData.append('descripcion_locacion', currentLocacion.value.descripcion_locacion)

        if (editImagenLocacion.value) {
            formData.append('imagen', editImagenLocacion.value)
        }

        const res = await api.put(`/api/locacion/${currentLocacion.value.id_locacion}`, formData)

        const index = locaciones.value.findIndex(locacion => locacion.id_locacion === res.data.id_locacion)
        if (index !== -1) {
            locaciones.value[index] = res.data
        }

        console.log('Locacion actualizada con exito')
        showEditModal.value = false
        displayToast('Locacion actualizada', 'success')
    } catch (err) {
        console.error('Error al actualizar la locacion: ', err)
        var errorMensj = 'Error al actualizar la locacion'
        if (err.response?.status === 409) {
            errorMensj = 'No se puede editar la locacion porque esta vinculada con proyecto(s)'
        }
        displayToast(errorMensj, 'error')
    } finally {
        isUpdating.value = false
    }
}

onMounted(() => {
    getLocaciones()
})
</script>
