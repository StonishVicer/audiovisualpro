<script setup>
import { Icon } from '@iconify/vue';
import { ref, onMounted, computed } from 'vue'
import api from '../../../services/api.js' // Asegúrate que la ruta sea correcta
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'

const contratos = ref([])
const clientes = ref([])
const proyectos = ref([])

const id_proyecto_seleccionado = ref('')
const id_cliente_seleccionado = ref('')
const fecha_firma = ref('')
const monto_contrato = ref('')
const descripcion_servicios = ref('')

const showModal = ref(false)
const loadingData = ref(false)
const isConnecting = ref(false)
const error = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
}

const formatearFecha = (fecha) => {
    if (!fecha) return '---'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-VE')
}

const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(monto)
}

const limpiarCampos = () => {
    id_proyecto_seleccionado.value = ''
    id_cliente_seleccionado.value = ''
    fecha_firma.value = ''
    monto_contrato.value = ''
    descripcion_servicios.value = ''
    error.value = false
}

const getContratos = async () => {
    loadingData.value = true
    try {
        const res = await api.get('/api/contratos')
        contratos.value = res.data
    } catch (err) {
        console.error("Error cargando contratos:", err)
        displayToast('Error al cargar contratos', 'error')
    } finally {
        loadingData.value = false
    }
}

const cargarListasDesplegables = async () => {
    try {
        const [resClientes, resProyectos] = await Promise.all([
            api.get('/api/clientes'),
            api.get('/api/proyectos')
        ])
        clientes.value = resClientes.data
        proyectos.value = resProyectos.data
    } catch (err) {
        console.error("Error cargando listas:", err)
        displayToast('Error cargando datos de formulario', 'error')
    }
}

const createContrato = async () => {
    if (!id_proyecto_seleccionado.value || !id_cliente_seleccionado.value || !fecha_firma.value || !monto_contrato.value || !descripcion_servicios.value) {
        error.value = true
        return
    }
    
    isConnecting.value = true
    error.value = false

    try {
        const payload = {
            id_proyecto: id_proyecto_seleccionado.value,
            id_cliente: id_cliente_seleccionado.value,
            fecha_firma: fecha_firma.value,
            monto_contrato: monto_contrato.value,
            descripcion_servicios: descripcion_servicios.value
        }

        const res = await api.post('/api/contratos', payload)

        const clienteNom = clientes.value.find(c => c.id_cliente === payload.id_cliente)?.nombre_cliente
        const proyectoNom = proyectos.value.find(p => p.id_proyecto === payload.id_proyecto)?.nombre_proyecto

        contratos.value.push({
            ...res.data,
            ...payload,
            nombre_cliente: clienteNom,
            nombre_proyecto: proyectoNom
        })

        displayToast('Contrato registrado exitosamente', 'success')
        showModal.value = false
        limpiarCampos()

    } catch (err) {
        console.error(err)
        displayToast('Error al guardar el contrato', 'error')
    } finally {
        isConnecting.value = false
    }
}

onMounted(() => {
    getContratos()
    cargarListasDesplegables()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg text-gray-700">Gestión de Contratos</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="showModal = true" 
                    class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors shadow-sm">
                    <Icon icon="mdi:file-sign" width="25" height="25" class="mr-2" />
                    Nuevo Contrato
                </button>
            </div>
        </div>

        <div class="mb-3">
            <div class="flex space-x-2">
                <div class="relative flex-1">
                    <Icon icon="material-symbols:search" width="25" height="25"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text"
                        class="transition w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                        placeholder="Buscar por cliente, proyecto o ID..." />
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm min-h-[400px]">
            <div v-if="loadingData">
                <div class="flex items-center justify-center text-center mt-3">
                    <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                        <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                        Cargando contratos...
                    </div>
                </div>
            </div>

            <div v-else-if="contratos.length > 0">
                <table class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left font-bold">ID</th>
                            <th class="px-4 py-2 text-left font-bold">Proyecto</th>
                            <th class="px-4 py-2 text-left font-bold">Cliente Contratante</th>
                            <th class="px-4 py-2 text-left font-bold">Fecha Firma</th>
                            <th class="px-4 py-2 text-right font-bold">Monto Total</th>
                            <th class="px-4 py-2 text-center font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="contrato in contratos" :key="contrato.id_contrato"
                            class="border-b border-gray-100 hover:bg-green-50/50 transition duration-150">
                            
                            <td class="px-4 py-3 font-mono text-gray-500">{{ contrato.id_contrato }}</td>
                            
                            <td class="px-4 py-3 font-medium text-gray-800">
                                {{ contrato.nombre_proyecto || 'Cargando...' }}
                            </td>
                            
                            <td class="px-4 py-3 text-gray-600">
                                <div class="flex items-center gap-1">
                                    <Icon icon="mdi:account" class="text-gray-400"/> 
                                    {{ contrato.nombre_cliente || 'Cargando...' }}
                                </div>
                            </td>
                            
                            <td class="px-4 py-3 text-gray-600">
                                {{ formatearFecha(contrato.fecha_firma) }}
                            </td>
                            
                            <td class="px-4 py-3 text-right font-bold text-green-600">
                                {{ formatearMoneda(contrato.monto_contrato) }}
                            </td>
                            
                            <td class="px-4 py-3 flex justify-center gap-2">
                                <button title="Ver Detalles"
                                    class="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition">
                                    <Icon icon="clarity:details-solid" width="20" />
                                </button>
                                <button title="Eliminar"
                                    class="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                                    <Icon icon="material-symbols:delete" width="20" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else>
                <div class="flex items-center justify-center text-center mt-3">
                    <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                        <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                        No hay contratos registrados.
                    </div>
                </div>
            </div>
        </div>

        <Modal v-if="showModal" :show="showModal" @close="showModal = false" title="Registrar Nuevo Contrato" size="lg">
            <div>
                <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                    <Icon icon="mdi:alert-circle" class="mr-2 text-lg" />
                    Por favor complete todos los campos requeridos.
                </div>

                <form @submit.prevent="createContrato">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="col-span-1">
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Proyecto</label>
                            <div class="relative">
                                <select v-model="id_proyecto_seleccionado" 
                                    class="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent appearance-none bg-white transition">
                                    <option value="" disabled>Seleccione un proyecto</option>
                                    <option v-for="p in proyectos" :key="p.id_proyecto" :value="p.id_proyecto">
                                        {{ p.nombre_proyecto }}
                                    </option>
                                </select>
                                <Icon icon="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>

                        <div class="col-span-1">
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Cliente</label>
                            <div class="relative">
                                <select v-model="id_cliente_seleccionado" 
                                    class="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent appearance-none bg-white transition">
                                    <option value="" disabled>Seleccione un cliente</option>
                                    <option v-for="c in clientes" :key="c.id_cliente" :value="c.id_cliente">
                                        {{ c.nombre_cliente }} ({{ c.rif_cliente }})
                                    </option>
                                </select>
                                <Icon icon="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>

                        <div class="col-span-1">
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Fecha de Firma</label>
                            <input type="date" v-model="fecha_firma"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
                        </div>

                        <div class="col-span-1">
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Monto del Contrato</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Bs.</span>
                                <input type="number" step="0.01" min="0" v-model="monto_contrato" placeholder="0.00"
                                    class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
                            </div>
                        </div>

                        <div class="col-span-1 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Descripción de Servicios</label>
                            <textarea v-model="descripcion_servicios" rows="3"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-transparent transition resize-none"
                                placeholder="Detalles de lo que incluye este contrato..."></textarea>
                        </div>

                    </div>

                    <div class="flex gap-3 mt-6">
                        <button type="button" @click="limpiarCampos" 
                            class="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition">
                            Limpiar
                        </button>
                        <button type="submit" :disabled="isConnecting"
                            class="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
                            <Icon v-if="isConnecting" icon="eos-icons:loading" class="mr-2" />
                            {{ isConnecting ? 'Guardando...' : 'Crear Contrato' }}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>

        <Toast v-model="showToast" :message="toastMessage" :type="toastType" />
    </div>
</template>