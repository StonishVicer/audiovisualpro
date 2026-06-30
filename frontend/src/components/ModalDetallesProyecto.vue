<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../services/api.js'
import Toast from './Toast.vue'
import SearchableSelect from './SearchableSelect.vue'
import CreateLocacionInline from './forms/CreateLocacionInline.vue'
import CreateRecursoInline from './forms/CreateRecursoInline.vue'
import CreatePersonalInline from './forms/CreatePersonalInline.vue'

const props = defineProps({
    proyecto: { type: Object, required: true },
    show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'updated'])

const activeTab = ref('general')
const visible = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (msg, type) => {
    toastMessage.value = msg
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
}

const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida'
    return new Date(fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatearFechaDos = (fecha) => {
    if (!fecha) return 'No definida'
    return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const FORMATO_MONEDA = (monto) => Number(monto || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const tabs = [
    { id: 'general', label: 'General', icon: 'mdi:information-outline' },
    { id: 'locaciones', label: 'Locaciones', icon: 'mdi:map-marker' },
    { id: 'recursos', label: 'Recursos', icon: 'mdi:tools' },
    { id: 'personal', label: 'Personal', icon: 'mdi:account-group' },
    { id: 'entregables', label: 'Entregables', icon: 'solar:delivery-bold' },
    { id: 'finanzas', label: 'Finanzas', icon: 'material-symbols:paid' }
]

const loadAllData = () => {
    cargarLocaciones()
    cargarRecursos()
    cargarEntregables()
    // Personal must load before finanzas for pagos filtering
    cargarPersonal().then(() => cargarFinanzas())
}

watch(() => props.show, (val) => {
    if (!val) {
        visible.value = false
    }
})

onMounted(() => {
    visible.value = true
    loadAllData()
})

// ─── Locaciones ───
const locDisponibles = ref([])
const locAsignadas = ref([])
const idLocSeleccionada = ref(null)
const showLocForm = ref(false)
const loadingLoc = ref(false)
const loadingLocData = ref(false)
const errorLoc = ref('')

const cargarLocaciones = async () => {
    loadingLocData.value = true
    errorLoc.value = ''
    try {
        const [disp, asig] = await Promise.all([
            api.get('/api/locacion'),
            api.get(`/api/proyectos/${props.proyecto.id_proyecto}/asignaciones`)
        ])
        locDisponibles.value = disp.data
        if (asig.data && asig.data.locaciones) {
            locAsignadas.value = asig.data.locaciones.map(l => ({
                id_locacion: l.id_locacion,
                nombre_locacion: l.nombre_locacion,
                direccion: l.direccion
            }))
        }
    } catch (e) {
        errorLoc.value = 'Error al cargar locaciones'
        console.error(e)
    } finally { loadingLocData.value = false }
}

const asignarLocacion = async () => {
    if (!idLocSeleccionada.value) return
    loadingLoc.value = true
    try {
        await api.post('/api/proyectos/asignarlocacion', {
            id_proyecto: props.proyecto.id_proyecto,
            id_locacion: idLocSeleccionada.value
        })
        const loc = locDisponibles.value.find(l => l.id_locacion === idLocSeleccionada.value)
        if (loc) locAsignadas.value.push(loc)
        idLocSeleccionada.value = null
        showLocForm.value = false
        displayToast('Locacion asignada', 'success')
    } catch (e) {
        displayToast('Error al asignar locacion', 'error')
    } finally { loadingLoc.value = false }
}

const desasignarLocacion = async (loc) => {
    if (!confirm(`Desasignar locacion "${loc.nombre_locacion}"?`)) return
    try {
        await api.delete(`/api/proyectos/desasignarlocacion/${props.proyecto.id_proyecto}/${loc.id_locacion}`)
        locAsignadas.value = locAsignadas.value.filter(l => l.id_locacion !== loc.id_locacion)
        displayToast('Locacion desasignada', 'success')
    } catch (e) {
        displayToast('Error al desasignar locacion', 'error')
    }
}

const onLocacionCreada = (data) => {
    locDisponibles.value.push(data)
    displayToast('Locacion creada', 'success')
}

// ─── Recursos ───
const recDisponibles = ref([])
const recAsignados = ref([])
const idRecSeleccionado = ref(null)
const fechaInicioRec = ref('')
const fechaFinRec = ref('')
const showRecForm = ref(false)
const loadingRec = ref(false)
const loadingRecData = ref(false)
const errorRec = ref('')

const cargarRecursos = async () => {
    loadingRecData.value = true
    errorRec.value = ''
    try {
        const [disp, asig] = await Promise.all([
            api.get('/api/recursostecnicos'),
            api.get(`/api/proyectos/${props.proyecto.id_proyecto}/asignaciones`)
        ])
        recDisponibles.value = disp.data
        if (asig.data && asig.data.recursos) {
            recAsignados.value = asig.data.recursos.map(r => ({
                id_recurso: r.id_recurso,
                nombre_equipo: r.nombre_equipo,
                nombre_tipo: r.nombre_tipo,
                fecha_inicio_uso: r.fecha_inicio_uso,
                fecha_fin_uso: r.fecha_fin_uso
            }))
        }
    } catch (e) {
        errorRec.value = 'Error al cargar recursos'
        console.error(e)
    } finally { loadingRecData.value = false }
}

const asignarRecurso = async () => {
    if (!idRecSeleccionado.value || !fechaInicioRec.value || !fechaFinRec.value) {
        displayToast('Complete todos los campos', 'error')
        return
    }
    loadingRec.value = true
    try {
        await api.post('/api/proyectos/asignarrecurso', {
            id_recurso: idRecSeleccionado.value,
            id_proyecto: props.proyecto.id_proyecto,
            fecha_inicio_uso: fechaInicioRec.value,
            fecha_fin_uso: fechaFinRec.value
        })
        const rec = recDisponibles.value.find(r => r.id_recurso === idRecSeleccionado.value)
        if (rec) recAsignados.value.push({
            id_recurso: rec.id_recurso,
            nombre_equipo: rec.nombre_equipo,
            nombre_tipo: rec.nombre_tipo,
            fecha_inicio_uso: fechaInicioRec.value,
            fecha_fin_uso: fechaFinRec.value
        })
        idRecSeleccionado.value = null; fechaInicioRec.value = ''; fechaFinRec.value = ''; showRecForm.value = false
        displayToast('Recurso asignado', 'success')
    } catch (e) {
        displayToast('Error al asignar recurso', 'error')
    } finally { loadingRec.value = false }
}

const desasignarRecurso = async (rec) => {
    if (!confirm(`Desasignar "${rec.nombre_equipo}"?`)) return
    try {
        await api.delete(`/api/proyectos/desasignarrecurso/${props.proyecto.id_proyecto}/${rec.id_recurso}`)
        recAsignados.value = recAsignados.value.filter(r => r.id_recurso !== rec.id_recurso)
        displayToast('Recurso desasignado', 'success')
    } catch (e) { displayToast('Error al desasignar recurso', 'error') }
}

const onRecursoCreado = (data) => {
    recDisponibles.value.push(data)
    displayToast('Recurso creado', 'success')
}

// ─── Personal ───
const personalDisponibles = ref([])
const asignacionesPersonal = ref([])
const idPersonalSelect = ref(null)
const horasTrab = ref('')
const showPersForm = ref(false)
const loadingPers = ref(false)
const loadingPersData = ref(false)
const errorPers = ref('')

const cargarPersonal = async () => {
    loadingPersData.value = true
    errorPers.value = ''
    try {
        const [pers, asig] = await Promise.all([
            api.get('/api/personal'),
            api.get(`/api/proyectos/${props.proyecto.id_proyecto}/asignaciones`)
        ])
        personalDisponibles.value = pers.data
        if (asig.data && asig.data.personal) {
            asignacionesPersonal.value = asig.data.personal.map(a => ({
                id_asignacion: a.id_asignacion,
                id_personal: a.id_personal,
                nombre_personal: a.nombre_personal,
                nombre_rol: a.nombre_rol,
                horas_trabajadas: a.horas_trabajadas,
                salario: Number(a.salario) || 0,
                costo_estimado: (Number(a.salario) || 0) > 0 && (Number(a.horas_trabajadas) || 0) > 0
                    ? ((Number(a.salario) / 160) * Number(a.horas_trabajadas))
                    : 0
            }))
        }
    } catch (e) {
        errorPers.value = 'Error al cargar personal'
        console.error(e)
    } finally { loadingPersData.value = false }
}

const asignarPersonal = async () => {
    if (!idPersonalSelect.value) return
    loadingPers.value = true
    try {
        const res = await api.post('/api/asignaciones', {
            id_proyecto: props.proyecto.id_proyecto,
            id_personal: idPersonalSelect.value,
            horas_trabajadas: horasTrab.value || 0
        })
        const persona = personalDisponibles.value.find(p => p.id_personal === idPersonalSelect.value)
        asignacionesPersonal.value.push({
            ...res.data,
            nombre_personal: persona?.nombre_personal || `#${idPersonalSelect.value}`,
            nombre_rol: persona?.nombre_rol || '',
            salario: Number(persona?.salario) || 0,
            costo_estimado: (Number(persona?.salario) || 0) > 0 && (Number(horasTrab.value) || 0) > 0
                ? ((Number(persona.salario) / 160) * Number(horasTrab.value))
                : 0
        })
        idPersonalSelect.value = null; horasTrab.value = ''; showPersForm.value = false
        displayToast('Personal asignado', 'success')
    } catch (e) {
        displayToast('Error al asignar personal', 'error')
    } finally { loadingPers.value = false }
}

const desasignarPersonal = async (idAsig, nombre) => {
    if (!confirm(`Desasignar a "${nombre}"?`)) return
    try {
        await api.delete(`/api/asignaciones/${idAsig}`)
        asignacionesPersonal.value = asignacionesPersonal.value.filter(a => a.id_asignacion !== idAsig)
        displayToast('Personal desasignado', 'success')
    } catch (e) { displayToast('Error al desasignar', 'error') }
}

const onPersonalCreado = (data) => {
    personalDisponibles.value.push(data)
    displayToast('Personal creado', 'success')
}

const totalCostoPersonal = computed(() =>
    asignacionesPersonal.value.reduce((sum, a) => sum + (a.costo_estimado || 0), 0)
)

// ─── Entregables ───
const entregables = ref([])
const loadingEnt = ref(false)
const errorEnt = ref('')
const showEntForm = ref(false)
const entregaForm = ref({ titulo: '', fecha_entrega: '' })
const editandoEnt = ref(null)
const editEntForm = ref({ titulo: '', fecha_entrega: '' })

const cargarEntregables = async () => {
    loadingEnt.value = true
    errorEnt.value = ''
    try {
        const res = await api.get('/api/entregables')
        entregables.value = (res.data || []).filter(e => Number(e.id_proyecto) === Number(props.proyecto.id_proyecto))
    } catch (e) { errorEnt.value = 'Error al cargar entregables'; console.error(e) } finally { loadingEnt.value = false }
}

const createEntregable = async () => {
    if (!entregaForm.value.titulo.trim()) return
    loadingEnt.value = true
    try {
        const res = await api.post('/api/entregables', {
            id_proyecto: props.proyecto.id_proyecto,
            titulo: entregaForm.value.titulo.trim(),
            fecha_entrega: entregaForm.value.fecha_entrega || null
        })
        entregables.value.push(res.data)
        entregaForm.value = { titulo: '', fecha_entrega: '' }; showEntForm.value = false
        displayToast('Entregable creado', 'success')
    } catch (e) { displayToast('Error al crear entregable', 'error') } finally { loadingEnt.value = false }
}

const startEditEnt = (ent) => {
    editandoEnt.value = ent.id
    editEntForm.value = { titulo: ent.titulo || '', fecha_entrega: ent.fecha_entrega || '' }
}

const saveEditEnt = async (id) => {
    if (!editEntForm.value.titulo.trim()) return
    loadingEnt.value = true
    try {
        await api.put(`/api/entregables/${id}`, {
            id_proyecto: props.proyecto.id_proyecto,
            titulo: editEntForm.value.titulo.trim(),
            fecha_entrega: editEntForm.value.fecha_entrega || null
        })
        const idx = entregables.value.findIndex(e => e.id === id)
        if (idx !== -1) {
            entregables.value[idx].titulo = editEntForm.value.titulo.trim()
            entregables.value[idx].fecha_entrega = editEntForm.value.fecha_entrega || null
        }
        editandoEnt.value = null
        displayToast('Entregable actualizado', 'success')
    } catch (e) { displayToast('Error al actualizar', 'error') } finally { loadingEnt.value = false }
}

const deleteEnt = async (id) => {
    if (!confirm('Eliminar este entregable?')) return
    try {
        await api.delete(`/api/entregables/${id}`)
        entregables.value = entregables.value.filter(e => e.id !== id)
        displayToast('Entregable eliminado', 'success')
    } catch (e) { displayToast('Error al eliminar', 'error') }
}

// ─── Finanzas ───
const contratosProyecto = ref([])
const facturas = ref([])
const gastos = ref([])
const pagosPersonal = ref([])
const categoriasGasto = ref([])
const loadingFin = ref(false)
const errorFin = ref('')
const showGastoForm = ref(false)
const showFacturaForm = ref(false)
const submittingFin = ref(false)
const gastoForm = ref({ descripcion: '', monto: '', fecha: new Date().toISOString().slice(0, 10), id_categoria: null })
const facturaForm = ref({ numero: '', total: '', fecha: new Date().toISOString().slice(0, 10) })

const cargarFinanzas = async () => {
    loadingFin.value = true
    errorFin.value = ''
    try {
        const [contratosRes, facturasRes, gastosRes, pagosRes, catsRes] = await Promise.all([
            api.get('/api/contratos'),
            api.get('/api/facturas'),
            api.get('/api/gastos'),
            api.get('/api/pagos_personal'),
            api.get('/api/categoriasgasto')
        ])
        categoriasGasto.value = catsRes.data || []
        contratosProyecto.value = (contratosRes.data || []).filter(
            c => Number(c.id_proyecto) === Number(props.proyecto.id_proyecto)
        )
        const contratoIds = contratosProyecto.value.map(c => c.id_contrato)

        facturas.value = (facturasRes.data || []).filter(
            f => contratoIds.includes(Number(f.id_contrato))
        )
        gastos.value = (gastosRes.data || []).filter(
            g => contratoIds.includes(Number(g.id_contrato))
        )

        const personalIds = asignacionesPersonal.value.map(a => a.id_personal)
        pagosPersonal.value = (pagosRes.data || []).filter(
            p => personalIds.includes(Number(p.id_personal))
        )
    } catch (e) {
        errorFin.value = 'Error al cargar finanzas'
        console.error(e)
    } finally { loadingFin.value = false }
}

const createGasto = async () => {
    if (!gastoForm.value.descripcion.trim() || !gastoForm.value.monto) return
    const contrato = contratosProyecto.value[0]
    if (!contrato) { displayToast('Se necesita un contrato para registrar gastos', 'error'); return }
    submittingFin.value = true
    try {
        const res = await api.post('/api/gastos', {
            descripcion_gasto: gastoForm.value.descripcion.trim(),
            monto_gasto: Number(gastoForm.value.monto),
            fecha_gasto: gastoForm.value.fecha,
            id_categoria_gasto: gastoForm.value.id_categoria || null,
            id_contrato: contrato.id_contrato
        })
        gastos.value.push(res.data)
        gastoForm.value = { descripcion: '', monto: '', fecha: new Date().toISOString().slice(0, 10), id_categoria: null }
        showGastoForm.value = false
        displayToast('Gasto registrado', 'success')
    } catch (e) {
        displayToast('Error al registrar gasto', 'error')
    } finally { submittingFin.value = false }
}

const createFactura = async () => {
    if (!facturaForm.value.numero.trim() || !facturaForm.value.total) return
    const contrato = contratosProyecto.value[0]
    if (!contrato) { displayToast('Se necesita un contrato para crear facturas', 'error'); return }
    submittingFin.value = true
    try {
        const res = await api.post('/api/facturas', {
            numero_factura: facturaForm.value.numero.trim(),
            total: Number(facturaForm.value.total),
            fecha_factura: facturaForm.value.fecha,
            id_contrato: contrato.id_contrato,
            cliente_id: contrato.id_cliente || null
        })
        facturas.value.push(res.data)
        facturaForm.value = { numero: '', total: '', fecha: new Date().toISOString().slice(0, 10) }
        showFacturaForm.value = false
        displayToast('Factura creada', 'success')
    } catch (e) {
        displayToast('Error al crear factura', 'error')
    } finally { submittingFin.value = false }
}

const totalIngresos = computed(() =>
    facturas.value.reduce((sum, f) => sum + (Number(f.total) || 0), 0)
)
const totalGastos = computed(() =>
    gastos.value.reduce((sum, g) => sum + (Number(g.monto_gasto) || 0), 0)
)
const totalPagosPersonal = computed(() =>
    pagosPersonal.value.reduce((sum, p) => sum + (Number(p.monto_pagado) || 0), 0)
)
const balance = computed(() => totalIngresos.value - totalGastos.value - totalPagosPersonal.value)

const closeModal = () => {
    visible.value = false
    setTimeout(() => emit('close'), 300)
}
</script>

<template>
    <div v-show="props.show"
        @click.self="closeModal"
        class="fixed inset-0 flex items-center justify-center bg-green-900/40 backdrop-blur-sm z-50 p-4">
        <div class="bg-white border border-green-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center px-6 pt-6 pb-3 border-b border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">{{ proyecto.nombre_proyecto }}</h2>
                    <span class="text-sm text-gray-500">ID: #{{ proyecto.id_proyecto }} · {{ proyecto.nombre_tipo || 'Sin tipo' }}</span>
                </div>
                <button @click="closeModal" class="cursor-pointer text-gray-500 bg-gray-100 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Icon icon="mdi:close" width="20" height="20" />
                </button>
            </div>

            <div class="flex border-b border-gray-100 px-6 gap-1 overflow-x-auto">
                <button v-for="tab in tabs" :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                        'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                        activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    ]">
                    <Icon :icon="tab.icon" width="18" height="18" />
                    {{ tab.label }}
                </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <!-- General -->
                <div v-if="activeTab === 'general'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <h4 class="font-semibold text-gray-700 border-b pb-2">Informacion General</h4>
                        <div class="grid grid-cols-2 gap-y-2 text-sm">
                            <span class="text-gray-400">Cliente:</span>
                            <span class="font-medium">{{ proyecto.nombre_cliente || 'Sin contrato vinculado' }}</span>
                            <span class="text-gray-400">Tipo:</span>
                            <span class="font-medium">{{ proyecto.nombre_tipo || 'Desconocido' }}</span>
                            <span class="text-gray-400">Estado:</span>
                            <span :class="['px-2 py-0.5 rounded-full text-xs font-bold uppercase w-fit',
                                proyecto.nombre_estado === 'Finalizado' ? 'bg-green-100 text-green-700' :
                                proyecto.nombre_estado === 'Cancelado' ? 'bg-red-100 text-red-700' :
                                proyecto.nombre_estado === 'En Espera' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700']">
                                {{ proyecto.nombre_estado || 'Desconocido' }}
                            </span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <h4 class="font-semibold text-gray-700 border-b pb-2">Fechas y Presupuesto</h4>
                        <div class="space-y-1 text-sm">
                            <p><span class="text-gray-400">Inicio:</span> {{ formatearFecha(proyecto.fecha_inicio) }}</p>
                            <p><span class="text-gray-400">Fin Est.:</span> {{ formatearFecha(proyecto.fecha_fin_estimada) }}</p>
                            <p v-if="proyecto.fecha_fin"><span class="text-gray-400">Fin Real:</span> {{ formatearFecha(proyecto.fecha_fin) }}</p>
                            <p class="pt-2"><span class="text-gray-400">Presupuesto:</span> <span class="text-xl font-bold text-green-600 block">Bs. {{ FORMATO_MONEDA(proyecto.presupuesto) }}</span></p>
                        </div>
                    </div>
                </div>

                <!-- Locaciones -->
                <div v-if="activeTab === 'locaciones'" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-gray-700">Locaciones Asignadas</h4>
                        <button v-if="!showLocForm" @click="showLocForm = true" :disabled="loadingLocData"
                            class="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded border border-green-200 hover:bg-green-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <Icon icon="mdi:plus" class="w-4 h-4" /> Asignar
                        </button>
                    </div>
                    <div v-if="loadingLocData" class="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Icon icon="mdi:loading" class="animate-spin w-5 h-5" /> Cargando locaciones...
                    </div>
                    <div v-else-if="errorLoc" class="text-sm text-red-500 flex items-center gap-2">
                        <span>{{ errorLoc }}</span>
                        <button @click="cargarLocaciones" class="text-blue-500 underline cursor-pointer text-xs">Reintentar</button>
                    </div>
                    <template v-else>
                        <div v-if="showLocForm" class="bg-green-50/50 p-3 rounded-lg border border-green-100 flex gap-2 items-center">
                            <div class="flex-1"><SearchableSelect :options="locDisponibles" label-key="nombre_locacion" placeholder="Seleccione locacion..." v-model="idLocSeleccionada" :loading="loadingLocData" /></div>
                            <button @click="asignarLocacion" :disabled="!idLocSeleccionada || loadingLoc" class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition cursor-pointer">
                                <Icon v-if="loadingLoc" icon="mdi:loading" class="animate-spin w-4 h-4" />
                                <Icon v-else icon="mdi:check" class="w-4 h-4" />
                            </button>
                            <button @click="showLocForm = false" class="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition cursor-pointer">
                                <Icon icon="mdi:close" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="loc in locAsignadas" :key="loc.id_locacion"
                                class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2 text-sm">
                                <Icon icon="mdi:map-marker" class="w-4 h-4" /> {{ loc.nombre_locacion }}
                                <button @click="desasignarLocacion(loc)" class="text-red-500 hover:text-red-700 cursor-pointer">
                                    <Icon icon="mdi:close-circle" class="w-4 h-4" />
                                </button>
                            </span>
                        </div>
                        <div v-if="!locAsignadas.length && !showLocForm" class="text-gray-400 italic text-sm">Sin locaciones asignadas.</div>
                        <div class="border-t pt-3">
                            <CreateLocacionInline @created="onLocacionCreada" />
                        </div>
                    </template>
                </div>

                <!-- Recursos -->
                <div v-if="activeTab === 'recursos'" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-gray-700">Recursos Asignados</h4>
                        <button v-if="!showRecForm" @click="showRecForm = true" :disabled="loadingRecData"
                            class="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded border border-purple-200 hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <Icon icon="mdi:plus" class="w-4 h-4" /> Asignar
                        </button>
                    </div>
                    <div v-if="loadingRecData" class="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Icon icon="mdi:loading" class="animate-spin w-5 h-5" /> Cargando recursos...
                    </div>
                    <div v-else-if="errorRec" class="text-sm text-red-500 flex items-center gap-2">
                        <span>{{ errorRec }}</span>
                        <button @click="cargarRecursos" class="text-blue-500 underline cursor-pointer text-xs">Reintentar</button>
                    </div>
                    <template v-else>
                        <div v-if="showRecForm" class="bg-purple-50/50 p-3 rounded-lg border border-purple-100 space-y-2">
                            <div class="grid grid-cols-3 gap-2">
                                <div><SearchableSelect :options="recDisponibles" label-key="nombre_equipo" sublabel-key="nombre_tipo" placeholder="Recurso..." v-model="idRecSeleccionado" :loading="loadingRecData" /></div>
                                <input v-model="fechaInicioRec" type="date" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-purple-400" />
                                <input v-model="fechaFinRec" type="date" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button @click="asignarRecurso" :disabled="loadingRec" class="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 transition cursor-pointer disabled:opacity-50">
                                    <Icon v-if="loadingRec" icon="mdi:loading" class="animate-spin w-4 h-4" />
                                    <span v-else>Asignar</span>
                                </button>
                                <button @click="showRecForm = false" class="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition cursor-pointer">Cancelar</button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="r in recAsignados" :key="r.id_recurso"
                                class="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100 flex items-center gap-2 text-sm">
                                <Icon icon="mdi:tools" class="w-4 h-4" /> {{ r.nombre_equipo }}
                                <span class="text-xs italic">({{ formatearFechaDos(r.fecha_inicio_uso) }} - {{ formatearFechaDos(r.fecha_fin_uso) }})</span>
                                <button @click="desasignarRecurso(r)" class="text-red-500 hover:text-red-700 cursor-pointer">
                                    <Icon icon="mdi:close-circle" class="w-4 h-4" />
                                </button>
                            </span>
                        </div>
                        <div v-if="!recAsignados.length && !showRecForm" class="text-gray-400 italic text-sm">Sin recursos asignados.</div>
                        <div class="border-t pt-3">
                            <CreateRecursoInline @created="onRecursoCreado" />
                        </div>
                    </template>
                </div>

                <!-- Personal -->
                <div v-if="activeTab === 'personal'" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-gray-700">Personal Asignado</h4>
                        <button v-if="!showPersForm" @click="showPersForm = true" :disabled="loadingPersData"
                            class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <Icon icon="mdi:plus" class="w-4 h-4" /> Asignar
                        </button>
                    </div>
                    <div v-if="loadingPersData" class="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Icon icon="mdi:loading" class="animate-spin w-5 h-5" /> Cargando personal...
                    </div>
                    <div v-else-if="errorPers" class="text-sm text-red-500 flex items-center gap-2">
                        <span>{{ errorPers }}</span>
                        <button @click="cargarPersonal" class="text-blue-500 underline cursor-pointer text-xs">Reintentar</button>
                    </div>
                    <template v-else>
                        <div v-if="showPersForm" class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex gap-2 items-center">
                            <div class="flex-1"><SearchableSelect :options="personalDisponibles" label-key="nombre_personal" sublabel-key="nombre_rol" placeholder="Personal..." v-model="idPersonalSelect" :loading="loadingPersData" /></div>
                            <div class="flex items-center gap-1">
                                <input v-model="horasTrab" type="number" min="0" step="0.5" class="w-20 border border-gray-300 rounded text-sm p-2" placeholder="Horas" />
                                <span class="text-xs text-gray-400">hrs</span>
                            </div>
                            <button @click="asignarPersonal" :disabled="loadingPers" class="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50">
                                <Icon v-if="loadingPers" icon="mdi:loading" class="animate-spin w-4 h-4" />
                                <span v-else>Asignar</span>
                            </button>
                            <button @click="showPersForm = false" class="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition cursor-pointer">Cancelar</button>
                        </div>
                        <div v-if="asignacionesPersonal.length" class="space-y-2">
                            <div v-for="a in asignacionesPersonal" :key="a.id_asignacion"
                                class="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 flex items-center justify-between text-sm">
                                <div class="flex-1">
                                    <p class="font-semibold flex items-center gap-1"><Icon icon="mdi:account" class="w-4 h-4" />{{ a.nombre_personal || `#${a.id_personal}` }}</p>
                                    <div class="flex gap-4 text-xs text-gray-500 mt-0.5">
                                        <span>{{ a.nombre_rol || 'Sin rol' }}</span>
                                        <span v-if="a.salario > 0">Salario: Bs. {{ FORMATO_MONEDA(a.salario) }}/mes</span>
                                        <span v-if="a.horas_trabajadas > 0">{{ a.horas_trabajadas }} hrs</span>
                                        <span v-if="a.costo_estimado > 0" class="font-semibold text-indigo-700">Costo est.: Bs. {{ FORMATO_MONEDA(a.costo_estimado) }}</span>
                                    </div>
                                </div>
                                <button @click="desasignarPersonal(a.id_asignacion, a.nombre_personal || `#${a.id_personal}`)" class="text-red-500 hover:text-red-700 cursor-pointer ml-2">
                                    <Icon icon="mdi:close-circle" class="w-5 h-5" />
                                </button>
                            </div>
                            <div v-if="totalCostoPersonal > 0" class="text-right text-sm font-semibold text-indigo-700">
                                Costo total personal: Bs. {{ FORMATO_MONEDA(totalCostoPersonal) }}
                            </div>
                        </div>
                        <div v-else-if="!showPersForm" class="text-gray-400 italic text-sm">Sin personal asignado.</div>
                        <div class="border-t pt-3">
                            <CreatePersonalInline @created="onPersonalCreado" />
                        </div>
                    </template>
                </div>

                <!-- Entregables -->
                <div v-if="activeTab === 'entregables'" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-gray-700">Entregables del Proyecto</h4>
                        <button v-if="!showEntForm" @click="showEntForm = true" :disabled="loadingEnt"
                            class="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded border border-orange-200 hover:bg-orange-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                            <Icon icon="mdi:plus" class="w-4 h-4" /> Nuevo Entregable
                        </button>
                    </div>
                    <div v-if="showEntForm" class="bg-orange-50/50 p-3 rounded-lg border border-orange-100 space-y-2">
                        <div class="grid grid-cols-2 gap-2">
                            <input v-model="entregaForm.titulo" type="text" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-orange-400" placeholder="Titulo del entregable" />
                            <input v-model="entregaForm.fecha_entrega" type="date" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-orange-400" />
                        </div>
                        <div class="flex gap-2 justify-end">
                            <button @click="createEntregable" :disabled="loadingEnt" class="bg-orange-600 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-700 transition cursor-pointer disabled:opacity-50">
                                <Icon v-if="loadingEnt" icon="mdi:loading" class="animate-spin w-4 h-4 inline" />
                                <span v-else>Guardar</span>
                            </button>
                            <button @click="showEntForm = false" class="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition cursor-pointer">Cancelar</button>
                        </div>
                    </div>
                    <div v-if="loadingEnt" class="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Icon icon="mdi:loading" class="animate-spin w-5 h-5" /> Cargando entregables...
                    </div>
                    <div v-else-if="errorEnt" class="text-sm text-red-500 flex items-center gap-2">
                        <span>{{ errorEnt }}</span>
                        <button @click="cargarEntregables" class="text-blue-500 underline cursor-pointer text-xs">Reintentar</button>
                    </div>
                    <div v-else-if="entregables.length" class="space-y-2">
                        <div v-for="e in entregables" :key="e.id"
                            class="bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-center justify-between text-sm">
                            <div v-if="editandoEnt !== e.id" class="flex-1">
                                <p class="font-semibold text-orange-800">{{ e.titulo || e.descripcion }}</p>
                                <p v-if="e.fecha_entrega || e.fecha_entrega_estimada" class="text-xs text-gray-500">{{ formatearFecha(e.fecha_entrega || e.fecha_entrega_estimada) }}</p>
                            </div>
                            <div v-else class="flex-1 flex gap-2">
                                <input v-model="editEntForm.titulo" type="text" class="flex-1 border border-gray-300 rounded text-sm p-1.5" />
                                <input v-model="editEntForm.fecha_entrega" type="date" class="border border-gray-300 rounded text-sm p-1.5 w-40" />
                            </div>
                            <div class="flex gap-1 ml-2">
                                <template v-if="editandoEnt !== e.id">
                                    <button @click="startEditEnt(e)" class="text-blue-500 hover:text-blue-700 cursor-pointer">
                                        <Icon icon="mdi:pencil" class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteEnt(e.id)" class="text-red-500 hover:text-red-700 cursor-pointer">
                                        <Icon icon="mdi:delete" class="w-4 h-4" />
                                    </button>
                                </template>
                                <template v-else>
                                    <button @click="saveEditEnt(e.id)" class="text-green-500 hover:text-green-700 cursor-pointer">
                                        <Icon icon="mdi:check" class="w-4 h-4" />
                                    </button>
                                    <button @click="editandoEnt = null" class="text-red-500 hover:text-red-700 cursor-pointer">
                                        <Icon icon="mdi:close" class="w-4 h-4" />
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="!showEntForm" class="text-gray-400 italic text-sm">Sin entregables registrados.</div>
                </div>

                <!-- Finanzas -->
                <div v-if="activeTab === 'finanzas'" class="space-y-4">
                    <h4 class="font-semibold text-gray-700 border-b pb-2">Resumen Financiero</h4>
                    <div v-if="loadingFin" class="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <Icon icon="mdi:loading" class="animate-spin w-5 h-5" /> Cargando finanzas...
                    </div>
                    <div v-else-if="errorFin" class="text-sm text-red-500 flex items-center gap-2">
                        <span>{{ errorFin }}</span>
                        <button @click="cargarFinanzas" class="text-blue-500 underline cursor-pointer text-xs">Reintentar</button>
                    </div>
                    <div v-else>
                        <!-- Contrato Card -->
                        <div v-if="contratosProyecto.length" class="space-y-3">
                            <div v-for="c in contratosProyecto" :key="c.id_contrato"
                                class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div class="flex items-center justify-between mb-2">
                                    <h5 class="font-semibold text-blue-900">Contrato #{{ c.id_contrato }}</h5>
                                    <span class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{{ c.fecha_firma ? formatearFecha(c.fecha_firma) : 'Sin fecha' }}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div><span class="text-gray-500">Monto:</span> <span class="font-bold text-blue-800">Bs. {{ FORMATO_MONEDA(c.monto_contrato) }}</span></div>
                                    <div><span class="text-gray-500">Cliente:</span> {{ c.nombre_cliente || 'N/A' }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-gray-400 italic text-sm">Sin contrato vinculado.</div>

                        <!-- Acciones rapidas -->
                        <div class="flex gap-2">
                            <button v-if="!showFacturaForm && contratosProyecto.length" @click="showFacturaForm = true"
                                class="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded border border-green-200 hover:bg-green-100 transition flex items-center gap-1 cursor-pointer">
                                <Icon icon="mdi:plus" class="w-3 h-3" /> Crear Factura
                            </button>
                            <button v-if="!showGastoForm && contratosProyecto.length" @click="showGastoForm = true"
                                class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 transition flex items-center gap-1 cursor-pointer">
                                <Icon icon="mdi:plus" class="w-3 h-3" /> Registrar Gasto
                            </button>
                        </div>

                        <!-- Inline Factura Form -->
                        <div v-if="showFacturaForm" class="bg-green-50/50 p-3 rounded-lg border border-green-100 space-y-2">
                            <p class="text-xs font-bold text-green-800 uppercase">Nueva Factura</p>
                            <div class="grid grid-cols-3 gap-2">
                                <input v-model="facturaForm.numero" type="text" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400" placeholder="N° Factura" />
                                <input v-model="facturaForm.total" type="number" step="0.01" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400" placeholder="Monto total" />
                                <input v-model="facturaForm.fecha" type="date" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-green-400" />
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button @click="showFacturaForm = false" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                                <button @click="createFactura" :disabled="submittingFin" class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition cursor-pointer disabled:opacity-50">
                                    <Icon v-if="submittingFin" icon="mdi:loading" class="animate-spin w-3 h-3 inline" />
                                    <span v-else>Guardar</span>
                                </button>
                            </div>
                        </div>

                        <!-- Inline Gasto Form -->
                        <div v-if="showGastoForm" class="bg-red-50/50 p-3 rounded-lg border border-red-100 space-y-2">
                            <p class="text-xs font-bold text-red-800 uppercase">Nuevo Gasto</p>
                            <div class="grid grid-cols-4 gap-2">
                                <input v-model="gastoForm.descripcion" type="text" class="col-span-2 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-red-400" placeholder="Descripcion" />
                                <input v-model="gastoForm.monto" type="number" step="0.01" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-red-400" placeholder="Monto" />
                                <select v-model="gastoForm.id_categoria" class="border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-red-400 bg-white">
                                    <option :value="null">Sin categoria</option>
                                    <option v-for="cat in categoriasGasto" :key="cat.id_categoria_gasto" :value="cat.id_categoria_gasto">{{ cat.nombre_categoria }}</option>
                                </select>
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button @click="showGastoForm = false" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                                <button @click="createGasto" :disabled="submittingFin" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition cursor-pointer disabled:opacity-50">
                                    <Icon v-if="submittingFin" icon="mdi:loading" class="animate-spin w-3 h-3 inline" />
                                    <span v-else>Guardar</span>
                                </button>
                            </div>
                        </div>

                        <!-- Facturas List -->
                        <div v-if="facturas.length" class="space-y-1">
                            <p class="text-xs font-semibold text-gray-500">Facturas</p>
                            <div v-for="f in facturas" :key="f.id_factura"
                                class="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex justify-between text-xs">
                                <span>{{ f.numero_factura || '#'+f.id_factura }}</span>
                                <span class="font-semibold text-green-700">Bs. {{ FORMATO_MONEDA(f.total) }}</span>
                            </div>
                        </div>

                        <!-- Gastos List -->
                        <div v-if="gastos.length" class="space-y-1">
                            <p class="text-xs font-semibold text-gray-500">Gastos</p>
                            <div v-for="g in gastos" :key="g.id_gasto"
                                class="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex justify-between text-xs">
                                <span>{{ g.descripcion_gasto }}</span>
                                <span class="font-semibold text-red-700">Bs. {{ FORMATO_MONEDA(g.monto_gasto) }}</span>
                            </div>
                        </div>

                        <!-- Summary Cards -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div class="bg-green-50 rounded-xl p-3 border border-green-200">
                                <p class="text-xs text-gray-500">Ingresos</p>
                                <p class="text-lg font-bold text-green-600">Bs. {{ FORMATO_MONEDA(totalIngresos) }}</p>
                                <p class="text-xs text-gray-400">{{ facturas.length }} fact.</p>
                            </div>
                            <div class="bg-red-50 rounded-xl p-3 border border-red-200">
                                <p class="text-xs text-gray-500">Gastos</p>
                                <p class="text-lg font-bold text-red-600">Bs. {{ FORMATO_MONEDA(totalGastos) }}</p>
                                <p class="text-xs text-gray-400">{{ gastos.length }} gastos</p>
                            </div>
                            <div class="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
                                <p class="text-xs text-gray-500">Costo Personal</p>
                                <p class="text-lg font-bold text-indigo-600">Bs. {{ FORMATO_MONEDA(totalCostoPersonal) }}</p>
                                <p class="text-xs text-gray-400">{{ asignacionesPersonal.length }} pers.</p>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                <p class="text-sm font-semibold text-gray-700">Balance</p>
                                <p :class="['text-lg font-bold', balance >= 0 ? 'text-green-600' : 'text-red-600']">
                                    Bs. {{ FORMATO_MONEDA(balance) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 pb-6 pt-3 border-t border-gray-100 flex justify-end">
                <button @click="closeModal"
                    class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer">
                    Cerrar
                </button>
            </div>
        </div>

        <Toast v-model="showToast" :message="toastMessage" :type="toastType" />
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
