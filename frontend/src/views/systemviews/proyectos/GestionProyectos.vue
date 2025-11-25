<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'
import Proyecto from '../../../components/Proyecto.vue'
import api from '../../../services/api.js'
import Toast from '../../../components/Toast.vue'
import Modal from '../../../components/Modal.vue'

//PROYECTOS PAGE VARIABLES
const proyectos_list = ref([])

//STATUS
const error = ref(false)
const isConnecting = ref(false)
const loadingProyectos = ref(false)

//CARGAR OPTIONS
const tiposProyectos = ref([])
const estadosProyectos = ref([])

//FORM INFO
const nombre_proyecto = ref('')
const id_tipo_proyecto = ref(null)
const id_estado_proyecto = ref(null)
const fechaInicio = ref('')
const fechaFinEstimada = ref('')
const presupuesto = ref(0)

//MODAL DETALLES DE PROYECTO
const showModalDetalles = ref(false)
const proyectoSeleccionado = ref({})

//ASIGNACION DE LOCACION
const locDisponibles = ref([])
const idLocSeleccionada = ref(null)
const mostrarFormAsignacion = ref(false)
const loadingLoc = ref(false)

//ASIGNACION DE RECURSOS TECNICOS
const mostrarFormAsigRecurso = ref(false)
const recDisponibles = ref([])
const loadingRec = ref(false)
const idRecSeleccionado = ref(null)
const fechaInicioRec = ref('')
const fechaFinRec = ref('')

//TOAST
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, 3000);
}

const showModal = ref(false)

const abrirDetalles = (proyecto) => {
    proyectoSeleccionado.value = proyecto
    showModalDetalles.value = true
}

const formatearFechaDos = (fecha) => {
    if (!fecha) return 'No definida'
    const date = new Date(fecha)
    const opciones = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }
    return date.toLocaleDateString('es-ES', opciones)
}

const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const limpiarCampos = () => {
    nombre_proyecto.value = ''
    id_tipo_proyecto.value = null
    id_estado_proyecto.value = null
    fechaInicio.value = ''
    fechaFinEstimada.value = ''
    presupuesto.value = 0
}

const minFechaFin = computed(() => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    return `${year}-${mes}-${dia}`
})

const validarFormulario = () => {
    if (!nombre_proyecto.value || id_tipo_proyecto === null || id_estado_proyecto === null || !fechaInicio.value || !fechaFinEstimada.value || presupuesto.value === 0) return true
    return false
}

const cargarLocaciones = async () => {
    try {
        const res = await api.get('/api/locacion')
        locDisponibles.value = res.data
    } catch (err) {
        console.log('Error al cargar las locaciones: ', err)
    }
}

const cargarRecTecnicos = async () => {
    loadingRec.value = true
    try {
        const res = await api.get('/api/recursostecnicos')
        recDisponibles.value = res.data
    } catch (err) {
        console.log('Error al cargar los recursos tecnicos: ', err)
    } finally {
        loadingRec.value = false
    }
}

const asignarRecursoTecnico = async () => {
    if (!idRecSeleccionado.value || !fechaInicioRec.value || !fechaFinRec.value) {
        displayToast('Debe de seleccionar un recurso tecnico y asignar las fechas de inicio y fin', 'error')
        return
    }

    const payload = {
        id_recurso: idRecSeleccionado.value,
        id_proyecto: proyectoSeleccionado.value.id_proyecto,
        fecha_inicio_uso: fechaInicioRec.value,
        fecha_fin_uso: fechaFinRec.value,
    }

    loadingRec.value = true

    try {
        const res = await api.post('/api/proyectos/asignarrecurso', payload)

        const recursoDetalle = recDisponibles.value.find(r => r.id_recurso === idRecSeleccionado.value)

        if (recursoDetalle && proyectoSeleccionado.value.recursos_asignados) {
            proyectoSeleccionado.value.recursos_asignados.push({
                id_recurso: idRecSeleccionado.value,
                nombre_recurso: recursoDetalle.nombre_equipo,
                fecha_inicio_uso: fechaInicioRec.value,
                fecha_fin_uso: fechaFinRec.value,
            })
        }

        idRecSeleccionado.value = null
        fechaInicioRec.value = ''
        fechaFinRec.value = ''
        mostrarFormAsigRecurso.value = false

        displayToast(res.data.message, 'success')
    } catch (err) {
        const mensaje = err.response?.data?.message || 'Error al asignar el recurso tecnico'
        displayToast(mensaje, 'error')
    } finally {
        loadingRec.value = false
    }
}

const desasignarRecursoTecnico = async (idRecurso, nombreRecurso) => {
    if (!confirm(`Esta seguro/a que desea desasignar el recurso ${nombreRecurso}?`)) {
        return
    }

    const id_proyecto = proyectoSeleccionado.value.id_proyecto

    loadingRec.value = true

    try {
        await api.delete(`/api/proyectos/desasignarrecurso/${id_proyecto}/${idRecurso}`)

        const index = proyectoSeleccionado.value.recursos_asignados.findIndex(r => r.id_recurso === idRecurso)

        if (index > -1) {
            proyectoSeleccionado.value.recursos_asignados.splice(index, 1)
        }

        displayToast('Recurso desasignado del proyecto', 'success')
    } catch (err) {
        const mensaje = err.response?.data?.message || 'Error al desasignar recurso tecnico del proyecto'
        displayToast(mensaje, 'error')
    } finally {
        loadingRec.value = false
    }
}

const asignarLocacion = async () => {
    if (!idLocSeleccionada.value) return

    loadingLoc.value = true
    try {
        await api.post('/api/proyectos/asignarlocacion', {
            id_proyecto: proyectoSeleccionado.value.id_proyecto,
            id_locacion: idLocSeleccionada.value
        })

        const locEncontrada = locDisponibles.value.find(l => l.id_locacion === idLocSeleccionada.value)

        if (!Array.isArray(proyectoSeleccionado.value.lista_locaciones)) {
            proyectoSeleccionado.value.lista_locaciones = []
        }

        if (locEncontrada) {
            proyectoSeleccionado.value.lista_locaciones.push(locEncontrada.nombre_locacion)
        }

        displayToast('Locacion asignada', 'success')
        mostrarFormAsignacion.value = false
        idLocSeleccionada.value = null
    } catch (err) {
        console.log('Error al asignar la locacion');
        displayToast('Error al asignar la locacion', 'error')
    } finally {
        loadingLoc.value = false
    }
}

const desasignarLocacion = async (nombreLocacion) => {
    const locADesasignar = locDisponibles.value.find(l => l.nombre_locacion === nombreLocacion)

    if (!locADesasignar) {
        displayToast('Error: ID de locacion no encontrada', 'error')
        return
    }

    if(!confirm(`Esta seguro/a que desea desasignar la locacion ${nombreLocacion} del proyecto ${proyectoSeleccionado.value.nombre_proyecto}?`)) {
        return
    }

    const id_proyecto = proyectoSeleccionado.value.id_proyecto
    const id_locacion = locADesasignar.id_locacion

    try {
        const res = await api.delete(`/api/proyectos/desasignarlocacion/${id_proyecto}/${id_locacion}`)

        const index = proyectoSeleccionado.value.lista_locaciones.findIndex(loc => loc === nombreLocacion)
        if (index > -1) {
            proyectoSeleccionado.value.lista_locaciones.splice(index, 1)
        }

        const mensaje = res.data && res.data.message ? res.data.message : 'Locacion desasignada'

        displayToast(mensaje, 'success')
    } catch (err) {
        console.error('Error al desasignar la locacion:', err.response || err);
        const errorMessage = err.response
            ? err.response.data.message || 'Error desconocido del servidor al desasignar.'
            : 'Error de conexión con la API.';
        displayToast(errorMessage, 'error')
    }
}

const cargarTiposProyectos = async () => {
    try {
        const res = await api.get('/api/tiposproyecto')
        tiposProyectos.value = res.data
    } catch (err) {
        console.log('Error al cargar los tipos de proyectos: ', err)
    }
}

const cargarEstadosProyectos = async () => {
    try {
        const res = await api.get('/api/estadosproyecto')
        estadosProyectos.value = res.data
    } catch (err) {
        console.log('Error al cargar los estados de proyectos: ', err)
    }
}

const createProyecto = async () => {
    if(validarFormulario()) {
        error.value = true
        return
    }
    error.value = false
    isConnecting.value = true

    try {
        const res = await api.post('/api/proyectos', {
            nombre_proyecto: nombre_proyecto.value,
            id_tipo_proyecto: id_tipo_proyecto.value,
            id_estado_proyecto: id_estado_proyecto.value,
            fecha_inicio: fechaInicio.value,
            fecha_fin_estimada: fechaFinEstimada.value,
            presupuesto: presupuesto.value
        })

        const tipoSeleccionado = tiposProyectos.value.find(tipo => tipo.id_tipo_proyecto === res.data.id_tipo_proyecto)
        const estadoSeleccionado = estadosProyectos.value.find(estado => estado.id_estado_proyecto === res.data.id_estado_proyecto)

        const nuevoProyecto = {
            ...res.data,
            // Asignamos nombres para que la UI se vea bien sin recargar
            nombre_tipo: tipoSeleccionado ? tipoSeleccionado.nombre_tipo : 'Tipo desconocido',
            nombre_estado: estadoSeleccionado ? estadoSeleccionado.nombre_estado : 'Estado desconocido',
            lista_locaciones: [] // Inicializamos vacío para evitar errores en la modal
        }

        console.log('Nuevo proyecto creado: ', nuevoProyecto)
        proyectos_list.value.push(nuevoProyecto)
        limpiarCampos()
        showModal.value = false
        displayToast('Proyecto creado', 'success')
    } catch (err) {
        console.log('Error al crear el proyecto: ', err)
        displayToast('Error al crear el proyecto', 'error')
    } finally {
        isConnecting.value = false
    }
}

const getProyectos = async () => {
    loadingProyectos.value = true
    try {
        const res = await api.get('/api/proyectos')
        proyectos_list.value = res.data
    } catch (err) {
        console.log('Error al cargar los proyectos: ', err)
    } finally {
        loadingProyectos.value = false
    }
}

const deleteProyecto = async () => {
    try {
        console.log('Proyecto eliminado')
    } catch (err) {
        console.log('Error al eliminar el proyecto: ', err)
    }
}

onMounted(() => {
    cargarTiposProyectos()
    cargarEstadosProyectos()
    getProyectos()
    cargarLocaciones()
    cargarRecTecnicos()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestion de Proyectos</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button @click="showModal = true" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="ix:project-new" width="25" height="25" class="mr-2" />
                    Nuevo Proyecto
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
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar proyecto"
                    >
                </div>
                <button class="flex items-center text-center justify-center cursor-pointer bg-green-500 text-white font-semibold p-2 rounded-lg transition-colors hover:bg-green-600">
                    <Icon icon="mi:filter" width="25" height="25" />
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingProyectos">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            Cargando proyectos...
                        </div>
                    </div>
                </div>
                <div v-else-if="proyectos_list.length > 0">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="proyecto in proyectos_list" :key="proyecto.id_proyecto">
                            <Proyecto
                                :nombreProyecto="proyecto.nombre_proyecto"
                                :tipoProyecto="proyecto.nombre_tipo || proyecto.id_tipo_proyecto"
                                :estadoProyecto="proyecto.nombre_estado || proyecto.id_estado_proyecto"
                                :fechaInicio="formatearFecha(proyecto.fecha_inicio)"
                                :fechaFinEstimada="formatearFecha(proyecto.fecha_fin_estimada)"
                                :presupuesto="proyecto.presupuesto"
                                :locacionesAsignadas="proyecto.lista_locaciones"
                                :recursosAsignados="proyecto.recursos_asignados"
                                @verDetalles="abrirDetalles(proyecto)"
                            />
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            No hay proyectos creados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            title="Nuevo Proyecto"
            size="md"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mb-2 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form @submit.prevent="createProyecto" class="mb-2">
                    <div class="mb-2">
                        <div class="flex flex-col mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Nombre del Proyecto</label>
                            <input type="text" v-model="nombre_proyecto" class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nombre">
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Tipo de Proyecto</label>
                            <select v-model="id_tipo_proyecto" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1">
                                <option :value="null" selected disabled>Seleccione un tipo</option>
                                <option v-for="tipo in tiposProyectos" :key="tipo.id_tipo_proyecto" :value="tipo.id_tipo_proyecto">{{ tipo.nombre_tipo }}</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Estado de Proyecto</label>
                            <select v-model="id_estado_proyecto" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1">
                                <option :value="null" selected disabled>Seleccione un estado</option>
                                <option v-for="estado in estadosProyectos" :key="estado.id_estado_proyecto" :value="estado.id_estado_proyecto">{{ estado.nombre_estado }}</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                             <div class="mb-2">
                                <label class="text-sm font-semibold text-gray-500 mb-1">Inicio</label>
                                <input type="date" v-model="fechaInicio" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1">
                            </div>
                            <div class="mb-2">
                                <label class="text-sm font-semibold text-gray-500 mb-1">Fin (Estimado)</label>
                                <input type="date" :min="minFechaFin" v-model="fechaFinEstimada" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1">
                            </div>
                        </div>

                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">
                                Presupuesto:
                                <span v-if="presupuesto > 0" class="font-semibold text-green-500">Bs. {{ presupuesto }}</span>
                                <span v-else class="font-semibold text-red-400">Aun no hay presupuesto.</span>
                            </label>
                            <input type="number" v-model="presupuesto" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1">
                        </div>
                    </div>
                    <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-2 rounded-lg transition-colors mb-2">
                        Crear proyecto
                    </button>
                </form>
                <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-2 rounded-lg transition-colors">
                    Limpiar campos
                </button>
            </div>
        </Modal>

        <Modal
            v-if="showModalDetalles"
            :show="showModalDetalles"
            title="Detalles del Proyecto"
            size="xl"
            @close="showModalDetalles = false"
        >
            <div class="space-y-6">
                <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="bg-green-100 p-3 rounded-full text-green-600 hidden sm:block">
                        <Icon icon="heroicons:cube-transparent" width="40" height="40" />
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">{{ proyectoSeleccionado.nombre_proyecto }}</h3>
                        <span class="text-sm text-gray-500">ID Referencia: #{{ proyectoSeleccionado.id_proyecto }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-700 border-b pb-2">Información General</h4>
                        <div class="grid grid-cols-2 gap-y-4 text-sm">
                            <div class="text-gray-500">Tipo:</div>
                            <div class="font-medium text-gray-800">{{ proyectoSeleccionado.nombre_tipo || 'Desconocido' }}</div>
                            <div class="text-gray-500">Estado:</div>
                            <div>
                                <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {{ proyectoSeleccionado.nombre_estado || 'Desconocido' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-700 border-b pb-2">Finanzas y Fechas</h4>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-gray-400">Inicio:</span> {{ formatearFecha(proyectoSeleccionado.fecha_inicio) }}</p>
                            <p><span class="text-gray-400">Fin Est:</span> {{ formatearFecha(proyectoSeleccionado.fecha_fin_estimada) }}</p>
                            <p class="pt-2">
                                <span class="text-gray-400">Presupuesto:</span>
                                <span class="text-xl font-bold text-green-600 block">Bs. {{ proyectoSeleccionado.presupuesto }}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-3 gap-4">
                    <div>
                        <div class="flex justify-between items-center border-b pb-2 mb-3">
                            <h4 class="font-semibold text-gray-700">Locaciones Asignadas</h4>

                            <button
                                v-if="!mostrarFormAsignacion"
                                @click="mostrarFormAsignacion = true"
                                class="cursor-pointer text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition flex items-center gap-1"
                            >
                                <Icon icon="mdi:plus" class="w-4 h-4" /> Asignar Nueva
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-3">
                            <template v-if="proyectoSeleccionado.lista_locaciones && proyectoSeleccionado.lista_locaciones.length > 0">
                                <span
                                    v-for="(loc, index) in proyectoSeleccionado.lista_locaciones"
                                    :key="index"
                                    class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-2 font-medium text-sm"
                                >
                                    <Icon icon="mdi:map-marker" class="w-4 h-4"/>
                                    <span>{{ loc }}</span>
                                    <button
                                        @click="desasignarLocacion(loc)"
                                        title="Desasignar locacion"
                                        class="cursor-pointer ml-1 text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-white transition"
                                    >
                                        <Icon icon="mdi:close-circle" class="w-4 h-4" />
                                    </button>
                                </span>
                            </template>

                            <div v-else-if="!mostrarFormAsignacion" class="text-gray-400 italic text-sm flex items-center gap-2 bg-gray-50 p-2 rounded w-full">
                                <Icon icon="mdi:map-marker-off" class="w-4 h-4"/>
                                No hay locaciones asignadas actualmente.
                            </div>
                        </div>

                        <transition name="fade">
                            <div v-if="mostrarFormAsignacion" class="bg-green-50/50 p-3 rounded-lg border border-green-100 mt-2">
                                <p class="text-xs font-bold text-green-800 mb-2 uppercase">Seleccionar Locación</p>

                                <div class="flex gap-2 items-center">
                                    <select
                                        v-model="idLocSeleccionada"
                                        class="flex-1 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400 focus:outline-none bg-white"
                                        :disabled="loadingLocacion"
                                    >
                                        <option :value="null" disabled>Seleccione una locacion</option>
                                        <option
                                            v-for="loc in locDisponibles"
                                            :key="loc.id_locacion"
                                            :value="loc.id_locacion"
                                        >
                                            {{ loc.nombre_locacion }}
                                        </option>
                                    </select>

                                    <button
                                        @click="asignarLocacion"
                                        :disabled="loadingLoc || !idLocSeleccionada || locDisponibles.length === 0"
                                        class="bg-green-600 cursor-pointer text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <Icon v-if="loadingLoc" icon="mdi:loading" class="animate-spin w-4 h-4"/>
                                        <Icon v-else icon="fluent-mdl2:accept-medium" height="15" width="15" class="my-2" />
                                    </button>

                                    <button
                                        @click="mostrarFormAsignacion = false"
                                        :disabled="loadingLoc"
                                        class="cursor-pointer bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
                                    >
                                        <Icon icon="heroicons:x-mark-20-solid" height="15" width="15" class="my-2" />
                                    </button>
                                </div>
                                <p v-if="locDisponibles.length === 0" class="text-xs text-red-600 mt-1">No hay locaciones disponibles para asignar.</p>
                            </div>
                        </transition>
                    </div>

                    <div>
                        <div class="flex justify-between items-center border-b pb-2 mb-3">
                            <h4 class="font-semibold text-gray-700">Recursos Asignados</h4>

                            <button
                                v-if="!mostrarFormAsigRecurso"
                                @click="mostrarFormAsigRecurso = true"
                                class="cursor-pointer text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition flex items-center gap-1"
                            >
                                <Icon icon="mdi:plus" class="w-4 h-4" /> Asignar Recurso
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-3">
                            <template v-if="proyectoSeleccionado.recursos_asignados && proyectoSeleccionado.recursos_asignados.length > 0">
                                <span
                                    v-for="(recurso) in proyectoSeleccionado.recursos_asignados"
                                    :key="recurso.id_recurso"
                                    class="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100 flex items-center gap-2 font-medium text-sm"
                                >
                                    <Icon icon="mdi:tools" class="w-4 h-4"/>
                                    <span>{{ recurso.nombre_recurso }}</span>
                                    <span class="text-xs italic text-purple-500">
                                        ({{ formatearFechaDos(recurso.fecha_inicio_uso) }} a {{ formatearFechaDos(recurso.fecha_fin_uso) }})
                                    </span>

                                    <button
                                        @click="desasignarRecursoTecnico(recurso.id_recurso, recurso.nombre_recurso)"
                                        title="Desasignar recurso"
                                        class="cursor-pointer ml-1 text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-white transition"
                                    >
                                        <Icon icon="mdi:close-circle" class="w-4 h-4" />
                                    </button>
                                </span>
                            </template>

                            <div v-else-if="!mostrarFormAsigRecurso" class="text-gray-400 italic text-sm flex items-center gap-2 bg-gray-50 p-2 rounded w-full">
                                <Icon icon="tabler:camera-off" class="w-4 h-4"/>
                                No hay recursos asignados actualmente.
                            </div>
                        </div>

                        <transition name="fade">
                            <div v-if="mostrarFormAsigRecurso" class="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
                                <p class="text-xs font-bold text-blue-800 mb-2 uppercase">Asignar Recurso</p>

                                <form @submit.prevent="asignarRecursoTecnico" class="grid grid-cols-5 gap-2 items-end">

                                    <div class="col-span-2">
                                        <label class="text-xs font-medium text-gray-600">Recurso Disponible</label>
                                        <select
                                            v-model="idRecSeleccionado"
                                            class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
                                            :disabled="loadingRec"
                                            required
                                        >
                                            <option :value="null" disabled>Seleccione un recurso</option>
                                            <option
                                                v-for="rec in recDisponibles"
                                                :key="rec.id_recurso"
                                                :value="rec.id_recurso"
                                            >
                                                {{ rec.nombre_equipo }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-span-1">
                                        <label class="text-xs font-medium text-gray-600">Inicio Uso</label>
                                        <input type="date" v-model="fechaInicioRec" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                                    </div>

                                    <div class="col-span-1">
                                        <label class="text-xs font-medium text-gray-600">Fin Uso</label>
                                        <input type="date" v-model="fechaFinRec" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                                    </div>

                                    <div class="col-span-1 flex gap-2 justify-end">
                                        <button
                                            type="submit"
                                            :disabled="loadingRec || !idRecSeleccionado || recDisponibles.length === 0"
                                            class="bg-blue-600 cursor-pointer text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center h-8"
                                        >
                                            <Icon v-if="loadingRec" icon="mdi:loading" class="animate-spin w-4 h-4"/>
                                            <Icon v-else icon="fluent-mdl2:accept-medium" height="15" width="15" class="my-0" />
                                        </button>

                                        <button
                                            type="button"
                                            @click="mostrarFormAsigRecurso = false"
                                            :disabled="loadingRec"
                                            class="cursor-pointer bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition disabled:opacity-50 h-8"
                                        >
                                            <Icon icon="heroicons:x-mark-20-solid" height="15" width="15" class="my-0" />
                                        </button>
                                    </div>
                                </form>
                                <p v-if="recDisponibles.length === 0 && !loadingRec" class="text-xs text-red-600 mt-1">No hay recursos disponibles para asignar.</p>
                            </div>
                        </transition>
                    </div>

                    <div>
                        <h4 class="font-semibold text-gray-700 border-b pb-2 mb-3">Personal Asignado</h4>
                        <div class="flex flex-wrap gap-2">
                            <template v-if="proyectoSeleccionado.lista_locaciones && proyectoSeleccionado.lista_locaciones.length > 0">
                                <span
                                    v-for="(loc, index) in proyectoSeleccionado.lista_locaciones"
                                    :key="index"
                                    class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-2 font-medium"
                                >
                                    <Icon icon="mdi:map-marker" />
                                    {{ loc }}
                                </span>
                            </template>
                            <div v-else class="text-gray-400 italic flex items-center gap-2 bg-gray-50 p-3 rounded w-full justify-center">
                                <Icon icon="heroicons:x-mark" />
                                No hay personal asignado
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />
    </div>
</template>
