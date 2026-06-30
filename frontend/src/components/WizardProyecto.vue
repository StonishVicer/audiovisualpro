<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../services/api.js'
import Toast from './Toast.vue'
import SearchableSelect from './SearchableSelect.vue'
import CreateClienteInline from './forms/CreateClienteInline.vue'
import CreateLocacionInline from './forms/CreateLocacionInline.vue'
import CreateRecursoInline from './forms/CreateRecursoInline.vue'
import CreatePersonalInline from './forms/CreatePersonalInline.vue'

const props = defineProps({
    modo: { type: String, default: 'crear' },
    proyectoExistente: { type: Object, default: null }
})

const emit = defineEmits(['close', 'created', 'updated'])

const currentStep = ref(1)
const totalSteps = 6
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const submitting = ref(false)

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
}

const stepLabels = ['Informacion Basica', 'Cliente', 'Locaciones', 'Recursos Tecnicos', 'Personal', 'Contrato']

// ── Step 1 ──
const nombre = ref('')
const id_tipo = ref(null)
const id_estado = ref(null)
const fecha_inicio = ref('')
const fecha_fin_estimada = ref('')
const presupuesto = ref(0)
const presupuestoMoneda = ref('VES')
const tiposProyectos = ref([])
const estadosProyectos = ref([])
const loadingTipos = ref(false)
const loadingEstados = ref(false)
const errorsStep1 = ref({ nombre: '', id_tipo: '', id_estado: '', fecha_inicio: '', fecha_fin_estimada: '', presupuesto: '' })

const minFechaFin = computed(() => {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
})

const step1Valid = computed(() => {
    return nombre.value.trim().length > 0 &&
        id_tipo.value != null &&
        id_estado.value != null &&
        fecha_inicio.value.length > 0 &&
        fecha_fin_estimada.value.length > 0 &&
        fecha_fin_estimada.value >= fecha_inicio.value &&
        presupuesto.value > 0
})

// ── Step 2 ──
const clientes = ref([])
const id_cliente_existente = ref(null)
const clienteCreado = ref(null)
const showClienteInline = ref(false)
const errorsStep2 = ref('')

const step2Valid = computed(() => id_cliente_existente.value != null || clienteCreado.value != null)

// ── Step 3 ──
const locaciones = ref([])
const locSeleccionadas = ref([])
const selectedLocId = ref(null)
const showLocacionInline = ref(false)
const loadingLocacionesOpts = ref(false)

// ── Step 4 ──
const recursos = ref([])
const recSeleccionados = ref([])
const selectedRecId = ref(null)
const fechaInicioRec = ref('')
const fechaFinRec = ref('')
const showRecursoInline = ref(false)
const loadingRecursosOpts = ref(false)

// ── Step 5 ──
const personal = ref([])
const persSeleccionados = ref([])
const selectedPersId = ref(null)
const showPersonalInline = ref(false)
const loadingPersonalOpts = ref(false)
const horasPers = ref('')

const personaSeleccionada = computed(() => {
    if (!selectedPersId.value) return null
    return personal.value.find(p => p.id_personal === selectedPersId.value) || null
})

const costoEstimadoPersona = computed(() => {
    if (!personaSeleccionada.value || !horasPers.value) return 0
    const salario = Number(personaSeleccionada.value.salario) || 0
    const horas = Number(horasPers.value) || 0
    return salario > 0 ? (salario / 160) * horas : 0
})

const costoTotalPersonal = computed(() =>
    persSeleccionados.value.reduce((sum, p) => sum + (Number(p.costo_estimado) || 0), 0)
)

// ── Step 6 ──
const descripcion_servicios = ref('Servicios de produccion audiovisual')

const resumenCliente = computed(() => {
    if (clienteCreado.value) return clienteCreado.value.nombre_cliente
    const c = clientes.value.find(c => c.id_cliente === id_cliente_existente.value)
    return c ? c.nombre_cliente : 'No seleccionado'
})

// ── Data Loading ──
const cargarTipos = async () => { loadingTipos.value = true; try { const r = await api.get('/api/tiposproyecto'); tiposProyectos.value = r.data } catch (e) { console.error(e); displayToast('Error al cargar tipos de proyecto', 'error') } finally { loadingTipos.value = false } }
const cargarEstados = async () => { loadingEstados.value = true; try { const r = await api.get('/api/estadosproyecto'); estadosProyectos.value = r.data } catch (e) { console.error(e); displayToast('Error al cargar estados de proyecto', 'error') } finally { loadingEstados.value = false } }
const cargarClientes = async () => { try { const r = await api.get('/api/clientes'); clientes.value = r.data } catch (e) { console.error(e) } }
const cargarLocaciones = async () => { loadingLocacionesOpts.value = true; try { const r = await api.get('/api/locacion'); locaciones.value = r.data } catch (e) { console.error(e) } finally { loadingLocacionesOpts.value = false } }
const cargarRecursos = async () => { loadingRecursosOpts.value = true; try { const r = await api.get('/api/recursostecnicos'); recursos.value = r.data } catch (e) { console.error(e) } finally { loadingRecursosOpts.value = false } }
const cargarPersonal = async () => { loadingPersonalOpts.value = true; try { const r = await api.get('/api/personal'); personal.value = r.data } catch (e) { console.error(e) } finally { loadingPersonalOpts.value = false } }

// ── Navigation ──
const nextStep = () => {
    if (currentStep.value === 1 && !step1Valid.value) {
        displayToast('Complete todos los campos obligatorios correctamente', 'error')
        return
    }
    if (currentStep.value === 2 && !step2Valid.value) {
        displayToast('Debe seleccionar o crear un cliente', 'error')
        return
    }
    if (currentStep.value < totalSteps) currentStep.value++
}
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }

// ── Step handlers ──
const onSelectCliente = (obj) => {
    if (obj) { id_cliente_existente.value = obj.id_cliente; clienteCreado.value = null }
}
const onSelectLocacion = (obj) => {
    if (obj && !locSeleccionadas.value.find(l => l.id_locacion === obj.id_locacion)) {
        locSeleccionadas.value.push({ ...obj, source: 'existing' })
        selectedLocId.value = null
    }
}
const removeLocacion = (idx) => { locSeleccionadas.value.splice(idx, 1) }

const onSelectRecurso = (obj) => {
    if (!obj) return
    if (!fechaInicioRec.value || !fechaFinRec.value) { displayToast('Asigne fechas de uso', 'error'); return }
    if (recSeleccionados.value.find(r => r.id_recurso === obj.id_recurso)) return
    recSeleccionados.value.push({ ...obj, fecha_inicio_uso: fechaInicioRec.value, fecha_fin_uso: fechaFinRec.value, source: 'existing' })
    selectedRecId.value = null; fechaInicioRec.value = ''; fechaFinRec.value = ''
}
const removeRecurso = (idx) => { recSeleccionados.value.splice(idx, 1) }

const onSelectPersonal = (obj) => {
    if (!obj) return
    if (persSeleccionados.value.find(p => p.id_personal === obj.id_personal)) return
    const salario = Number(obj.salario) || 0
    const horas = Number(horasPers.value) || 0
    persSeleccionados.value.push({
        ...obj,
        horas_trabajadas: horas,
        salario: salario,
        costo_estimado: salario > 0 && horas > 0 ? (salario / 160) * horas : 0,
        source: 'existing'
    })
    selectedPersId.value = null; horasPers.value = ''
}
const removePersonal = (idx) => { persSeleccionados.value.splice(idx, 1) }

// ── Inline creation ──
const onClienteCreado = (data) => { clienteCreado.value = data; clientes.value.push(data); showClienteInline.value = false }
const onLocacionCreada = (data) => { locaciones.value.push(data); locSeleccionadas.value.push({ ...data, source: 'new' }); showLocacionInline.value = false }
const onRecursoCreado = (data) => { recursos.value.push(data); recSeleccionados.value.push({ ...data, fecha_inicio_uso: fechaInicioRec.value, fecha_fin_uso: fechaFinRec.value, source: 'new' }); showRecursoInline.value = false; fechaInicioRec.value = ''; fechaFinRec.value = '' }
const onPersonalCreado = (data) => {
    const salario = Number(data.salario) || 0
    const horas = Number(horasPers.value) || 0
    personal.value.push(data)
    persSeleccionados.value.push({
        ...data,
        horas_trabajadas: horas,
        salario: salario,
        costo_estimado: salario > 0 && horas > 0 ? (salario / 160) * horas : 0,
        source: 'new'
    })
    showPersonalInline.value = false; horasPers.value = ''
}

// ── Submit ──
const submitProyecto = async () => {
    submitting.value = true
    try {
        const payload = {
            proyecto: { nombre: nombre.value, id_tipo: Number(id_tipo.value), id_estado: Number(id_estado.value), fecha_inicio: fecha_inicio.value, fecha_fin_estimada: fecha_fin_estimada.value, presupuesto: Number(presupuesto.value), moneda_presupuesto: presupuestoMoneda.value },
            cliente: clienteCreado.value ? { nuevo: { rif: clienteCreado.value.rif_cliente, nombre: clienteCreado.value.nombre_cliente, email: clienteCreado.value.email_cliente, telefono: clienteCreado.value.telefono_cliente } } : { id_cliente_existente: Number(id_cliente_existente.value) },
            locaciones: locSeleccionadas.value.map(l => l.source === 'new' ? { nueva: { nombre: l.nombre_locacion, direccion: l.direccion || l.direccion_locacion || '', descripcion: l.descripcion_locacion || '' } } : { id_locacion: l.id_locacion }),
            recursos: recSeleccionados.value.map(r => r.source === 'new' ? { nuevo: { nombre: r.nombre_equipo || r.nombre || '', id_tipo_recurso: r.id_tipo_recurso }, fecha_inicio_uso: r.fecha_inicio_uso, fecha_fin_uso: r.fecha_fin_uso } : { id_recurso: r.id_recurso, fecha_inicio_uso: r.fecha_inicio_uso, fecha_fin_uso: r.fecha_fin_uso }),
            personal: persSeleccionados.value.map(p => p.source === 'new' ? { nuevo: { nombre_personal: p.nombre_personal || '', cedula: p.cedula_personal || '', tipo_identificacion: p.tipo_identificacion || 'V', id_rol: Number(p.id_rol) || 0, salario: Number(p.salario) || 0, email: p.email_personal || '', telefono: p.telefono || '', prefijo_telefono: p.prefijo_telefono || null }, horas_trabajadas: Number(p.horas_trabajadas) || 0 } : { id_personal: p.id_personal, horas_trabajadas: Number(p.horas_trabajadas) || 0 }),
            contrato: { descripcion_servicios: descripcion_servicios.value, fecha_firma: new Date().toISOString().slice(0, 10) }
        }

        if (props.modo === 'editar' && props.proyectoExistente) {
            const res = await api.put(`/api/proyectos/complete/${props.proyectoExistente.id_proyecto}`, payload)
            displayToast('Proyecto actualizado exitosamente', 'success')
            emit('updated', res.data.proyecto)
        } else {
            const res = await api.createProyectoCompleto(payload)
            displayToast('Proyecto creado exitosamente', 'success')
            emit('created', res.data)
        }
        setTimeout(() => emit('close'), 800)
    } catch (err) {
        console.error('Error:', err)
        const msg = err.response?.data?.message || err.response?.data?.error || 'Error al procesar el proyecto'
        displayToast(msg, 'error')
    } finally { submitting.value = false }
}

// ── Preload edit data ──
const preloadEditData = async () => {
    if (props.modo !== 'editar' || !props.proyectoExistente) return
    const p = props.proyectoExistente
    nombre.value = p.nombre_proyecto || ''
    id_tipo.value = p.id_tipo_proyecto || p.id_tipo || null
    id_estado.value = p.id_estado_proyecto || p.id_estado || null
    fecha_inicio.value = p.fecha_inicio ? p.fecha_inicio.slice(0, 10) : ''
    fecha_fin_estimada.value = p.fecha_fin_estimada ? p.fecha_fin_estimada.slice(0, 10) : ''
    presupuesto.value = Number(p.presupuesto) || 0
    if (p.id_cliente) id_cliente_existente.value = p.id_cliente
    try {
        const res = await api.get(`/api/proyectos/${p.id_proyecto}/asignaciones`)
        if (res.data) {
            if (res.data.locaciones) locSeleccionadas.value = res.data.locaciones.map(l => ({ id_locacion: l.id_locacion, nombre_locacion: l.nombre_locacion, direccion: l.direccion, descripcion_locacion: l.descripcion_locacion, source: 'existing' }))
            if (res.data.recursos) recSeleccionados.value = res.data.recursos.map(r => ({ id_recurso: r.id_recurso, nombre_equipo: r.nombre_equipo, nombre_tipo: r.nombre_tipo, fecha_inicio_uso: r.fecha_inicio_uso ? r.fecha_inicio_uso.slice(0, 10) : '', fecha_fin_uso: r.fecha_fin_uso ? r.fecha_fin_uso.slice(0, 10) : '', source: 'existing' }))
            if (res.data.personal) persSeleccionados.value = res.data.personal.map(a => ({ id_personal: a.id_personal, nombre_personal: a.nombre_personal, nombre_rol: a.nombre_rol, horas_trabajadas: a.horas_trabajadas || 0, source: 'existing' }))
        }
    } catch (e) { console.error('Error preloading edit data:', e) }
}

onMounted(() => {
    cargarTipos(); cargarEstados(); cargarClientes(); cargarLocaciones(); cargarRecursos(); cargarPersonal()
    preloadEditData()
})
</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center bg-green-900/40 backdrop-blur-sm z-50 p-4">
        <div class="bg-white border border-green-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center px-6 pt-6 pb-3 border-b border-gray-100">
                <h2 class="text-2xl font-bold text-gray-800">{{ props.modo === 'editar' ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h2>
                <button @click="$emit('close')" class="cursor-pointer text-gray-500 bg-gray-100 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Icon icon="mdi:close" width="20" height="20" /></button>
            </div>

            <div class="px-6 pt-4">
                <div class="flex items-center gap-1 mb-2">
                    <span v-for="i in totalSteps" :key="i" :class="['flex-1 h-2 rounded-full transition-colors', i <= currentStep ? 'bg-green-500' : 'bg-gray-200']" />
                </div>
                <p class="text-sm text-gray-500 text-center font-medium">Paso {{ currentStep }} de {{ totalSteps }}: {{ stepLabels[currentStep - 1] }}</p>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <!-- Step 1 -->
                <div v-if="currentStep === 1" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Complete la informacion basica del proyecto</p>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="col-span-2">
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Nombre del Proyecto <span class="text-red-500">*</span></label>
                            <input v-model="nombre" type="text" :class="['w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400', !nombre.trim() ? 'border-red-300' : 'border-gray-200']" placeholder="Nombre del proyecto" />
                            <p v-if="!nombre.trim()" class="text-xs text-red-500 mt-0.5">El nombre es obligatorio</p>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Tipo de Proyecto <span class="text-red-500">*</span></label>
                            <select v-model="id_tipo" :disabled="loadingTipos" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                                <option :value="null" disabled>Seleccione un tipo...</option>
                                <option v-for="t in tiposProyectos" :key="t.id_tipo_proyecto" :value="t.id_tipo_proyecto">{{ t.nombre_tipo }}</option>
                            </select>
                            <p v-if="id_tipo == null" class="text-xs text-red-500 mt-0.5">Seleccione un tipo</p>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Estado <span class="text-red-500">*</span></label>
                            <select v-model="id_estado" :disabled="loadingEstados" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                                <option :value="null" disabled>Seleccione un estado...</option>
                                <option v-for="e in estadosProyectos" :key="e.id_estado_proyecto" :value="e.id_estado_proyecto">{{ e.nombre_estado }}</option>
                            </select>
                            <p v-if="id_estado == null" class="text-xs text-red-500 mt-0.5">Seleccione un estado</p>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Presupuesto <span class="text-red-500">*</span></label>
                            <div class="flex gap-1">
                                <div class="flex-1 relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{{ presupuestoMoneda === 'USD' ? '$' : 'Bs.' }}</span>
                                    <input v-model="presupuesto" type="number" min="0" :class="['w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400', presupuesto <= 0 ? 'border-red-300' : 'border-gray-200']" />
                                </div>
                                <button type="button" @click="presupuestoMoneda = 'USD'" :class="['px-3 py-2 rounded-lg text-sm font-bold border transition cursor-pointer', presupuestoMoneda === 'USD' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200']">$</button>
                                <button type="button" @click="presupuestoMoneda = 'VES'" :class="['px-3 py-2 rounded-lg text-sm font-bold border transition cursor-pointer', presupuestoMoneda === 'VES' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200']">Bs.</button>
                            </div>
                            <p v-if="presupuesto <= 0" class="text-xs text-red-500 mt-0.5">Debe ser mayor a 0</p>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Fecha Inicio <span class="text-red-500">*</span></label>
                            <input v-model="fecha_inicio" type="date" :class="['w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400', !fecha_inicio ? 'border-red-300' : 'border-gray-200']" />
                            <p v-if="!fecha_inicio" class="text-xs text-red-500 mt-0.5">Seleccione una fecha</p>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Fecha Fin Estimada <span class="text-red-500">*</span></label>
                            <input v-model="fecha_fin_estimada" :min="fecha_inicio || minFechaFin" type="date" :class="['w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400', !fecha_fin_estimada ? 'border-red-300' : 'border-gray-200']" />
                            <p v-if="!fecha_fin_estimada" class="text-xs text-red-500 mt-0.5">Seleccione una fecha</p>
                            <p v-else-if="fecha_fin_estimada < fecha_inicio" class="text-xs text-red-500 mt-0.5">Debe ser posterior al inicio</p>
                        </div>
                    </div>
                </div>

                <!-- Step 2 -->
                <div v-if="currentStep === 2" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Seleccione un cliente existente o cree uno nuevo</p>
                    <div v-if="!id_cliente_existente && !clienteCreado">
                        <SearchableSelect :options="clientes" label-key="nombre_cliente" placeholder="Buscar cliente por nombre o RIF..." v-model="id_cliente_existente" @select="onSelectCliente" :allow-create="true" create-label="Crear nuevo cliente..." @create="showClienteInline = true" />
                    </div>
                    <div v-if="id_cliente_existente" class="bg-green-50 p-3 rounded-lg border border-green-200 flex justify-between items-center">
                        <div><span class="font-semibold text-green-800">{{ clientes.find(c => c.id_cliente === id_cliente_existente)?.nombre_cliente }}</span><span class="text-sm text-gray-500 ml-2">{{ clientes.find(c => c.id_cliente === id_cliente_existente)?.rif_cliente }}</span></div>
                        <button @click="id_cliente_existente = null" class="text-red-500 hover:text-red-700 cursor-pointer"><Icon icon="mdi:close-circle" width="20" height="20" /></button>
                    </div>
                    <div v-if="clienteCreado" class="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                        <div><span class="font-semibold text-blue-800">{{ clienteCreado.nombre_cliente }}</span><span class="text-sm text-gray-500 ml-2">{{ clienteCreado.rif_cliente }}</span></div>
                        <button @click="clienteCreado = null" class="text-red-500 hover:text-red-700 cursor-pointer"><Icon icon="mdi:close-circle" width="20" height="20" /></button>
                    </div>
                    <div v-if="!id_cliente_existente && !clienteCreado" class="border-t pt-3"><CreateClienteInline @created="onClienteCreado" /></div>
                </div>

                <!-- Step 3 -->
                <div v-if="currentStep === 3" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Busque y asigne locaciones al proyecto</p>
                    <SearchableSelect :options="locaciones" label-key="nombre_locacion" placeholder="Buscar locacion..." v-model="selectedLocId" @select="onSelectLocacion" :loading="loadingLocacionesOpts" :allow-create="true" create-label="Crear nueva locacion..." @create="showLocacionInline = true" />
                    <div v-if="locSeleccionadas.length" class="flex flex-wrap gap-2">
                        <span v-for="(l, idx) in locSeleccionadas" :key="idx" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-2 text-sm">
                            <Icon icon="mdi:map-marker" class="w-4 h-4" /> {{ l.nombre_locacion }}
                            <button @click="removeLocacion(idx)" class="text-red-500 hover:text-red-700 cursor-pointer"><Icon icon="mdi:close-circle" class="w-4 h-4" /></button>
                        </span>
                    </div>
                    <div class="border-t pt-3"><CreateLocacionInline @created="onLocacionCreada" /></div>
                </div>

                <!-- Step 4 -->
                <div v-if="currentStep === 4" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Busque y asigne recursos tecnicos con fechas de uso</p>
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-2"><SearchableSelect :options="recursos" label-key="nombre_equipo" sublabel-key="nombre_tipo" placeholder="Buscar recurso..." v-model="selectedRecId" @select="onSelectRecurso" :loading="loadingRecursosOpts" :allow-create="true" create-label="Crear nuevo recurso..." @create="showRecursoInline = true" /></div>
                        <input v-model="fechaInicioRec" type="date" class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" placeholder="Inicio" />
                        <div class="col-span-3"><input v-model="fechaFinRec" type="date" class="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm w-full" placeholder="Fin" /></div>
                    </div>
                    <div v-if="recSeleccionados.length" class="flex flex-wrap gap-2">
                        <span v-for="(r, idx) in recSeleccionados" :key="idx" class="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100 flex items-center gap-2 text-sm">
                            <Icon icon="mdi:tools" class="w-4 h-4" /> {{ r.nombre_equipo }}
                            <span class="text-xs italic">({{ r.fecha_inicio_uso }} - {{ r.fecha_fin_uso }})</span>
                            <button @click="removeRecurso(idx)" class="text-red-500 hover:text-red-700 cursor-pointer"><Icon icon="mdi:close-circle" class="w-4 h-4" /></button>
                        </span>
                    </div>
                    <div class="border-t pt-3"><CreateRecursoInline @created="onRecursoCreado" /></div>
                </div>

                <!-- Step 5 -->
                <div v-if="currentStep === 5" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Busque y asigne personal al proyecto</p>
                    <div class="flex gap-2">
                        <div class="flex-1"><SearchableSelect :options="personal" label-key="nombre_personal" sublabel-key="nombre_rol" placeholder="Buscar personal..." v-model="selectedPersId" @select="onSelectPersonal" :loading="loadingPersonalOpts" :allow-create="true" create-label="Crear nuevo personal..." @create="showPersonalInline = true" /></div>
                        <div class="flex flex-col items-center gap-0.5">
                            <input v-model="horasPers" type="number" min="0" step="0.5" class="w-20 border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" placeholder="Horas" />
                            <span class="text-xs text-gray-400">horas</span>
                        </div>
                    </div>
                    <div v-if="personaSeleccionada && horasPers" class="bg-green-50 rounded-lg p-2 border border-green-100 text-xs text-green-800 space-y-1">
                        <p v-if="personaSeleccionada.salario > 0">
                            <span class="text-gray-500">Salario mensual:</span> Bs. {{ Number(personaSeleccionada.salario).toLocaleString('es-VE') }}
                            <span class="text-gray-400"> → Tarifa/hora: Bs. {{ (Number(personaSeleccionada.salario) / 160).toFixed(2) }}</span>
                        </p>
                        <p v-if="costoEstimadoPersona > 0" class="font-semibold">
                            Costo estimado: Bs. {{ costoEstimadoPersona.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                        </p>
                    </div>
                    <div v-if="persSeleccionados.length" class="flex flex-wrap gap-2">
                        <span v-for="(p, idx) in persSeleccionados" :key="idx" class="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-2 text-sm">
                            <Icon icon="mdi:account" class="w-4 h-4" /> {{ p.nombre_personal }}
                            <span v-if="p.horas_trabajadas" class="text-xs">({{ p.horas_trabajadas }} hrs)</span>
                            <span v-if="p.costo_estimado > 0" class="text-xs font-semibold">Bs. {{ Math.round(p.costo_estimado) }}</span>
                            <button @click="removePersonal(idx)" class="text-red-500 hover:text-red-700 cursor-pointer"><Icon icon="mdi:close-circle" class="w-4 h-4" /></button>
                        </span>
                    </div>
                    <div class="border-t pt-3"><CreatePersonalInline @created="onPersonalCreado" /></div>
                </div>

                <!-- Step 6 -->
                <div v-if="currentStep === 6" class="space-y-3">
                    <p class="text-sm text-gray-400 mb-2">Revise el resumen y finalice</p>
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div><span class="text-gray-400">Proyecto:</span><span class="font-semibold ml-1">{{ nombre }}</span></div>
                            <div><span class="text-gray-400">Cliente:</span><span class="font-semibold ml-1">{{ resumenCliente }}</span></div>
                            <div><span class="text-gray-400">Presupuesto:</span><span class="font-semibold text-green-600 ml-1">{{ presupuestoMoneda === 'USD' ? '$' : 'Bs.' }} {{ presupuesto }}</span></div>
                            <div><span class="text-gray-400">Fecha Firma:</span><span class="font-semibold ml-1">{{ new Date().toLocaleDateString('es-VE') }}</span></div>
                            <div><span class="text-gray-400">Locaciones:</span><span class="font-semibold ml-1">{{ locSeleccionadas.length }}</span></div>
                            <div><span class="text-gray-400">Recursos:</span><span class="font-semibold ml-1">{{ recSeleccionados.length }}</span></div>
                            <div><span class="text-gray-400">Personal:</span><span class="font-semibold ml-1">{{ persSeleccionados.length }}</span></div>
                            <div v-if="costoTotalPersonal > 0"><span class="text-gray-400">Costo Personal Est.:</span><span class="font-semibold text-indigo-600 ml-1">Bs. {{ Math.round(costoTotalPersonal).toLocaleString('es-VE') }}</span></div>
                            <div><span class="text-gray-400">Fechas:</span><span class="font-semibold ml-1">{{ fecha_inicio }} al {{ fecha_fin_estimada }}</span></div>
                        </div>
                        <div>
                            <label class="text-sm font-semibold text-gray-500 block mb-1">Descripcion de Servicios</label>
                            <textarea v-model="descripcion_servicios" rows="3" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none text-sm"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 pb-6 pt-3 border-t border-gray-100 flex justify-between items-center">
                <button v-if="currentStep > 1" @click="prevStep" class="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer font-medium"><Icon icon="mdi:chevron-left" width="20" height="20" /> Anterior</button>
                <div v-else></div>
                <button v-if="currentStep < totalSteps" @click="nextStep" :disabled="currentStep === 1 && !step1Valid || currentStep === 2 && !step2Valid" class="flex items-center gap-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <Icon icon="mdi:chevron-right" width="20" height="20" /></button>
                <button v-else @click="submitProyecto" :disabled="submitting" class="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer font-bold text-lg disabled:opacity-50"><Icon v-if="submitting" icon="mdi:loading" class="animate-spin w-5 h-5" /><Icon v-else icon="mdi:check-circle" width="24" height="24" /> {{ props.modo === 'editar' ? 'Guardar Cambios' : 'Crear Proyecto' }}</button>
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
