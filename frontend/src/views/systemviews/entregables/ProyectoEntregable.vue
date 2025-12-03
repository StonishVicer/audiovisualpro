<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import Confirmation from '../../../components/Confirmation.vue'
import { onMounted, ref, computed } from 'vue'
import api from '../../../services/api.js'

// --- DATOS ---
const entregables = ref([])
const estados = ref([]) // Lista para traducir ID -> Nombre
const searchQuery = ref('')

// --- FORMULARIO ---
const id_entregable_editar = ref(null)
const titulo = ref('')
const fileLink = ref('')
const fecha_entrega = ref('')
const file = ref(null)

// --- UI STATES ---
const showModal = ref(false)
const isConnecting = ref(false)
const error = ref(false)
const loadingEntregables = ref(false)

// --- TOAST & CONFIRM ---
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const showConfirmation = ref(false)
const entregableDeleteID = ref(null)

// --- COMPUTADOS ---
const nombreArchivo = computed(() => file.value ? file.value.name : '')

const entregablesFiltrados = computed(() => {
    if (!searchQuery.value) return entregables.value
    return entregables.value.filter(e => 
        e.titulo?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// --- HELPERS VISUALES (El truco para los colores) ---
const getEstadoInfo = (idEstado) => {
    // 1. Busamos el nombre del estado usando el ID
    const estado = estados.value.find(e => e.id_estado_entregable === idEstado)
    const nombre = estado ? estado.nombre_estado : 'Sin Estado'
    
    // 2. Asignamos color según el texto (ya que la BD no tiene color)
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200'
    const n = nombre.toLowerCase()

    if (n.includes('pendiente') || n.includes('espera')) colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'
    else if (n.includes('listo') || n.includes('aprobado') || n.includes('final')) colorClass = 'bg-green-100 text-green-800 border-green-200'
    else if (n.includes('error') || n.includes('rechazado') || n.includes('corregir')) colorClass = 'bg-red-100 text-red-800 border-red-200'
    else if (n.includes('proceso') || n.includes('revisión')) colorClass = 'bg-blue-100 text-blue-800 border-blue-200'

    return { nombre, colorClass }
}

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
}

// --- LIMPIEZA ---
const limpiarCampos = () => {
    titulo.value = ''
    fileLink.value = ''
    fecha_entrega.value = ''
    file.value = null
    id_entregable_editar.value = null
    error.value = false
    const fileInput = document.getElementById('file-upload')
    if(fileInput) fileInput.value = ''
}

const validarFormulario = () => {
    if (!titulo.value.trim()) return false
    // Debe haber link O archivo O estar editando (y mantener el anterior)
    if (!fileLink.value.trim() && !file.value && !id_entregable_editar.value) return false
    return true
}

// --- API CALLS ---

// 1. Obtener Estados (Para poder mostrar el nombre en la tabla)
const getEstados = async () => {
    try {
        const res = await api.get('/api/estadosentregable') // Asegurate que esta ruta coincida con tu server.js
        estados.value = res.data || []
    } catch (err) {
        console.error('Error cargando estados:', err)
    }
}

// 2. Obtener Entregables
const getEntregables = async () => {
    loadingEntregables.value = true
    try {
        const res = await api.get('/api/entregables')
        entregables.value = res.data || []
    } catch (err) {
        console.error('Error al obtener entregables:', err)
        displayToast('Error de conexión', 'error')
    } finally {
        loadingEntregables.value = false
    }
}

// 3. Crear / Editar
const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) file.value = f
    else file.value = null
}

const handleSubmit = async () => {
    isConnecting.value = true
    try {
        if (!validarFormulario()) {
            error.value = true; isConnecting.value = false; return
        }
        error.value = false

        // Usamos FormData para enviar archivo + texto
        const fd = new FormData()
        fd.append('titulo', titulo.value)
        fd.append('link', fileLink.value)
        fd.append('fecha_entrega', fecha_entrega.value) // Agregamos fecha
        if (file.value) {
            fd.append('archivo', file.value)
        }

        let res
        if (id_entregable_editar.value) {
            // PUT
            res = await api.put(`/api/entregables/${id_entregable_editar.value}`, fd)
            // Actualizamos la lista localmente
            const idx = entregables.value.findIndex(e => e.id === id_entregable_editar.value)
            if (idx !== -1) {
                // Mantenemos el ID de estado viejo o recargamos todo
                // Para simplificar, recargamos la lista o mezclamos datos:
                entregables.value[idx] = { ...entregables.value[idx], ...res.data.entregable } 
            }
            displayToast('Entregable actualizado', 'success')
            getEntregables() // Recargamos para ver cambios limpios
        } else {
            // POST
            res = await api.post('/api/entregables', fd)
            entregables.value.unshift(res.data) // Agregamos al principio
            displayToast('Entregable creado', 'success')
        }

        limpiarCampos()
        showModal.value = false

    } catch (err) {
        console.error(err)
        displayToast('Error al guardar', 'error')
    } finally {
        isConnecting.value = false
    }
}

// 4. Eliminar
const requestDeleteEntregable = (id) => {
    entregableDeleteID.value = id
    showConfirmation.value = true
}

const deleteEntregable = async () => {
    const id = entregableDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/entregables/${id}`)
        entregables.value = entregables.value.filter(e => e.id !== id)
        displayToast('Entregable eliminado', 'success')
    } catch (err) {
        console.error(err)
        displayToast('Error al eliminar', 'error')
    } finally {
        isConnecting.value = false
    }
}

// 5. Preparar Edición
const openEditModal = (item) => {
    limpiarCampos()
    id_entregable_editar.value = item.id
    titulo.value = item.titulo
    fileLink.value = item.link || ''
    // Convertimos fecha ISO a YYYY-MM-DD para el input date
    if(item.fecha_entrega) {
        fecha_entrega.value = item.fecha_entrega.split('T')[0]
    }
    showModal.value = true
}

onMounted(() => {
    getEstados() // Cargamos los estados primero
    getEntregables()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Entregables</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="showModal = true; limpiarCampos()" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="mdi:file-plus" width="25" height="25" class="mr-2" />
                    Nuevo Entregable
                </button>
            </div>
        </div>

        <div class="mb-3">
            <div class="flex space-x-2">
                <div class="relative flex-1">
                    <Icon icon="material-symbols:search" width="25" height="25" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input type="text" v-model="searchQuery" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar por título...">
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingEntregables">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:loading" width="25" height="25" class="mr-2 animate-spin" />
                            Cargando...
                        </div>
                    </div>
                </div>

                <table v-else-if="entregablesFiltrados.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">Título</th>
                            <th class="px-4 py-2 text-left">Contenido</th>
                            <th class="px-4 py-2 text-left">Fecha Entrega</th>
                            <th class="px-4 py-2 text-left">Estado</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in entregablesFiltrados" :key="item.id" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2 font-medium">{{ item.titulo }}</td>
                            
                            <td class="px-4 py-2">
                                <div v-if="item.link" class="flex items-center text-blue-600">
                                    <Icon icon="mdi:link" width="18" class="mr-1"/>
                                    <a :href="item.link" target="_blank" class="hover:underline text-sm truncate max-w-[150px]">Link Externo</a>
                                </div>
                                <div v-else-if="item.archivo" class="flex items-center text-purple-600">
                                    <Icon icon="mdi:paperclip" width="18" class="mr-1"/>
                                    <a :href="item.archivo.url" target="_blank" class="hover:underline text-sm truncate max-w-[150px]">Descargar Archivo</a>
                                </div>
                                <div v-else class="text-gray-400 text-sm italic">Sin contenido</div>
                            </td>

                            <td class="px-4 py-2 text-sm text-gray-600">
                                {{ item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString('es-ES') : '-' }}
                            </td>

                            <td class="px-4 py-2">
                                <span :class="['px-2 py-1 rounded-full text-xs font-bold border', getEstadoInfo(item.id_estado_entregable).colorClass]">
                                    {{ getEstadoInfo(item.id_estado_entregable).nombre }}
                                </span>
                            </td>

                            <td class="px-4 py-2 flex items-center gap-2">
                                <button @click="openEditModal(item)" class="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors" title="Editar">
                                    <Icon icon="material-symbols:edit" width="20" height="20" />
                                </button>
                                <button @click="requestDeleteEntregable(item.id)" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors" title="Eliminar">
                                    <Icon icon="material-symbols:delete" width="20" height="20" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else>
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:alert-circle-outline" width="25" height="25" class="mr-2" />
                            No hay entregables registrados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal v-if="showModal" :show="showModal" @close="showModal = false" size="md" :title="id_entregable_editar ? 'Editar Entregable' : 'Nuevo Entregable'">
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mb-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" class="mr-2" />
                    Complete el título y agregue contenido.
                </div>

                <form @submit.prevent="handleSubmit" class="mb-2">
                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Título</label>
                        <input type="text" v-model="titulo" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Ej: Video Final v1">
                    </div>

                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Fecha de Entrega Estimada</label>
                        <input type="date" v-model="fecha_entrega" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                    </div>

                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Link Externo (Youtube/Drive)</label>
                        <div class="relative">
                            <Icon icon="mdi:link" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" />
                            <input type="url" v-model="fileLink" class="transition w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="https://...">
                        </div>
                    </div>

                    <div class="relative flex py-2 items-center">
                        <div class="flex-grow border-t border-gray-200"></div>
                        <span class="flex-shrink-0 mx-4 text-gray-400 text-xs">O SUBIR ARCHIVO LOCAL</span>
                        <div class="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div class="mb-4">
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all hover:border-green-400 hover:bg-green-50 group">
                            <input @change="onFileChange" type="file" class="hidden" id="file-upload" />
                            <label for="file-upload" class="cursor-pointer flex flex-col items-center">
                                <Icon icon="mdi:cloud-upload" width="40" height="40" class="text-gray-400 group-hover:text-green-500 mb-2 transition-colors" />
                                <p class="text-gray-600 mb-1 font-medium">Click para seleccionar archivo</p>
                            </label>
                        </div>
                        <div v-if="nombreArchivo" class="mt-2 flex items-center p-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
                            <Icon icon="mdi:file-check" width="20" class="mr-2"/>
                            <span class="text-sm truncate font-medium">{{ nombreArchivo }}</span>
                            <button type="button" @click="file = null" class="ml-auto text-green-700 hover:text-red-500"><Icon icon="mdi:close" width="18"/></button>
                        </div>
                    </div>

                    <div class="flex justify-end mt-4">
                        <button type="submit" :disabled="isConnecting" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors disabled:opacity-50">
                            <Icon v-if="isConnecting" icon="mdi:loading" class="animate-spin mr-2"/>
                            {{ id_entregable_editar ? 'Actualizar' : 'Guardar' }}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>

        <Toast :show="showToast" :message="toastMessage" :type="toastType" />
        <Confirmation :show="showConfirmation" @confirm="deleteEntregable" @cancel="showConfirmation = false" message="¿Eliminar este entregable?" />
    </div>
</template>