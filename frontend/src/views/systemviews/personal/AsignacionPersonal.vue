<template>
    <div class="h-screen flex flex-col">
        <!-- HEADER CON BOTÓN SIEMPRE VISIBLE -->
        <div class="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between px-2">
            <h3 class="font-bold text-lg">Asignación de Personal a Proyecto</h3>
            <button
                class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                @click="abrirNuevaAsignacion">
                <Icon icon="material-symbols:add" width="20" height="20" class="mr-1" /> Nueva Asignación
            </button>
        </div>

        <!-- LISTA DE ASIGNACIONES -->
        <div class="flex-1 overflow-y-auto p-2">
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <!-- Estado vacío -->
                <div v-if="asignaciones.length === 0"
                    class="bg-white border-dashed border-2 rounded-xl px-5 py-6 flex flex-col items-center justify-center text-gray-500"
                    style="min-width:290px;">
                    <Icon icon="material-symbols:work-history" width="40" height="40" class="mb-2 text-green-600" />
                    <p class="font-semibold mb-1">No hay asignaciones registradas</p>
                    <p class="text-sm mb-1 text-center">Haz clic en "Nueva Asignación" en la parte superior.</p>
                </div>

                <!-- Tarjetas de asignaciones -->
                <div v-for="asignacion in asignaciones" :key="asignacion.id_asignacion"
                    class="bg-white border rounded-xl shadow px-5 py-4 flex flex-col justify-between"
                    style="min-width:290px;">
                    <div>
                        <div class="flex items-center mb-2">
                            <Icon icon="material-symbols:work-history" width="28" height="28" class="text-green-600" />
                            <span class="pl-2 text-xl font-bold">
                                Proyecto {{ asignacion.id_proyecto }}
                            </span>
                        </div>
                        <span class="block font-medium mb-2 text-gray-700 text-base">
                            Personal:
                            <span class="font-normal">
                                {{ asignacion.nombre_personal || asignacion.id_personal }}
                            </span>
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Horas trabajadas: {{ asignacion.horas_trabajadas ?? 0 }}
                        </span>
                        <span class="block text-gray-500 font-semibold text-sm mb-2">
                            Fecha registro:
                            {{ asignacion.fecha_registro ? asignacion.fecha_registro.slice(0, 10) : '—' }}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 mt-4">
                        <div class="flex gap-2">
                            <button
                                class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                                @click="mostrarDetalles(asignacion)">
                                <Icon icon="material-symbols:info-outline" width="20" height="20" class="mr-1" /> Ver
                                Detalles
                            </button>
                            <button
                                class="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                                @click="editarAsignacion(asignacion)">
                                <Icon icon="material-symbols:edit" width="20" height="20" /> Editar
                            </button>
                        </div>
                        <button
                            class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors gap-1 w-full"
                            @click="eliminarAsignacion(asignacion.id_asignacion)">
                            <Icon icon="material-symbols:delete" width="20" height="20" /> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL NUEVA / EDITAR ASIGNACIÓN -->
        <div v-if="modalNuevaAsignacion" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div class="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg relative">
                <button class="absolute top-2 right-2 text-2xl font-bold text-gray-500"
                    @click="modalNuevaAsignacion = false">&times;</button>
                <h4 class="font-bold text-lg mb-4 text-center">
                    {{ esEdicion ? 'Editar Asignación' : 'Nueva Asignación' }}
                </h4>
                <form @submit.prevent="agregarAsignacion">
                    <div class="mb-4">
                        <label class="block font-medium mb-1">ID Proyecto</label>
                        <input v-model="nuevaAsignacion.id_proyecto" required class="w-full border px-3 py-2 rounded"
                            type="number" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">ID Personal</label>
                        <input v-model="nuevaAsignacion.id_personal" required class="w-full border px-3 py-2 rounded"
                            type="number" />
                    </div>
                    <div class="mb-4">
                        <label class="block font-medium mb-1">Horas Trabajadas</label>
                        <input v-model="nuevaAsignacion.horas_trabajadas" required
                            class="w-full border px-3 py-2 rounded" type="number" step="0.01" />
                    </div>
                    <div class="flex justify-end gap-2 mt-5">
                        <button type="button" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            @click="modalNuevaAsignacion = false">Cancelar</button>
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
                <h4 class="font-bold text-lg mb-2 text-center">Detalles de Asignación</h4>
                <div class="space-y-2">
                    <div>
                        <span class="font-medium text-gray-600">ID Asignación:</span> {{ detallesActual.id_asignacion }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">ID Proyecto:</span> {{ detallesActual.id_proyecto }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">ID Personal:</span> {{ detallesActual.id_personal }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Horas Trabajadas:</span>
                        {{ detallesActual.horas_trabajadas }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Fecha de Registro:</span>
                        {{ detallesActual.fecha_registro }}
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

// Lista de asignaciones
const asignaciones = ref([])

// Estado de modales
const modalNuevaAsignacion = ref(false)
const modalDetalles = ref(false)

// Para saber si es creación o edición
const asignacionEditandoId = ref(null)
const esEdicion = computed(() => asignacionEditandoId.value !== null)

// Datos de detalles
const detallesActual = ref({
    id_asignacion: null,
    id_proyecto: '',
    id_personal: '',
    horas_trabajadas: '',
    fecha_registro: ''
})

// Datos de formulario nueva/editar asignación
const nuevaAsignacion = ref({
    id_proyecto: '',
    id_personal: '',
    horas_trabajadas: ''
})

// Cargar asignaciones desde backend
const getAsignaciones = async () => {
    try {
        const { data } = await api.get('/api/asignaciones')
        asignaciones.value = data
    } catch (err) {
        console.error(err)
        alert('Error al cargar las asignaciones')
    }
}

onMounted(getAsignaciones)

// Abrir modal para NUEVA asignación
const abrirNuevaAsignacion = () => {
    asignacionEditandoId.value = null
    nuevaAsignacion.value = {
        id_proyecto: '',
        id_personal: '',
        horas_trabajadas: ''
    }
    modalNuevaAsignacion.value = true
}

// Mostrar detalles
const mostrarDetalles = (asignacion) => {
    detallesActual.value = { ...asignacion }
    modalDetalles.value = true
}

// Abrir modal para EDITAR asignación
const editarAsignacion = (asignacion) => {
    asignacionEditandoId.value = asignacion.id_asignacion
    nuevaAsignacion.value = {
        id_proyecto: asignacion.id_proyecto,
        id_personal: asignacion.id_personal,
        horas_trabajadas: asignacion.horas_trabajadas ?? ''
    }
    modalNuevaAsignacion.value = true
}

// Crear o actualizar asignación
const agregarAsignacion = async () => {
    const a = nuevaAsignacion.value

    if (!a.id_proyecto || !a.id_personal) {
        alert('Proyecto y personal son obligatorios')
        return
    }

    const payload = {
        id_proyecto: a.id_proyecto,
        id_personal: a.id_personal,
        horas_trabajadas: Number(a.horas_trabajadas || 0)
    }

    try {
        if (esEdicion.value) {
            const { data } = await api.put(`/api/asignaciones/${asignacionEditandoId.value}`, payload)
            const idx = asignaciones.value.findIndex(a => a.id_asignacion === asignacionEditandoId.value)
            if (idx !== -1) asignaciones.value[idx] = data
        } else {
            const { data } = await api.post('/api/asignaciones', payload)
            asignaciones.value.push(data)
        }

        modalNuevaAsignacion.value = false
        asignacionEditandoId.value = null
    } catch (err) {
        console.error(err)
        alert('No se pudo guardar la asignación')
    }
}

// Eliminar asignación
const eliminarAsignacion = async (id_asignacion) => {
    if (!confirm('¿Seguro que deseas eliminar esta asignación?')) return

    try {
        await api.delete(`/api/asignaciones/${id_asignacion}`)
        asignaciones.value = asignaciones.value.filter(a => a.id_asignacion !== id_asignacion)
    } catch (err) {
        console.error(err)
        alert('No se pudo eliminar la asignación')
    }
}
</script>
