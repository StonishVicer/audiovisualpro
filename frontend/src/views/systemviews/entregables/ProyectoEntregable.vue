<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import Confirmation from '../../../components/Confirmation.vue'
import { onMounted, ref, computed } from 'vue'
import api from '../../../services/api.js'

const entregables = ref([])
const estados = ref([])
const proyectos = ref([])
const searchQuery = ref('')

const id_entregable_editar = ref(null)
const titulo = ref('')
const fileLink = ref('')
const fecha_entrega = ref('')
const selectedEstado = ref('')
const selectedProyecto = ref(null)

const showModal = ref(false)
const isConnecting = ref(false)
const error = ref(false)
const loadingEntregables = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const showConfirmation = ref(false)
const entregableDeleteID = ref(null)

// --- COMPUTADOS ---

// Calcula la fecha de hoy en formato YYYY-MM-DD para el atributo min=""
const todayDate = computed(() => {
    return new Date().toISOString().split('T')[0]
})

const entregablesFiltrados = computed(() => {
    if (!searchQuery.value) return entregables.value
    return entregables.value.filter(e => 
        e.titulo?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// --- HELPERS VISUALES ---
const getEstadoInfo = (idEstado) => {
    const estado = estados.value.find(e => e.id_estado_entregable === idEstado)
    const nombre = estado ? estado.nombre_estado : 'Sin Estado'
    
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

const limpiarCampos = () => {
    titulo.value = ''
    fileLink.value = ''
    fecha_entrega.value = ''
    selectedEstado.value = ''
    selectedProyecto.value = null
    id_entregable_editar.value = null
    error.value = false
}

const validarFormulario = () => {
    if (!titulo.value.trim()) return false
    
    if (!selectedProyecto.value) return false
    
    // 3. Link Obligatorio (ya que quitamos archivo, el link es lo único que queda)
    if (!fileLink.value.trim()) return false

    // 4. Validar Fecha (No permitir fechas pasadas)
    if (fecha_entrega.value) {
        if (fecha_entrega.value < todayDate.value) {
            displayToast('La fecha no puede ser anterior a hoy', 'error')
            return false
        }
    }

    return true
}

// --- API CALLS ---

const getEstados = async () => {
    try {
        const res = await api.get('/api/estadosentregable') 
        estados.value = res.data || []
    } catch (err) { console.error(err) }
}

const getProyectos = async () => {
    try {
        const res = await api.get('/api/proyectos')
        proyectos.value = res.data || []
    } catch (err) { console.error(err) }
}

const getEntregables = async () => {
    loadingEntregables.value = true
    try {
        const res = await api.get('/api/entregables')
        entregables.value = res.data || []
    } catch (err) {
        console.error(err)
        displayToast('Error de conexión', 'error')
    } finally {
        loadingEntregables.value = false
    }
}

const handleSubmit = async () => {
    isConnecting.value = true
    try {
        if (!validarFormulario()) {
            if (!fecha_entrega.value || fecha_entrega.value >= todayDate.value) {
                 error.value = true; 
            }
            isConnecting.value = false; 
            return
        }
        error.value = false

    
        
        const payload = {
            titulo: titulo.value,
            link: fileLink.value,
            fecha_entrega: fecha_entrega.value,
            id_estado_entregable: selectedEstado.value || null,
            id_proyecto: selectedProyecto.value
        }

        let res
        if (id_entregable_editar.value) {
            // PUT
            res = await api.put(`/api/entregables/${id_entregable_editar.value}`, payload)
            const idx = entregables.value.findIndex(e => e.id === id_entregable_editar.value)
            if (idx !== -1) {
                entregables.value[idx] = { ...entregables.value[idx], ...res.data.entregable } 
            }
            displayToast('Entregable actualizado', 'success')
            getEntregables() 
        } else {
            // POST
            res = await api.post('/api/entregables', payload)
            entregables.value.unshift(res.data)
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

const openEditModal = (item) => {
    limpiarCampos()
    id_entregable_editar.value = item.id
    titulo.value = item.titulo
    fileLink.value = item.link || ''
    selectedEstado.value = item.id_estado_entregable || ''
    selectedProyecto.value = item.id_proyecto || null 
    if(item.fecha_entrega) {
        fecha_entrega.value = item.fecha_entrega.split('T')[0]
    }
    showModal.value = true
}

onMounted(() => {
    getEstados()
    getProyectos()
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
                            <th class="px-4 py-2 text-left">Proyecto</th>
                            <th class="px-4 py-2 text-left">Link</th>
                            <th class="px-4 py-2 text-left">Fecha Entrega</th>
                            <th class="px-4 py-2 text-left">Estado</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in entregablesFiltrados" :key="item.id" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2 font-medium">{{ item.titulo }}</td>
                            
                            <td class="px-4 py-2 text-gray-700">
                                {{ proyectos.find(p => p.id_proyecto === item.id_proyecto)?.nombre_proyecto || 'N/A' }}
                            </td>
                            
                            <td class="px-4 py-2 text-sm">
                                <div v-if="item.link">
                                    <a :href="item.link" target="_blank" class="flex items-center text-blue-600 hover:underline">
                                        <Icon icon="mdi:link" class="mr-1" /> Link Externo
                                    </a>
                                </div>
                                <div v-else class="text-gray-400 italic">Sin enlace</div>
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
                    Complete Título, Proyecto y Link obligatorios.
                </div>

                <form @submit.prevent="handleSubmit" class="mb-2">
                    
                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Título</label>
                        <input type="text" v-model="titulo" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Ej: Video Final v1">
                    </div>

                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Proyecto</label>
                        <select v-model="selectedProyecto" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                            <option :value="null">-- Seleccionar Proyecto --</option>
                            <option v-for="p in proyectos" :key="p.id_proyecto" :value="p.id_proyecto">
                                {{ p.nombre_proyecto }}
                            </option>
                        </select>
                    </div>

                    <div class="flex space-x-2 mb-4">
                        <div class="flex flex-col w-1/2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Estado</label>
                            <select v-model="selectedEstado" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                                <option value="">-- Estado --</option>
                                <option v-for="e in estados" :key="e.id_estado_entregable" :value="e.id_estado_entregable">{{ e.nombre_estado }}</option>
                            </select>
                        </div>
                        <div class="flex flex-col w-1/2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Fecha Entrega</label>
                            <input 
                                type="date" 
                                v-model="fecha_entrega" 
                                :min="todayDate" 
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                        </div>
                    </div>

                    <div class="flex flex-col mb-4">
                        <label class="text-sm font-semibold text-gray-500 mb-1">Link Externo (Youtube/Drive)</label>
                        <div class="relative">
                            <Icon icon="mdi:link" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" />
                            <input type="url" v-model="fileLink" class="transition w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="https://...">
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