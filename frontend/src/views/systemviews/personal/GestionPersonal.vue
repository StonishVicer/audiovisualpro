<template>
    <div class="h-screen flex flex-col">
        <!-- HEADER CON BOTÓN SIEMPRE VISIBLE -->
        <div class="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between px-2">
            <h3 class="font-bold text-lg">Gestión de Personal</h3>
            <button
                class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                @click="abrirNuevoPersonal">
                <Icon icon="material-symbols:add" width="20" height="20" class="mr-1" /> Nuevo Personal
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <!-- Estado vacío -->
                <div v-if="personal.length === 0"
                    class="bg-white border-dashed border-2 rounded-xl px-5 py-6 flex flex-col items-center justify-center text-gray-500"
                    style="min-width:290px;">
                    <Icon icon="material-symbols:account-circle" width="40" height="40" class="mb-2 text-blue-500" />
                    <p class="font-semibold mb-1">No hay personal registrado</p>
                    <p class="text-sm mb-1 text-center">Haz clic en "Nuevo Personal" en la parte superior.</p>
                </div>

                <!-- Tarjetas de personal -->
                <div v-for="persona in personal" :key="persona.idpersonal"
                    class="bg-white border rounded-xl shadow px-5 py-4 flex flex-col justify-between"
                    style="min-width:290px;">
                    <div>
                        <div class="flex items-center mb-2">
                            <Icon icon="material-symbols:account-circle" width="28" height="28" class="text-blue-500" />
                            <span class="pl-2 text-xl font-bold">{{ persona.nombrepersonal }}</span>
                        </div>
                        <span class="block font-medium mb-2 text-gray-700 text-base">
                            Rol:
                            <span class="font-normal">{{ persona.rol || 'Sin rol' }}</span>
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Cédula: {{ persona.cedulapersonal }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Correo: {{ persona.emailpersonal || '—' }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Teléfono: {{ persona.telefono || '—' }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Salario:
                            <span class="text-green-600 font-bold">Bs. {{ persona.salario || 0 }}</span>
                        </span>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button
                            class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                            @click="editarPersonal(persona)">
                            <Icon icon="material-symbols:edit" width="20" height="20" /> Editar
                        </button>
                        <button
                            class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                            @click="eliminarPersonal(persona.idpersonal)">
                            <Icon icon="material-symbols:delete" width="20" height="20" /> Eliminar
                        </button>
                    </div>
                    <button
                        class="mt-3 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg px-4 py-2 transition-colors w-full"
                        @click="mostrarDetalles(persona)">
                        <Icon icon="material-symbols:info-outline" width="18" height="18" class="mr-2" /> Ver Detalles
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL NUEVO / EDITAR PERSONAL -->
        <div v-if="modalNuevoPersonal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div class="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalNuevoPersonal = false">&times;</button>
                <h4 class="font-bold text-lg mb-4 text-center">
                    {{ esEdicion ? 'Editar Personal' : 'Nuevo Personal' }}
                </h4>

                <div v-if="roles.length === 0" class="mb-3 text-xs text-red-500 text-center font-semibold">
                    Debes crear al menos un rol en "Roles de Personal" antes de registrar personal.
                </div>

                <form @submit.prevent="guardarPersonal">
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Nombre</label>
                        <input v-model="nuevoPersonal.nombrepersonal" required class="w-full border px-3 py-2 rounded"
                            type="text" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Cédula</label>
                        <input v-model="nuevoPersonal.cedulapersonal" required class="w-full border px-3 py-2 rounded"
                            type="text" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Rol</label>
                        <select v-model="nuevoPersonal.idrol" required class="w-full border px-3 py-2 rounded">
                            <option disabled value="">Seleccione un rol</option>
                            <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                                {{ rol.nombre_rol }}
                            </option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Salario</label>
                        <input v-model="nuevoPersonal.salario" required class="w-full border px-3 py-2 rounded"
                            type="number" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Correo</label>
                        <input v-model="nuevoPersonal.emailpersonal" class="w-full border px-3 py-2 rounded"
                            type="email" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Teléfono</label>
                        <input v-model="nuevoPersonal.telefono" class="w-full border px-3 py-2 rounded" type="text" />
                    </div>
                    <div class="flex justify-end gap-2 mt-5">
                        <button type="button" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            @click="modalNuevoPersonal = false">Cancelar</button>
                        <button type="submit"
                            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL DETALLES -->
        <div v-if="modalDetalles" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalDetalles = false">&times;</button>
                <h4 class="font-bold text-lg mb-2 text-center">Detalles del Personal</h4>
                <div class="space-y-2">
                    <div>
                        <span class="font-medium text-gray-600">ID:</span> {{ detallesActual.idpersonal }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Nombre:</span> {{ detallesActual.nombrepersonal }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Cédula:</span> {{ detallesActual.cedulapersonal }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Rol (ID):</span>
                        {{ detallesActual.rol }}
                        <span v-if="detallesActual.idrol">({{ detallesActual.idrol }})</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Salario:</span> Bs. {{ detallesActual.salario }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Correo:</span> {{ detallesActual.emailpersonal }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Teléfono:</span> {{ detallesActual.telefono }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../../services/api.js'

// Lista de personal
const personal = ref([])
// Lista de roles
const roles = ref([])

// Estado de modales
const modalNuevoPersonal = ref(false)
const modalDetalles = ref(false)

// ID en edición (null = nuevo)
const personaEditandoId = ref(null)

// Datos de detalles
const detallesActual = ref({
    idpersonal: null,
    nombrepersonal: '',
    cedulapersonal: '',
    rol: '',
    idrol: null,
    salario: '',
    emailpersonal: '',
    telefono: ''
})

// Datos de formulario
const nuevoPersonal = ref({
    nombrepersonal: '',
    cedulapersonal: '',
    idrol: '',
    salario: '',
    emailpersonal: '',
    telefono: ''
})

const esEdicion = computed(() => personaEditandoId.value !== null)

// Mapeo BD -> UI
const mapBackendToLocal = (p) => ({
    idpersonal: p.id_personal,
    nombrepersonal: p.nombre_personal,
    cedulapersonal: p.cedula_personal,
    idrol: p.id_rol,
    rol: p.nombre_rol || '',
    salario: p.salario,
    emailpersonal: p.email_personal,
    telefono: p.telefono
})

// Cargar personal
const getPersonal = async () => {
    try {
        const { data } = await api.get('/api/personal')
        personal.value = data.map(mapBackendToLocal)
    } catch (err) {
        console.error(err)
        alert('Error al cargar el personal')
    }
}

// Cargar roles
const getRoles = async () => {
    try {
        const { data } = await api.get('/api/roles_personal')
        roles.value = data
    } catch (err) {
        console.error(err)
        alert('Error al cargar los roles')
    }
}

onMounted(() => {
    getRoles()
    getPersonal()
})

// Mostrar detalles
const mostrarDetalles = (persona) => {
    detallesActual.value = { ...persona }
    modalDetalles.value = true
}

// Abrir modal NUEVO
const abrirNuevoPersonal = () => {
    personaEditandoId.value = null
    nuevoPersonal.value = {
        nombrepersonal: '',
        cedulapersonal: '',
        idrol: '',
        salario: '',
        emailpersonal: '',
        telefono: ''
    }
    modalNuevoPersonal.value = true
}

// Abrir modal EDITAR
const editarPersonal = (persona) => {
    personaEditandoId.value = persona.idpersonal
    nuevoPersonal.value = {
        nombrepersonal: persona.nombrepersonal,
        cedulapersonal: persona.cedulapersonal,
        idrol: persona.idrol,
        salario: persona.salario || '',
        emailpersonal: persona.emailpersonal || '',
        telefono: persona.telefono || ''
    }
    modalNuevoPersonal.value = true
}

// Guardar (crear o editar)
const guardarPersonal = async () => {
    const p = nuevoPersonal.value

    if (!p.nombrepersonal || !p.cedulapersonal || !p.idrol) {
        alert('Nombre, cédula y rol son obligatorios')
        return
    }

    const payload = {
        nombre_personal: p.nombrepersonal,
        cedula_personal: p.cedulapersonal,
        id_rol: p.idrol,
        salario: p.salario,
        email_personal: p.emailpersonal,
        telefono: p.telefono
    }

    try {
        if (esEdicion.value) {
            const { data } = await api.put(`/api/personal/${personaEditandoId.value}`, payload)
            const actualizado = mapBackendToLocal(data)
            const idx = personal.value.findIndex(per => per.idpersonal === personaEditandoId.value)
            if (idx !== -1) personal.value[idx] = actualizado
        } else {
            const { data } = await api.post('/api/personal', payload)
            personal.value.push(mapBackendToLocal(data))
        }

        modalNuevoPersonal.value = false
        personaEditandoId.value = null
    } catch (err) {
        console.error(err)
        alert('No se pudo guardar el personal')
    }
}

// Eliminar
const eliminarPersonal = async (idpersonal) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return

    try {
        await api.delete(`/api/personal/${idpersonal}`)
        personal.value = personal.value.filter(p => p.idpersonal !== idpersonal)
    } catch (err) {
        console.error(err)
        alert('No se pudo eliminar el personal')
    }
}
</script>
