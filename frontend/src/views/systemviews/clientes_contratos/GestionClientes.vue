<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import { onMounted, ref, computed } from 'vue' // Importar 'computed'
import api from '../../../services/api.js'
import Confirmation from '../../../components/Confirmation.vue'

const clientes = ref([])

// --- ESTADO DE FORMULARIO DE CLIENTE ---
const clienteEditandoId = ref(null) // Nuevo: ID del cliente que se está editando (null = creando)
const isEditing = computed(() => clienteEditandoId.value !== null) // Nuevo: Indica si estamos en modo edición

const rif_cliente = ref('')
const nombre_cliente = ref('')
const email_cliente = ref('')
const telefono_cliente = ref('')
const codigoRif = ref('V')
const codigoTelefono = ref('0414')

// --- ESTADO GENERAL ---
const showModal = ref(false)
const isConnecting = ref(false)
const error = ref(false)
const loadingClientes = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showConfirmation = ref(false)
const clienteDeleteID = ref(null)

const searchTerm = ref('')

// --- FUNCIONES DE UTILIDAD ---

const filteredClientes = computed(() => {
    if (!searchTerm.value) {
        return clientes.value
    }

    const searchLower = searchTerm.value.toLowerCase().trim()

    return clientes.value.filter(cliente => {
        const nombre = cliente.nombre_cliente.toLowerCase()
        const rif = cliente.rif_cliente.toLowerCase()
        const email = cliente.email_cliente.toLowerCase()

        return (
            nombre.includes(searchLower) ||
            rif.includes(searchLower) ||
            email.includes(searchLower)
        )
    })
})

const requestDeleteCliente = (id) => {
    clienteDeleteID.value = id
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

const validarFormulario = () => {
    const { nombre, rif, email, telefono } = {
        nombre: nombre_cliente.value.trim(),
        rif: rif_cliente.value.trim(),
        email: email_cliente.value.trim(),
        telefono: telefono_cliente.value.trim()
    };
    // Validación de longitud mínima (RIF 9, Teléfono 7)
    if (!nombre || rif.length < 9 || !email || telefono.length < 7) return false
    return true
}

const limpiarCampos = () => {
    clienteEditandoId.value = null // Limpiar ID de edición
    nombre_cliente.value = ''
    rif_cliente.value = ''
    email_cliente.value = ''
    telefono_cliente.value = ''
    codigoRif.value = 'V'
    codigoTelefono.value = '0414'
    error.value = false // Limpiar error
}

// --- GESTIÓN DE MODAL Y FORMULARIO ---

// Nuevo: Prepara el formulario para editar
const requestEditCliente = (cliente) => {
    // 1. Establecer el ID del cliente a editar
    clienteEditandoId.value = cliente.id_cliente
    
    // 2. Separar RIF y Teléfono en código + número
    const [rifCode, rifNum] = cliente.rif_cliente.match(/^([VEJG])(\d{9,10})$/)?.slice(1) || ['V', cliente.rif_cliente.slice(1)];
    const [phoneCode, phoneNum] = cliente.telefono_cliente.match(/^(\d{4})(\d{7})$/)?.slice(1) || ['0414', cliente.telefono_cliente.slice(4)];

    // 3. Cargar los datos en los v-model del formulario
    nombre_cliente.value = cliente.nombre_cliente
    rif_cliente.value = rifNum
    email_cliente.value = cliente.email_cliente
    telefono_cliente.value = phoneNum
    codigoRif.value = rifCode
    codigoTelefono.value = phoneCode

    // 4. Abrir el modal
    showModal.value = true
}

// Sobreescribir la función createCliente (ahora solo maneja la creación)
const createCliente = async () => {
    isConnecting.value = true

    try {
        if (!validarFormulario()) {
            error.value = true
            return
        }
        error.value = false

        const res = await api.post('/api/clientes', {
            nombre_cliente: nombre_cliente.value,
            rif_cliente: `${codigoRif.value}${rif_cliente.value}`,
            email_cliente: email_cliente.value,
            telefono_cliente: `${codigoTelefono.value}${telefono_cliente.value}`
        })

        clientes.value.push(res.data)
        limpiarCampos()
        showModal.value = false
        displayToast('Cliente creado', 'success')
    } catch (err) {
        console.error('Error al crear al cliente:', err);
        displayToast('Error al crear al cliente', 'error')
    } finally {
        isConnecting.value = false
    }
}

const updateCliente = async () => {
    const id = clienteEditandoId.value
    if (!id) return

    isConnecting.value = true

    try {
        if (!validarFormulario()) {
            error.value = true
            return
        }
        error.value = false

        const payload = {
            nombre_cliente: nombre_cliente.value,
            rif_cliente: `${codigoRif.value}${rif_cliente.value}`,
            email_cliente: email_cliente.value,
            telefono_cliente: `${codigoTelefono.value}${telefono_cliente.value}`
        }

        const res = await api.put(`/api/clientes/${id}`, payload)

        const index = clientes.value.findIndex(c => c.id_cliente === id)
        if (index !== -1) {
            clientes.value[index] = res.data
        }

        limpiarCampos()
        showModal.value = false
        displayToast('Cliente editado', 'success')
    } catch (err) {
        console.error('Error al editar al cliente:', err.response?.data?.message || err);
        const message = err.response?.status === 409 
            ? err.response.data.message
            : 'Error al editar al cliente'

        displayToast(message, 'error')
    } finally {
        isConnecting.value = false
    }
}

// Función unificada para el submit del formulario
const handleSubmit = () => {
    if (isEditing.value) {
        updateCliente()
    } else {
        createCliente()
    }
}

// Resto de funciones (getClientes y deleteCliente) se mantienen igual...
const getClientes = async () => {
    loadingClientes.value = true
    try {
        const res = await api.get('/api/clientes')
        clientes.value = res.data
    } catch (err) {
        console.log('Error al obtener los clientes:', err);
    } finally {
        loadingClientes.value = false
    }
}

const deleteCliente = async () => {
    const id = clienteDeleteID.value
    showConfirmation.value = false
    if (!id) return
    isConnecting.value = true

    try {
        await api.delete(`/api/clientes/${id}`)
        clientes.value = clientes.value.filter(cliente => cliente.id_cliente !== id)
        displayToast('Cliente eliminado', 'success')
    } catch (err) {
        console.error('Error al eliminar el cliente: ', err)
        displayToast('Error al eliminar el cliente', 'error')
    } finally {
        isConnecting.value = false
    }
}

onMounted(() => {
    getClientes()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestion de Clientes</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="limpiarCampos(); showModal = true;" 
                    class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="mdi:account-add" width="25" height="25" class="mr-2" />
                    Nuevo Cliente
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
                        v-model="searchTerm" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar cliente por Nombre, RIF o Email"
                    >
                </div>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingClientes">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            Cargando clientes...
                        </div>
                    </div>
                </div>
                
                <table v-else-if="filteredClientes.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900 sticky top-0"> 
                            <th class="px-4 py-2 text-left">Nombre</th>
                            <th class="px-4 py-2 text-left">RIF</th>
                            <th class="px-4 py-2 text-left">Telefono</th>
                            <th class="px-4 py-2 text-left">Email</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cliente in filteredClientes" :key="cliente.id_cliente" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">{{ cliente.nombre_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.rif_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.telefono_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.email_cliente }}</td>
                            <td class="px-4 py-2 flex items-center gap-2">
                                <button
                                    @click="requestEditCliente(cliente)" class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    @click="requestDeleteCliente(cliente.id_cliente)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" />
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div v-else-if="!loadingClientes && searchTerm">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-orange-500 items-center justify-center w-full bg-orange-100 border border-orange-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:alert-circle" width="25" height="25" class="mr-2" />
                            No se encontraron resultados para "{{ searchTerm }}".
                        </div>
                    </div>
                </div>

                <div v-else-if="!loadingClientes">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            No hay clientes creados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            size="sm"
            :title="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'" >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form @submit.prevent="handleSubmit" class="mb-2"> <div class="mb-2">
                        <div class="flex flex-col mb-2">
                            <label for="nombre" class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                            <input
                                type="text"
                                v-model="nombre_cliente"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Nombre"
                            >
                        </div>
                        
                        <div class="flex flex-col mb-2">
                            <label for="rif" class="text-sm font-semibold text-gray-500 mb-1">RIF</label>
                            <div class="flex items-center justify-between space-x-2">
                                <select
                                    v-model="codigoRif"
                                    class="w-[100px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                                >
                                    <option>V</option>
                                    <option>E</option>
                                    <option>J</option>
                                    <option>G</option>
                                </select>
                                <input
                                    type="text"
                                    v-model="rif_cliente"
                                    @input="rif_cliente = rif_cliente.replace(/[^0-9]/g, '').slice(0, 9)"
                                    class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                                    placeholder="RIF"
                                >
                            </div>
                        </div>
                        
                        <div class="flex flex-col mb-2">
                            <label for="telefono" class="text-sm font-semibold text-gray-500 mb-1">Telefono</label>
                            <div class="flex items-center justify-between space-x-2">
                                <select
                                    v-model="codigoTelefono"
                                    class="w-[100px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                                >
                                    <option>0414</option>
                                    <option>0424</option>
                                    <option>0416</option>
                                    <option>0426</option>
                                    <option>0412</option>
                                    <option>0422</option>
                                </select>
                                <input
                                    type="text"
                                    v-model="telefono_cliente"
                                    @input="telefono_cliente = telefono_cliente.replace(/[^0-9]/g, '').slice(0, 7)"
                                    class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                                    placeholder="Teléfono"
                                    maxlength="7"
                                >
                            </div>
                        </div>
                        
                        <div class="flex flex-col mb-2">
                            <label for="email" class="text-sm font-semibold text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                v-model="email_cliente"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Email"
                            >
                        </div>
                    </div>
                    
                    <button type="submit" 
                        class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                        {{ isEditing ? 'Guardar Cambios' : 'Crear cliente' }} </button>
                </form>
                <button @click="limpiarCampos(); showModal = false;" 
                    class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors mt-2">
                    Cancelar
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
            title="Eliminar cliente"
            message="¿Está seguro/a que desea eliminar este cliente?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deleteCliente"
            @cancel="showConfirmation = false"
        />
    </div>
</template>