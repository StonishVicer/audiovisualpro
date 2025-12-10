<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import { onMounted, ref, computed } from 'vue'
import api from '../../../services/api.js'
import Confirmation from '../../../components/Confirmation.vue'

// --- ESTADO ---
const pagos = ref([])
const personal = ref([]) 
// CAMBIO: Lista estática de categorías (Strings directos)
const categorias = ref(['Sueldo', 'Pagos Extra', 'Bonificación'])

// --- FORMULARIO ---
const form = ref({
    id_personal: '',
    categoria_pg: '', // CAMBIO: Ahora guarda el string directo
    monto_pagado: '',
    fecha_pago: new Date().toISOString().slice(0,10),
    motivo_pago: ''
})

// --- UI STATES ---
const showModal = ref(false)
const isConnecting = ref(false)
const error = ref(false)
const loadingPagos = ref(false)
const searchQuery = ref('')

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showConfirmation = ref(false)
const pagoDeleteID = ref(null)

// --- HELPERS ---
const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000);
}

const limpiarCampos = () => {
    form.value = {
        id_personal: '',
        categoria_pg: '',
        monto_pagado: '',
        fecha_pago: new Date().toISOString().slice(0,10),
        motivo_pago: ''
    }
    error.value = false
}

const formatDate = (dateString) => {
    if (!dateString) return '—'
    const datePart = dateString.toString().split('T')[0]
    const [year, month, day] = datePart.split('-')
    return `${day}/${month}/${year}`
}

// --- FILTER ---
const filteredPagos = computed(() => {
    const q = searchQuery.value.toLowerCase()
    if (!q) return pagos.value
    return pagos.value.filter(p => 
        (p.nombre_personal || '').toLowerCase().includes(q) ||
        (p.categoria_pg || '').toLowerCase().includes(q) || // Busca también por categoría
        (p.motivo_pago || '').toLowerCase().includes(q)
    )
})

// --- API ACTIONS ---

// 1. Cargar Personal
const getPersonal = async () => {
    try {
        const res = await api.get('/api/personal')
        personal.value = res.data
    } catch (err) {
        console.error('Error cargando personal:', err)
        displayToast('Error cargando lista de personal', 'error')
    }
}

// 2. Cargar Pagos
const getPagos = async () => {
    loadingPagos.value = true
    try {
        const res = await api.get('/api/pagos_personal')
        pagos.value = res.data
    } catch (err) {
        console.error('Error cargando pagos:', err)
    } finally {
        loadingPagos.value = false
    }
}

// 3. Crear Pago
const createPago = async () => {
    if (!form.value.id_personal || !form.value.categoria_pg || !form.value.monto_pagado || !form.value.fecha_pago) {
        error.value = true
        return
    }
    
    isConnecting.value = true
    error.value = false

    try {
        // CAMBIO: Enviamos el payload limpio
        const payload = {
            id_personal: Number(form.value.id_personal),
            categoria_pg: form.value.categoria_pg, // String directo
            monto_pagado: Number(form.value.monto_pagado),
            fecha_pago: form.value.fecha_pago,
            motivo_pago: form.value.motivo_pago
        }

        const res = await api.post('/api/pagos_personal', payload)
        
        // --- ACTUALIZACIÓN UI ---
        const nuevoPago = res.data
        
        // Solo necesitamos buscar el nombre del personal
        const personalEncontrado = personal.value.find(p => p.id_personal == nuevoPago.id_personal)
        nuevoPago.nombre_personal = personalEncontrado ? personalEncontrado.nombre_personal : '...'
        
        // La categoría ya viene lista en el objeto porque la enviamos como string
        // (El backend devuelve lo que insertó)
        
        pagos.value.unshift(nuevoPago) 
        
        limpiarCampos()
        showModal.value = false
        displayToast('Pago registrado correctamente', 'success')

    } catch (err) {
        console.error('Error al crear pago:', err);
        displayToast('Error al registrar el pago', 'error')
    } finally {
        isConnecting.value = false
    }
}

// 4. Eliminar Pago
const requestDeletePago = (id) => {
    pagoDeleteID.value = id
    showConfirmation.value = true
}

const deletePago = async () => {
    const id = pagoDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/pagos_personal/${id}`)
        pagos.value = pagos.value.filter(p => p.id_pago !== id)
        displayToast('Pago eliminado', 'success')
    } catch (err) {
        console.error('Error al eliminar:', err)
        displayToast('Error al eliminar el pago', 'error')
    } finally {
        isConnecting.value = false
    }
}

onMounted(() => {
    getPersonal()
    getPagos()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Pagos</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="showModal = true" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="mdi:cash-plus" width="25" height="25" class="mr-2" />
                    Nuevo Pago
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
                        v-model="searchQuery"
                        type="text"
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar por personal, categoría o motivo..."
                    >
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingPagos">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:loading" width="25" height="25" class="mr-2 animate-spin" />
                            Cargando pagos...
                        </div>
                    </div>
                </div>
                
                <table v-else-if="filteredPagos.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">Personal</th>
                            <th class="px-4 py-2 text-left">Categoría</th>
                            <th class="px-4 py-2 text-left">Monto ($)</th>
                            <th class="px-4 py-2 text-left">Fecha</th>
                            <th class="px-4 py-2 text-left">Motivo</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pago in filteredPagos" :key="pago.id_pago" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2 font-medium">{{ pago.nombre_personal || pago.personal?.nombre_personal || '—' }}</td>
                            
                            <td class="px-4 py-2">
                                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    {{ pago.categoria_pg }}
                                </span>
                            </td>

                            <td class="px-4 py-2 font-bold text-green-700">${{ Number(pago.monto_pagado).toFixed(2) }}</td>
                            <td class="px-4 py-2 text-gray-600">{{ formatDate(pago.fecha_pago) }}</td>
                            <td class="px-4 py-2 text-gray-500 italic text-sm truncate max-w-xs">{{ pago.motivo_pago || '—' }}</td>
                            <td class="px-4 py-2 flex items-center gap-2">
                                <button
                                    @click="requestDeletePago(pago.id_pago)"
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
                            <Icon icon="mdi:alert-circle-outline" width="25" height="25" class="mr-2" />
                            No hay pagos registrados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            size="md"
            title="Nuevo Pago"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md mb-3">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete los campos obligatorios.
                </div>

                <form @submit.prevent="createPago" class="mb-2">
                    <div class="mb-2 space-y-3">
                        
                        <div class="flex flex-col">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Personal</label>
                            <select v-model="form.id_personal" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                                <option value="" disabled>-- Seleccionar --</option>
                                <option v-for="p in personal" :key="p.id_personal" :value="p.id_personal">
                                    {{ p.nombre_personal }} {{ p.apellido_personal || '' }}
                                </option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="flex flex-col">
                                <label class="text-sm font-semibold text-gray-500 mb-1">Categoría</label>
                                <select v-model="form.categoria_pg" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                                    <option value="" disabled>-- Seleccionar --</option>
                                    <option v-for="cat in categorias" :key="cat" :value="cat">
                                        {{ cat }}
                                    </option>
                                </select>
                            </div>

                            <div class="flex flex-col">
                                <label class="text-sm font-semibold text-gray-500 mb-1">Monto ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model="form.monto_pagado"
                                    class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="0.00"
                                >
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Fecha</label>
                            <input
                                type="date"
                                v-model="form.fecha_pago"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                        </div>

                        <div class="flex flex-col">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Motivo / Descripción</label>
                            <textarea
                                rows="2"
                                v-model="form.motivo_pago"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Ej: Adelanto de quincena..."
                            ></textarea>
                        </div>

                    </div>
                    
                    <button type="submit" class="w-full mt-4 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-2 rounded-lg transition-colors">
                        <Icon v-if="isConnecting" icon="eos-icons:loading" class="animate-spin mr-2" />
                        Registrar Pago
                    </button>
                </form>

                <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-2 rounded-lg transition-colors mt-2">
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
            title="Eliminar pago"
            message="¿Está seguro/a que desea eliminar este registro de pago?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deletePago"
            @cancel="showConfirmation = false"
        />
    </div>
</template>