<template>
    <div class="h-screen flex flex-col">
        <!-- HEADER CON BOTÓN SIEMPRE VISIBLE -->
        <div class="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between px-2">
            <h3 class="font-bold text-lg">Roles de Personal</h3>
            <button
                class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                @click="abrirNuevoRol">
                <Icon icon="material-symbols:add" width="20" height="20" class="mr-1" /> Nuevo Rol
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <!-- Estado vacío -->
                <div v-if="roles.length === 0"
                    class="bg-white border-dashed border-2 rounded-xl px-5 py-6 flex flex-col items-center justify-center text-gray-500"
                    style="min-width:290px;">
                    <Icon icon="mdi:shield-account" width="40" height="40" class="mb-2 text-indigo-600" />
                    <p class="font-semibold mb-1">No hay roles registrados</p>
                    <p class="text-sm mb-1 text-center">Haz clic en "Nuevo Rol" en la parte superior.</p>
                </div>

                <!-- Tarjetas de roles -->
                <div v-for="rol in roles" :key="rol.id_rol"
                    class="bg-white border rounded-xl shadow px-5 py-4 flex flex-col justify-between"
                    style="min-width:290px;">
                    <div>
                        <div class="flex items-center mb-2">
                            <Icon icon="mdi:shield-account" width="28" height="28" class="text-indigo-600" />
                            <span class="pl-2 text-xl font-bold">{{ rol.nombre_rol }}</span>
                        </div>
                        <span class="block text-gray-500 font-semibold text-base mb-4">ID: {{ rol.id_rol }}</span>
                    </div>
                    <div class="flex flex-col gap-2 mt-4">
                        <div class="flex gap-2">
                            <button
                                class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                                @click="mostrarDetalles(rol)">
                                <Icon icon="material-symbols:info-outline" width="20" height="20" class="mr-1" /> Ver
                                Detalles
                            </button>
                            <button
                                class="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                                @click="abrirEditarRol(rol)">
                                <Icon icon="material-symbols:edit" width="20" height="20" /> Editar
                            </button>
                        </div>
                        <button
                            class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                            @click="eliminarRol(rol.id_rol)">
                            <Icon icon="material-symbols:delete" width="20" height="20" /> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL NUEVO ROL -->
        <div v-if="modalNuevoRol" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div class="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalNuevoRol = false">&times;</button>
                <h4 class="font-bold text-lg mb-4 text-center">Nuevo Rol</h4>
                <form @submit.prevent="agregarRol">
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Nombre del Rol</label>
                        <input v-model="nuevoRol.nombre_rol" required class="w-full border px-3 py-2 rounded"
                            type="text" />
                    </div>
                    <div class="flex justify-end gap-2 mt-5">
                        <button type="button" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            @click="modalNuevoRol = false">Cancelar</button>
                        <button type="submit"
                            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL EDITAR ROL -->
        <div v-if="modalEditarRol" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div class="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalEditarRol = false">&times;</button>
                <h4 class="font-bold text-lg mb-4 text-center">Editar Rol</h4>
                <form @submit.prevent="guardarEdicionRol">
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Nombre del Rol</label>
                        <input v-model="rolEditando.nombre_rol" required class="w-full border px-3 py-2 rounded"
                            type="text" />
                    </div>
                    <div class="flex justify-end gap-2 mt-5">
                        <button type="button" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            @click="modalEditarRol = false">Cancelar</button>
                        <button type="submit"
                            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">Guardar
                            cambios</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL DETALLES -->
        <div v-if="modalDetalles" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalDetalles = false">&times;</button>
                <h4 class="font-bold text-lg mb-2 text-center">Detalles de Rol</h4>
                <div class="space-y-2">
                    <div>
                        <span class="font-medium text-gray-600">ID Rol:</span> {{ detallesActual.id_rol }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Nombre Rol:</span> {{ detallesActual.nombre_rol }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

// Lista de roles desde la BD
const roles = ref([])

// Estado de los modales
const modalNuevoRol = ref(false)
const modalEditarRol = ref(false)
const modalDetalles = ref(false)

// Datos para el modal de detalles
const detallesActual = ref({
    id_rol: null,
    nombre_rol: ''
})

// Datos para el formulario de nuevo rol
const nuevoRol = ref({
    nombre_rol: ''
})

// Datos para edición
const rolEditandoId = ref(null)
const rolEditando = ref({
    nombre_rol: ''
})

// Cargar roles desde el backend
const getRoles = async () => {
    try {
        const { data } = await api.get('/api/roles_personal')
        roles.value = data
    } catch (err) {
        console.error(err)
        alert('Error al cargar los roles')
    }
}

onMounted(getRoles)

const abrirNuevoRol = () => {
    nuevoRol.value = { nombre_rol: '' }
    modalNuevoRol.value = true
}

// Abre el modal de detalles
const mostrarDetalles = (rol) => {
    detallesActual.value = { ...rol }
    modalDetalles.value = true
}

// Crear nuevo rol
const agregarRol = async () => {
    if (!nuevoRol.value.nombre_rol.trim()) {
        alert('El nombre del rol es obligatorio')
        return
    }

    try {
        const { data } = await api.post('/api/roles_personal', {
            nombre_rol: nuevoRol.value.nombre_rol.trim()
        })

        roles.value.push(data)
        modalNuevoRol.value = false
        nuevoRol.value.nombre_rol = ''
    } catch (err) {
        console.error(err)
        alert('No se pudo agregar el rol')
    }
}

// Abrir modal editar rol
const abrirEditarRol = (rol) => {
    rolEditandoId.value = rol.id_rol
    rolEditando.value = {
        nombre_rol: rol.nombre_rol
    }
    modalEditarRol.value = true
}

// Guardar edición
const guardarEdicionRol = async () => {
    if (!rolEditando.value.nombre_rol.trim()) {
        alert('El nombre del rol es obligatorio')
        return
    }

    try {
        const { data } = await api.put(`/api/roles_personal/${rolEditandoId.value}`, {
            nombre_rol: rolEditando.value.nombre_rol.trim()
        })

        const idx = roles.value.findIndex(r => r.id_rol === rolEditandoId.value)
        if (idx !== -1) roles.value[idx] = data

        modalEditarRol.value = false
        rolEditandoId.value = null
    } catch (err) {
        console.error(err)
        alert('No se pudo actualizar el rol')
    }
}

// Eliminar rol
const eliminarRol = async (id_rol) => {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return

    try {
        await api.delete(`/api/roles_personal/${id_rol}`)
        roles.value = roles.value.filter(r => r.id_rol !== id_rol)
    } catch (err) {
        console.error(err)
        alert('No se pudo eliminar el rol')
    }
}
</script>
