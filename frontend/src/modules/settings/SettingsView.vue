<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'
import Toast from '../../components/Toast.vue'
import Confirmation from '../../components/Confirmation.vue'
import Modal from '../../components/Modal.vue'

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (msg, type) => {
    toastMessage.value = msg
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
}

const activeTab = ref('tipos-proyecto')

const tabs = [
    { id: 'tipos-proyecto', label: 'Tipos de Proyecto', icon: 'ix:project' },
    { id: 'estados-proyecto', label: 'Estados de Proyecto', icon: 'f7:status' },
    { id: 'roles-personal', label: 'Roles de Personal', icon: 'eos-icons:role-binding' },
    { id: 'tipos-recurso', label: 'Tipos de Recurso', icon: 'solar:camera-add-bold' },
    { id: 'categorias-gasto', label: 'Categorias de Gasto', icon: 'lsicon:list-filled' }
]

// --- Tipos de Proyecto ---
const tiposProyecto = ref([])
const loadingTP = ref(false)
const nombreTipo = ref('')
const showEditModalTP = ref(false)
const editarTP = ref({ id_tipo_proyecto: null, nombre_tipo: '' })
const showDeleteTP = ref(false)
const deleteIdTP = ref(null)

const cargarTipos = async () => {
    loadingTP.value = true
    try { const r = await api.get('/api/tiposproyecto'); tiposProyecto.value = r.data } catch (e) { console.error(e) } finally { loadingTP.value = false }
}
const crearTipo = async () => {
    if (!nombreTipo.value.trim()) return
    try {
        const r = await api.post('/api/tiposproyecto', { nombre_tipo: nombreTipo.value.trim() })
        tiposProyecto.value.push(r.data)
        nombreTipo.value = ''
        displayToast('Tipo creado', 'success')
    } catch (e) { displayToast('Error al crear tipo', 'error') }
}
const requestDeleteTP = (id) => { deleteIdTP.value = id; showDeleteTP.value = true }
const confirmDeleteTP = async () => {
    try {
        await api.delete(`/api/tiposproyecto/${deleteIdTP.value}`)
        tiposProyecto.value = tiposProyecto.value.filter(t => t.id_tipo_proyecto !== deleteIdTP.value)
        showDeleteTP.value = false
        displayToast('Tipo eliminado', 'success')
    } catch (e) { displayToast('Error al eliminar', 'error') }
}
const openEditTP = (tipo) => {
    editarTP.value = { ...tipo }
    showEditModalTP.value = true
}
const saveEditTP = async () => {
    try {
        const r = await api.put(`/api/tiposproyecto/${editarTP.value.id_tipo_proyecto}`, { nombre_tipo: editarTP.value.nombre_tipo })
        const idx = tiposProyecto.value.findIndex(t => t.id_tipo_proyecto === editarTP.value.id_tipo_proyecto)
        if (idx !== -1) tiposProyecto.value[idx] = r.data
        showEditModalTP.value = false
        displayToast('Tipo actualizado', 'success')
    } catch (e) { displayToast('Error al actualizar', 'error') }
}

// --- Estados de Proyecto ---
const estadosProyecto = ref([])
const loadingEP = ref(false)
const nombreEstado = ref('')
const showEditModalEP = ref(false)
const editarEP = ref({ id_estado_proyecto: null, nombre_estado: '' })
const showDeleteEP = ref(false)
const deleteIdEP = ref(null)

const cargarEstados = async () => {
    loadingEP.value = true
    try { const r = await api.get('/api/estadosproyecto'); estadosProyecto.value = r.data } catch (e) { console.error(e) } finally { loadingEP.value = false }
}
const crearEstado = async () => {
    if (!nombreEstado.value.trim()) return
    try {
        const r = await api.post('/api/estadosproyecto', { nombre_estado: nombreEstado.value.trim() })
        estadosProyecto.value.push(r.data)
        nombreEstado.value = ''
        displayToast('Estado creado', 'success')
    } catch (e) { displayToast('Error al crear estado', 'error') }
}
const requestDeleteEP = (id) => { deleteIdEP.value = id; showDeleteEP.value = true }
const confirmDeleteEP = async () => {
    try {
        await api.delete(`/api/estadosproyecto/${deleteIdEP.value}`)
        estadosProyecto.value = estadosProyecto.value.filter(e => e.id_estado_proyecto !== deleteIdEP.value)
        showDeleteEP.value = false
        displayToast('Estado eliminado', 'success')
    } catch (e) { displayToast('Error al eliminar', 'error') }
}
const openEditEP = (estado) => {
    editarEP.value = { ...estado }
    showEditModalEP.value = true
}
const saveEditEP = async () => {
    if (!editarEP.value.nombre_estado?.trim()) return
    try {
        const r = await api.put(`/api/estadosproyecto/${editarEP.value.id_estado_proyecto}`, { nombre_estado: editarEP.value.nombre_estado })
        const idx = estadosProyecto.value.findIndex(e => e.id_estado_proyecto === editarEP.value.id_estado_proyecto)
        if (idx !== -1) estadosProyecto.value[idx] = r.data
        showEditModalEP.value = false
        displayToast('Estado actualizado', 'success')
    } catch (e) { displayToast('Error al actualizar', 'error') }
}

// --- Roles Personal ---
const rolesPersonal = ref([])
const loadingRP = ref(false)
const nombreRol = ref('')
const showEditModalRP = ref(false)
const editarRP = ref({ id_rol: null, nombre_rol: '' })
const showDeleteRP = ref(false)
const deleteIdRP = ref(null)

const cargarRoles = async () => {
    loadingRP.value = true
    try { const r = await api.get('/api/roles_personal'); rolesPersonal.value = r.data } catch (e) { console.error(e) } finally { loadingRP.value = false }
}
const crearRol = async () => {
    if (!nombreRol.value.trim()) return
    try {
        const r = await api.post('/api/roles_personal', { nombre_rol: nombreRol.value.trim() })
        rolesPersonal.value.push(r.data)
        nombreRol.value = ''
        displayToast('Rol creado', 'success')
    } catch (e) { displayToast('Error al crear rol', 'error') }
}
const requestDeleteRP = (id) => { deleteIdRP.value = id; showDeleteRP.value = true }
const confirmDeleteRP = async () => {
    try {
        await api.delete(`/api/roles_personal/${deleteIdRP.value}`)
        rolesPersonal.value = rolesPersonal.value.filter(r => r.id_rol !== deleteIdRP.value)
        showDeleteRP.value = false
        displayToast('Rol eliminado', 'success')
    } catch (e) { displayToast('Error al eliminar', 'error') }
}
const openEditRP = (rol) => {
    editarRP.value = { ...rol }
    showEditModalRP.value = true
}
const saveEditRP = async () => {
    if (!editarRP.value.nombre_rol?.trim()) return
    try {
        const r = await api.put(`/api/roles_personal/${editarRP.value.id_rol}`, { nombre_rol: editarRP.value.nombre_rol.trim() })
        const idx = rolesPersonal.value.findIndex(r => r.id_rol === editarRP.value.id_rol)
        if (idx !== -1) rolesPersonal.value[idx] = r.data
        showEditModalRP.value = false
        displayToast('Rol actualizado', 'success')
    } catch (e) { displayToast('Error al actualizar', 'error') }
}

// --- Tipos de Recurso ---
const tiposRecurso = ref([])
const loadingTR = ref(false)
const nombreTipoRec = ref('')
const showEditModalTR = ref(false)
const editarTR = ref({ id_tipo_recurso: null, nombre_tipo: '' })
const showDeleteTR = ref(false)
const deleteIdTR = ref(null)

const cargarTiposRec = async () => {
    loadingTR.value = true
    try { const r = await api.get('/api/tiposrecursos'); tiposRecurso.value = r.data } catch (e) { console.error(e) } finally { loadingTR.value = false }
}
const crearTipoRec = async () => {
    if (!nombreTipoRec.value.trim()) return
    try {
        const r = await api.post('/api/tiposrecursos', { nombre_tipo: nombreTipoRec.value.trim() })
        tiposRecurso.value.push(r.data)
        nombreTipoRec.value = ''
        displayToast('Tipo de recurso creado', 'success')
    } catch (e) { displayToast('Error al crear tipo', 'error') }
}
const requestDeleteTR = (id) => { deleteIdTR.value = id; showDeleteTR.value = true }
const confirmDeleteTR = async () => {
    try {
        await api.delete(`/api/tiposrecursos/${deleteIdTR.value}`)
        tiposRecurso.value = tiposRecurso.value.filter(t => t.id_tipo_recurso !== deleteIdTR.value)
        showDeleteTR.value = false
        displayToast('Tipo eliminado', 'success')
    } catch (e) {
        const msg = e.response?.status === 409 ? e.response.data.message : 'Error al eliminar'
        displayToast(msg, 'error')
    }
}
const openEditTR = (tipo) => {
    editarTR.value = { ...tipo }
    showEditModalTR.value = true
}
const saveEditTR = async () => {
    if (!editarTR.value.nombre_tipo?.trim()) return
    try {
        const r = await api.put(`/api/tiposrecursos/${editarTR.value.id_tipo_recurso}`, { nombre_tipo: editarTR.value.nombre_tipo.trim() })
        const idx = tiposRecurso.value.findIndex(t => t.id_tipo_recurso === editarTR.value.id_tipo_recurso)
        if (idx !== -1) tiposRecurso.value[idx] = r.data
        showEditModalTR.value = false
        displayToast('Tipo actualizado', 'success')
    } catch (e) {
        const msg = e.response?.status === 409 ? e.response.data.message : 'Error al actualizar'
        displayToast(msg, 'error')
    }
}

// --- Categorias de Gasto ---
const catGasto = ref([])
const loadingCG = ref(false)
const nombreCat = ref('')
const showEditModalCG = ref(false)
const editarCG = ref({ id_categoria_gasto: null, nombre_categoria: '' })
const showDeleteCG = ref(false)
const deleteIdCG = ref(null)

const cargarCats = async () => {
    loadingCG.value = true
    try { const r = await api.get('/api/categoriasgasto'); catGasto.value = r.data } catch (e) { console.error(e) } finally { loadingCG.value = false }
}
const crearCat = async () => {
    if (!nombreCat.value.trim()) return
    try {
        const r = await api.post('/api/categoriasgasto', { nombre_categoria: nombreCat.value.trim() })
        catGasto.value.push(r.data)
        nombreCat.value = ''
        displayToast('Categoria creada', 'success')
    } catch (e) { displayToast('Error al crear categoria', 'error') }
}
const requestDeleteCG = (id) => { deleteIdCG.value = id; showDeleteCG.value = true }
const confirmDeleteCG = async () => {
    try {
        await api.delete(`/api/categoriasgasto/${deleteIdCG.value}`)
        catGasto.value = catGasto.value.filter(c => c.id_categoria_gasto !== deleteIdCG.value)
        showDeleteCG.value = false
        displayToast('Categoria eliminada', 'success')
    } catch (e) { displayToast('Error al eliminar', 'error') }
}
const openEditCG = (cat) => {
    editarCG.value = { ...cat }
    showEditModalCG.value = true
}
const saveEditCG = async () => {
    if (!editarCG.value.nombre_categoria?.trim()) return
    try {
        const r = await api.put(`/api/categoriasgasto/${editarCG.value.id_categoria_gasto}`, { nombre_categoria: editarCG.value.nombre_categoria.trim() })
        const idx = catGasto.value.findIndex(c => c.id_categoria_gasto === editarCG.value.id_categoria_gasto)
        if (idx !== -1) catGasto.value[idx] = r.data
        showEditModalCG.value = false
        displayToast('Categoria actualizada', 'success')
    } catch (e) { displayToast('Error al actualizar', 'error') }
}

onMounted(() => {
    cargarTipos()
    cargarEstados()
    cargarRoles()
    cargarTiposRec()
    cargarCats()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Configuracion del Sistema</h3>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 gap-1 overflow-x-auto mb-4">
            <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                    activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                ]">
                <Icon :icon="tab.icon" width="18" height="18" />
                {{ tab.label }}
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
            <!-- Tipos de Proyecto -->
            <div v-if="activeTab === 'tipos-proyecto'" class="space-y-3">
                <form @submit.prevent="crearTipo" class="flex gap-2">
                    <input v-model="nombreTipo" type="text" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nuevo tipo de proyecto" required />
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Icon icon="material-symbols:add" width="20" height="20" /> Crear
                    </button>
                </form>
                <div v-if="loadingTP" class="text-sm text-blue-500">Cargando...</div>
                <table v-else-if="tiposProyecto.length" class="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead><tr class="bg-green-50 text-green-900"><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2 text-left">Nombre</th><th class="px-4 py-2 text-left">Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="t in tiposProyecto" :key="t.id_tipo_proyecto" class="border-b border-gray-100 hover:bg-green-50/50">
                            <td class="px-4 py-2 text-sm">{{ t.id_tipo_proyecto }}</td>
                            <td class="px-4 py-2 text-sm font-medium">{{ t.nombre_tipo }}</td>
                            <td class="px-4 py-2 flex gap-1">
                                <button @click="openEditTP(t)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Editar</button>
                                <button @click="requestDeleteTP(t.id_tipo_proyecto)" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-gray-400 text-sm italic">No hay tipos de proyecto creados.</div>
            </div>

            <!-- Estados de Proyecto -->
            <div v-if="activeTab === 'estados-proyecto'" class="space-y-3">
                <form @submit.prevent="crearEstado" class="flex gap-2">
                    <input v-model="nombreEstado" type="text" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nuevo estado de proyecto" required />
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Icon icon="material-symbols:add" width="20" height="20" /> Crear
                    </button>
                </form>
                <div v-if="loadingEP" class="text-sm text-blue-500">Cargando...</div>
                <table v-else-if="estadosProyecto.length" class="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead><tr class="bg-green-50 text-green-900"><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2 text-left">Nombre</th><th class="px-4 py-2 text-left">Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="e in estadosProyecto" :key="e.id_estado_proyecto" class="border-b border-gray-100 hover:bg-green-50/50">
                            <td class="px-4 py-2 text-sm">{{ e.id_estado_proyecto }}</td>
                            <td class="px-4 py-2 text-sm font-medium">{{ e.nombre_estado }}</td>
                            <td class="px-4 py-2 flex gap-1">
                                <button @click="openEditEP(e)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Editar</button>
                                <button @click="requestDeleteEP(e.id_estado_proyecto)" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-gray-400 text-sm italic">No hay estados de proyecto creados.</div>
            </div>

            <!-- Roles de Personal -->
            <div v-if="activeTab === 'roles-personal'" class="space-y-3">
                <form @submit.prevent="crearRol" class="flex gap-2">
                    <input v-model="nombreRol" type="text" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nuevo rol de personal" required />
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Icon icon="material-symbols:add" width="20" height="20" /> Crear
                    </button>
                </form>
                <div v-if="loadingRP" class="text-sm text-blue-500">Cargando...</div>
                <table v-else-if="rolesPersonal.length" class="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead><tr class="bg-indigo-50 text-indigo-900"><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2 text-left">Nombre</th><th class="px-4 py-2 text-left">Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="r in rolesPersonal" :key="r.id_rol" class="border-b border-gray-100 hover:bg-indigo-50/50">
                            <td class="px-4 py-2 text-sm">{{ r.id_rol }}</td>
                            <td class="px-4 py-2 text-sm font-medium">{{ r.nombre_rol }}</td>
                            <td class="px-4 py-2 flex gap-1">
                                <button @click="openEditRP(r)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Editar</button>
                                <button @click="requestDeleteRP(r.id_rol)" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-gray-400 text-sm italic">No hay roles creados.</div>
            </div>

            <!-- Tipos de Recurso -->
            <div v-if="activeTab === 'tipos-recurso'" class="space-y-3">
                <form @submit.prevent="crearTipoRec" class="flex gap-2">
                    <input v-model="nombreTipoRec" type="text" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nuevo tipo de recurso" required />
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Icon icon="material-symbols:add" width="20" height="20" /> Crear
                    </button>
                </form>
                <div v-if="loadingTR" class="text-sm text-blue-500">Cargando...</div>
                <table v-else-if="tiposRecurso.length" class="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead><tr class="bg-purple-50 text-purple-900"><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2 text-left">Nombre</th><th class="px-4 py-2 text-left">Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="t in tiposRecurso" :key="t.id_tipo_recurso" class="border-b border-gray-100 hover:bg-purple-50/50">
                            <td class="px-4 py-2 text-sm">{{ t.id_tipo_recurso }}</td>
                            <td class="px-4 py-2 text-sm font-medium">{{ t.nombre_tipo }}</td>
                            <td class="px-4 py-2 flex gap-1">
                                <button @click="openEditTR(t)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Editar</button>
                                <button @click="requestDeleteTR(t.id_tipo_recurso)" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-gray-400 text-sm italic">No hay tipos de recurso creados.</div>
            </div>

            <!-- Categorias de Gasto -->
            <div v-if="activeTab === 'categorias-gasto'" class="space-y-3">
                <form @submit.prevent="crearCat" class="flex gap-2">
                    <input v-model="nombreCat" type="text" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nueva categoria de gasto" required />
                    <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Icon icon="material-symbols:add" width="20" height="20" /> Crear
                    </button>
                </form>
                <div v-if="loadingCG" class="text-sm text-blue-500">Cargando...</div>
                <table v-else-if="catGasto.length" class="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead><tr class="bg-orange-50 text-orange-900"><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2 text-left">Nombre</th><th class="px-4 py-2 text-left">Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="c in catGasto" :key="c.id_categoria_gasto" class="border-b border-gray-100 hover:bg-orange-50/50">
                            <td class="px-4 py-2 text-sm">{{ c.id_categoria_gasto }}</td>
                            <td class="px-4 py-2 text-sm font-medium">{{ c.nombre_categoria }}</td>
                            <td class="px-4 py-2 flex gap-1">
                                <button @click="openEditCG(c)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Editar</button>
                                <button @click="requestDeleteCG(c.id_categoria_gasto)" class="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-gray-400 text-sm italic">No hay categorias de gasto creadas.</div>
            </div>
        </div>

        <!-- Edit Modals -->
        <Modal v-if="showEditModalTP" :show="showEditModalTP" @close="showEditModalTP = false" title="Editar Tipo de Proyecto" size="sm">
            <form @submit.prevent="saveEditTP" class="space-y-3">
                <div>
                    <label class="text-sm font-semibold text-gray-500">Nombre</label>
                    <input v-model="editarTP.nombre_tipo" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div class="flex gap-2">
                    <button type="button" @click="showEditModalTP = false" class="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                    <button type="submit" class="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition cursor-pointer">Guardar</button>
                </div>
            </form>
        </Modal>

        <Modal v-if="showEditModalEP" :show="showEditModalEP" @close="showEditModalEP = false" title="Editar Estado de Proyecto" size="sm">
            <form @submit.prevent="saveEditEP" class="space-y-3">
                <div>
                    <label class="text-sm font-semibold text-gray-500">Nombre</label>
                    <input v-model="editarEP.nombre_estado" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div class="flex gap-2">
                    <button type="button" @click="showEditModalEP = false" class="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                    <button type="submit" class="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition cursor-pointer">Guardar</button>
                </div>
            </form>
        </Modal>

        <Modal v-if="showEditModalRP" :show="showEditModalRP" @close="showEditModalRP = false" title="Editar Rol de Personal" size="sm">
            <form @submit.prevent="saveEditRP" class="space-y-3">
                <div>
                    <label class="text-sm font-semibold text-gray-500">Nombre</label>
                    <input v-model="editarRP.nombre_rol" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div class="flex gap-2">
                    <button type="button" @click="showEditModalRP = false" class="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                    <button type="submit" class="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer">Guardar</button>
                </div>
            </form>
        </Modal>

        <Modal v-if="showEditModalTR" :show="showEditModalTR" @close="showEditModalTR = false" title="Editar Tipo de Recurso" size="sm">
            <form @submit.prevent="saveEditTR" class="space-y-3">
                <div>
                    <label class="text-sm font-semibold text-gray-500">Nombre</label>
                    <input v-model="editarTR.nombre_tipo" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div class="flex gap-2">
                    <button type="button" @click="showEditModalTR = false" class="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                    <button type="submit" class="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer">Guardar</button>
                </div>
            </form>
        </Modal>

        <Modal v-if="showEditModalCG" :show="showEditModalCG" @close="showEditModalCG = false" title="Editar Categoria de Gasto" size="sm">
            <form @submit.prevent="saveEditCG" class="space-y-3">
                <div>
                    <label class="text-sm font-semibold text-gray-500">Nombre</label>
                    <input v-model="editarCG.nombre_categoria" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required />
                </div>
                <div class="flex gap-2">
                    <button type="button" @click="showEditModalCG = false" class="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                    <button type="submit" class="flex-1 bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 transition cursor-pointer">Guardar</button>
                </div>
            </form>
        </Modal>

        <!-- Delete Confirmations -->
        <Confirmation :show="showDeleteTP" title="Eliminar tipo" message="Esta seguro de eliminar este tipo de proyecto?" confirm-text="Eliminar" cancel-text="Cancelar" @confirm="confirmDeleteTP" @cancel="showDeleteTP = false" />
        <Confirmation :show="showDeleteEP" title="Eliminar estado" message="Esta seguro de eliminar este estado de proyecto?" confirm-text="Eliminar" cancel-text="Cancelar" @confirm="confirmDeleteEP" @cancel="showDeleteEP = false" />
        <Confirmation :show="showDeleteRP" title="Eliminar rol" message="Esta seguro de eliminar este rol de personal?" confirm-text="Eliminar" cancel-text="Cancelar" @confirm="confirmDeleteRP" @cancel="showDeleteRP = false" />
        <Confirmation :show="showDeleteTR" title="Eliminar tipo" message="Esta seguro de eliminar este tipo de recurso?" confirm-text="Eliminar" cancel-text="Cancelar" @confirm="confirmDeleteTR" @cancel="showDeleteTR = false" />
        <Confirmation :show="showDeleteCG" title="Eliminar categoria" message="Esta seguro de eliminar esta categoria de gasto?" confirm-text="Eliminar" cancel-text="Cancelar" @confirm="confirmDeleteCG" @cancel="showDeleteCG = false" />

        <Toast v-model="showToast" :message="toastMessage" :type="toastType" />
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
