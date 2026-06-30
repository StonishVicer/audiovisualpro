<template>
    <div class="h-screen flex flex-col">
        <!-- HEADER CON BOTÓN SIEMPRE VISIBLE -->
        <div class="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between px-2">
            <h3 class="font-bold text-lg">Gestión de Personal</h3>
            <button
                class="cursor-pointer flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                @click="showModal = true">
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
                            ID: {{ persona.tipoIdentificacion || 'V' }}-{{ persona.cedulapersonal }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Correo: {{ persona.emailpersonal || '—' }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Teléfono: {{ persona.telefono || '—' }}{{ persona.prefijoTelefono ? ' (' + persona.prefijoTelefono + ')' : '' }}
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
                            @click="requestDeletePersonal(persona.idpersonal)">
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

        <Modal
            v-if="showModalDetalles" :show="showModalDetalles" @close="showModalDetalles = false"
            size="sm"
            title="Detalles del Personal"
        >
            <div class="space-y-2">
                <div>
                    <span class="font-medium text-gray-600">ID:</span> {{ detallesActual.idpersonal }}
                </div>
                <div>
                    <span class="font-medium text-gray-600">Nombre:</span> {{ detallesActual.nombrepersonal }}
                </div>
                <div>
                    <span class="font-medium text-gray-600">ID:</span> {{ detallesActual.tipoIdentificacion || 'V' }}-{{ detallesActual.cedulapersonal }}
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
                    <span class="font-medium text-gray-600">Teléfono:</span> {{ detallesActual.telefono || '—' }}{{ detallesActual.prefijoTelefono ? ' (' + detallesActual.prefijoTelefono + ')' : '' }}
                </div>
            </div>
        </Modal>

        <Modal
            :show="showModal" @close="showModal = false"
            size="sm"
            :title="esEdicion ? 'Editar Personal' : 'Nuevo Personal'"
        >
            <form @submit.prevent="guardarPersonal" class="mb-2">
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Nombre</label>
                    <input v-model="nuevoPersonal.nombrepersonal" required class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        type="text" />
                </div>
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Identificación</label>
                    <div class="flex gap-2">
                        <select v-model="nuevoPersonal.tipoIdentificacion" class="w-16 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                            <option value="V">V</option>
                            <option value="J">J</option>
                            <option value="E">E</option>
                        </select>
                        <input v-model="nuevoPersonal.cedulapersonal" required class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" placeholder="12345678-9" />
                    </div>
                </div>
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Rol</label>
                    <select v-model="nuevoPersonal.idrol" required class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option disabled value="">Seleccione un rol</option>
                        <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                            {{ rol.nombre_rol }}
                        </option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Salario</label>
                    <input v-model="nuevoPersonal.salario" required class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        type="number" />
                </div>
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Correo</label>
                    <input v-model="nuevoPersonal.emailpersonal" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        type="email" />
                </div>
                <div class="mb-4">
                    <label class="text-sm font-semibold text-gray-500 mb-1">Teléfono</label>
                    <div class="flex gap-2">
                        <select v-model="nuevoPersonal.prefijoTelefono" class="w-20 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                            <option v-for="p in prefijos" :key="p" :value="p">{{ p }}</option>
                        </select>
                        <input v-model="nuevoPersonal.telefono" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" placeholder="1234567" />
                    </div>
                </div>

                <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                    {{ esEdicion ? 'Guardar Cambios' : 'Crear Personal' }}
                </button>
            </form>
            <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                Limpiar campos
            </button>
        </Modal>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />

        <Confirmation
            :show="showConfirmation"
            title="Eliminar personal"
            message="¿Está seguro/a que desea eliminar este personal?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="eliminarPersonal"
            @cancel="showConfirmation = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import Toast from '../../components/Toast.vue'
import Confirmation from '../../components/Confirmation.vue'

//Modal Creacion/Edicion
const showModal = ref(false)
const isConnecting = ref(false)
const loadingPersonal = ref(false)
const error = ref(false)

//Confirmation
const showConfirmation = ref(false)
const personalDeleteID = ref(null)

//Modal Detalles
const showModalDetalles = ref(false)

//Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Lista de personal
const personal = ref([])
// Lista de roles
const roles = ref([])
// Prefijos telefonicos
const prefijos = ['0412', '0414', '0416', '0424', '0426', '0212', '0241', '0243', '0251', '0261']

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
    tipoIdentificacion: 'V',
    rol: '',
    idrol: null,
    salario: '',
    emailpersonal: '',
    telefono: '',
    prefijoTelefono: ''
})

// Datos de formulario
const nuevoPersonal = ref({
    nombrepersonal: '',
    cedulapersonal: '',
    tipoIdentificacion: 'V',
    idrol: '',
    salario: '',
    emailpersonal: '',
    telefono: '',
    prefijoTelefono: '0412'
})

const esEdicion = computed(() => personaEditandoId.value !== null)

//Eliminar personal
const requestDeletePersonal = (id) => {
    personalDeleteID.value = id
    showConfirmation.value = true
}

//Display toast
const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, 3000);
}

// Mapeo BD -> UI
const mapBackendToLocal = (p) => {
    const telefono = p.telefono || ''
    const phoneParts = telefono.match(/^(\d{4})(\d{7})$/)
    const cedula = p.cedula_personal || ''
    const cedParts = cedula.match(/^([VJE])-(\d{6,9}-\d)?$/)
    return {
        idpersonal: p.id_personal,
        nombrepersonal: p.nombre_personal,
        cedulapersonal: cedParts ? cedParts[2] : cedula,
        tipoIdentificacion: cedParts ? cedParts[1] : (p.tipo_identificacion || 'V'),
        idrol: p.id_rol,
        rol: p.nombre_rol || '',
        salario: p.salario,
        emailpersonal: p.email_personal,
        telefono: phoneParts ? phoneParts[2] : telefono,
        prefijoTelefono: phoneParts ? phoneParts[1] : (p.prefijo_telefono || '')
    }
}

const limpiarCampos = () => {
    nuevoPersonal.value.nombrepersonal = ''
    nuevoPersonal.value.cedulapersonal = ''
    nuevoPersonal.value.tipoIdentificacion = 'V'
    nuevoPersonal.value.idrol = ''
    nuevoPersonal.value.salario = ''
    nuevoPersonal.value.emailpersonal = ''
    nuevoPersonal.value.telefono = ''
    nuevoPersonal.value.prefijoTelefono = '0412'
}

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
    showModalDetalles.value = true
}

// Abrir modal NUEVO
const abrirNuevoPersonal = () => {
    personaEditandoId.value = null
    nuevoPersonal.value = {
        nombrepersonal: '',
        cedulapersonal: '',
        tipoIdentificacion: 'V',
        idrol: '',
        salario: '',
        emailpersonal: '',
        telefono: '',
        prefijoTelefono: '0412'
    }
    modalNuevoPersonal.value = true
}

// Abrir modal EDITAR
const editarPersonal = (persona) => {
    personaEditandoId.value = persona.idpersonal
    nuevoPersonal.value = {
        nombrepersonal: persona.nombrepersonal,
        cedulapersonal: persona.cedulapersonal || '',
        tipoIdentificacion: persona.tipoIdentificacion || 'V',
        idrol: persona.idrol,
        salario: persona.salario || '',
        emailpersonal: persona.emailpersonal || '',
        telefono: persona.telefono || '',
        prefijoTelefono: persona.prefijoTelefono || '0412'
    }
    showModal.value = true
}

// Guardar (crear o editar)
const guardarPersonal = async () => {
    const p = nuevoPersonal.value

    if (!p.nombrepersonal || !p.cedulapersonal || !p.idrol) {
        alert('Nombre, cédula y rol son obligatorios')
        return
    }

    const cedulaCompleta = (p.tipoIdentificacion || 'V') + '-' + p.cedulapersonal.trim()
    const telefonoCompleto = p.telefono.trim() ? (p.prefijoTelefono || '0412') + p.telefono.trim() : ''
    const payload = {
        nombre_personal: p.nombrepersonal,
        cedula_personal: cedulaCompleta,
        tipo_identificacion: p.tipoIdentificacion || 'V',
        id_rol: p.idrol,
        salario: p.salario,
        email_personal: p.emailpersonal,
        telefono: telefonoCompleto || null,
        prefijo_telefono: p.telefono.trim() ? (p.prefijoTelefono || null) : null
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
        limpiarCampos()
        showModal.value = false
        displayToast('Personal creado con exito', 'success')
    } catch (err) {
        console.error(err)
        displayToast('No se pudo guardar el personal', 'error')
    }
}

// Eliminar
const eliminarPersonal = async () => {
    const id = personalDeleteID.value
    showConfirmation.value = false
    if (!id) return;
    isConnecting.value = true

    try {
        await api.delete(`/api/personal/${id}`)
        personal.value = personal.value.filter(p => p.idpersonal !== id)
        displayToast('Personal eliminado con exito', 'success')
    } catch (err) {
        console.error(err)
        displayToast('No se pudo eliminar el personal', 'error')
    } finally {
        isConnecting.value = false
    }
}
</script>
