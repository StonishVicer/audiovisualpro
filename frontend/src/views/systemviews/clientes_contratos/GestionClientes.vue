<script setup>
import { Icon } from '@iconify/vue';
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import { onMounted, ref } from 'vue'
import api from '../../../services/api.js'

const clientes = ref([])

//cliente form
const rif_cliente = ref('')
const nombre_cliente = ref('')
const email_cliente = ref('')
const telefono_cliente = ref('')
const codigoRif = ref('V')
const codigoTelefono = ref('0414')

const showModal = ref(false)
const isLoading = ref(false)
const error = ref(false)
const loadingClientes = ref(false)

const validarFormulario = () => {
    const { nombre, rif, email, telefono } = {
        nombre: nombre_cliente.value.trim(),
        rif: rif_cliente.value.trim(),
        email: email_cliente.value.trim(),
        telefono: telefono_cliente.value.trim()
    };
    if (!nombre || rif.length < 9 || !email || telefono.length < 7) return false
    return true
}

const limpiarCampos = () => {
    nombre_cliente.value = ''
    rif_cliente.value = ''
    email_cliente.value = ''
    telefono_cliente.value = ''
    codigoRif.value = 'V'
    codigoTelefono.value = '0414'
}

const createCliente = async () => {
    isLoading.value = true

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

        console.log('Cliente creado:', res.data)
        clientes.value.push(res.data)
        limpiarCampos()
        showModal.value = false
    } catch (err) {
        console.error('Error al crear al cliente:', err);
    } finally {
        isLoading.value = false
    }
}

const getClientes = async () => {
    loadingClientes.value = true

    try {
        const res = await api.get('/api/clientes')
        clientes.value = res.data
        console.log('Clientes obtenidos:', clientes.value);
    } catch (err) {
        console.log('Error al obtener los clientes:', err);
    } finally {
        loadingClientes.value = false
    }
}

const deleteCliente = async (id) => {
    const confirmacion = confirm('Esta seguro/a que desea eliminar este cliente?')
    if (!confirmacion) return
    isLoading.value = true

    try {
        await api.delete(`/api/clientes/${id}`)
        clientes.value = clientes.value.filter(cliente => cliente.id_cliente !== id)
    } catch (err) {
        console.error('Error al eliminar el cliente: ', err)
    } finally {
        isLoading.value = false
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
                <button @click="showModal = true" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
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
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar cliente"
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
                <table v-else-if="clientes.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">Nombre</th>
                            <th class="px-4 py-2 text-left">RIF</th>
                            <th class="px-4 py-2 text-left">Telefono</th>
                            <th class="px-4 py-2 text-left">Email</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cliente in clientes" :key="cliente" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">{{ cliente.nombre_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.rif_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.telefono_cliente }}</td>
                            <td class="px-4 py-2">{{ cliente.email_cliente }}</td>
                            <td class="px-4 py-2 flex items-center gap-2">
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    @click="deleteCliente(cliente.id_cliente)"
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
                            No hay clientes creados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            title="Nuevo Cliente"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form @submit.prevent="createCliente" class="mb-2">
                    <div class="mb-2">
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
                    <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                        Crear cliente
                    </button>
                </form>
                <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                    Limpiar campos
                </button>
            </div>
        </Modal>

        <Toast
            v-model="isLoading"
            message="Conectando..."
            type="loading"
        />
    </div>
</template>