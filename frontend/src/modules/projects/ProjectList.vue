<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import Proyecto from '../../components/Proyecto.vue'
import api from '../../services/api.js'
import Toast from '../../components/Toast.vue'
import Confirmation from '../../components/Confirmation.vue'
import WizardProyecto from '../../components/WizardProyecto.vue'
import ModalDetallesProyecto from '../../components/ModalDetallesProyecto.vue'

const proyectos_list = ref([])
const clientes = ref([])
const loadingProyectos = ref(false)

const tiposProyectos = ref([])
const estadosProyectos = ref([])

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showWizard = ref(false)
const wizardModo = ref('crear')
const proyectoEditando = ref(null)

const showModalDetalles = ref(false)
const proyectoSeleccionado = ref({})

const showConfirmation = ref(false)
const proyectoDeleteId = ref(null)

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
}

const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const cargarTiposProyectos = async () => {
    try { const res = await api.get('/api/tiposproyecto'); tiposProyectos.value = res.data } catch (err) { console.error(err) }
}

const cargarEstadosProyectos = async () => {
    try { const res = await api.get('/api/estadosproyecto'); estadosProyectos.value = res.data } catch (err) { console.error(err) }
}

const cargarClientes = async () => {
    try { const res = await api.get('/api/clientes'); clientes.value = res.data } catch (err) { console.error(err) }
}

const getProyectos = async () => {
    loadingProyectos.value = true
    try {
        const [resProyectos, resContratos] = await Promise.all([api.get('/api/proyectos'), api.get('/api/contratos')])
        const contratos = resContratos.data
        proyectos_list.value = resProyectos.data.map(proyecto => {
            const contratoAsociado = contratos.find(c => c.id_proyecto === proyecto.id_proyecto)
            return {
                ...proyecto,
                nombre_cliente: contratoAsociado ? contratoAsociado.nombre_cliente : null,
                id_cliente: contratoAsociado ? contratoAsociado.id_cliente : null
            }
        })
    } catch (err) {
        displayToast('Error al cargar la informacion', 'error')
    } finally {
        loadingProyectos.value = false
    }
}

const abrirDetalles = (proyecto) => {
    proyectoSeleccionado.value = { ...proyecto }
    showModalDetalles.value = true
}

const onWizardCreated = () => {
    showWizard.value = false
    proyectoEditando.value = null
    getProyectos()
}

const onWizardUpdated = () => {
    showWizard.value = false
    proyectoEditando.value = null
    getProyectos()
}

const editarProyecto = (proyecto) => {
    proyectoEditando.value = { ...proyecto }
    wizardModo.value = 'editar'
    showWizard.value = true
}

const requestDelete = (id) => {
    proyectoDeleteId.value = id
    showConfirmation.value = true
}

const eliminarProyecto = async () => {
    showConfirmation.value = false
    if (!proyectoDeleteId.value) return
    try {
        await api.delete(`/api/proyectos/${proyectoDeleteId.value}`)
        proyectos_list.value = proyectos_list.value.filter(p => p.id_proyecto !== proyectoDeleteId.value)
        displayToast('Proyecto eliminado correctamente', 'success')
    } catch (err) {
        displayToast(err.response?.data?.message || 'Error al eliminar el proyecto', 'error')
    } finally {
        proyectoDeleteId.value = null
    }
}

const abrirNuevoProyecto = () => {
    wizardModo.value = 'crear'
    proyectoEditando.value = null
    showWizard.value = true
}

onMounted(() => {
    cargarTiposProyectos()
    cargarEstadosProyectos()
    getProyectos()
    cargarClientes()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h3 class="font-bold text-lg">Gestion de Proyectos</h3>
            <button @click="abrirNuevoProyecto"
                class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-green-200 cursor-pointer">
                <Icon icon="ix:project-new" width="22" height="22" />
                Nuevo Proyecto
            </button>
        </div>

        <div class="mb-3">
            <div class="flex space-x-2">
                <div class="relative flex-1">
                    <Icon icon="material-symbols:search" width="22" height="22" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" class="transition w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar proyecto..." />
                </div>
                <button class="flex items-center text-center justify-center cursor-pointer bg-green-500 text-white font-semibold px-3 py-2 rounded-xl transition-colors hover:bg-green-600">
                    <Icon icon="mi:filter" width="22" height="22" />
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 border border-gray-200 rounded-xl min-h-[400px] max-h-[calc(100vh-240px)]">
            <div v-if="loadingProyectos" class="flex items-center justify-center text-center mt-3">
                <div class="flex text-sm font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 rounded-xl shadow-md">
                    <Icon icon="mdi:loading" width="22" height="22" class="mr-2 animate-spin" />
                    Cargando proyectos...
                </div>
            </div>
            <div v-else-if="proyectos_list.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="proyecto in proyectos_list" :key="proyecto.id_proyecto">
                    <Proyecto :nombreProyecto="proyecto.nombre_proyecto"
                        :tipoProyecto="proyecto.nombre_tipo || proyecto.id_tipo_proyecto"
                        :estadoProyecto="proyecto.nombre_estado || proyecto.id_estado_proyecto"
                        :fechaInicio="formatearFecha(proyecto.fecha_inicio)"
                        :fechaFinEstimada="formatearFecha(proyecto.fecha_fin_estimada)"
                        :presupuesto="Number(proyecto.presupuesto)"
                        @verDetalles="abrirDetalles(proyecto)"
                        @editar="editarProyecto(proyecto)"
                        @eliminar="requestDelete(proyecto.id_proyecto)" />
                </div>
            </div>
            <div v-else class="flex items-center justify-center text-center mt-3">
                <div class="flex text-sm font-semibold text-gray-500 items-center justify-center w-full bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-md">
                    <Icon icon="mdi:information-outline" width="22" height="22" class="mr-2 text-green-500" />
                    No hay proyectos creados.
                </div>
            </div>
        </div>

        <WizardProyecto v-if="showWizard" :modo="wizardModo" :proyectoExistente="proyectoEditando"
            @close="showWizard = false; proyectoEditando = null"
            @created="onWizardCreated"
            @updated="onWizardUpdated" />

        <ModalDetallesProyecto v-if="showModalDetalles" :proyecto="proyectoSeleccionado" :show="showModalDetalles"
            @close="showModalDetalles = false" @updated="getProyectos" />

        <Confirmation :show="showConfirmation" title="Eliminar proyecto"
            message="Esta seguro/a que desea eliminar este proyecto? Esta accion no se puede deshacer."
            confirm-text="Eliminar" cancel-text="Cancelar"
            @confirm="eliminarProyecto"
            @cancel="showConfirmation = false" />

        <Toast v-model="showToast" :message="toastMessage" :type="toastType" />
    </div>
</template>
