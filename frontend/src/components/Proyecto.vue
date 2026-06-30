<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
    nombreProyecto: { type: String, required: true, default: 'Nombre del Proyecto' },
    tipoProyecto: { type: String, required: true, default: 'Tipo del Proyecto' },
    estadoProyecto: { type: String, required: true, default: 'Estado del Proyecto' },
    fechaInicio: { type: String, required: true, default: '' },
    fechaFinEstimada: { type: String, required: true, default: ''},
    presupuesto: { type: Number, required: true, default: 0 }
})

const emit = defineEmits(['verDetalles', 'editar', 'eliminar'])

const eliminarProyecto = () => { emit('eliminar') }
const editarProyecto = () => { emit('editar') }
const verDetalles = () => { emit('verDetalles') }

const estadoBadge = computed(() => {
    const estado = (props.estadoProyecto || '').toLowerCase()
    if (estado.includes('progreso') || estado.includes('curso') || estado.includes('activo')) {
        return { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'En Progreso' }
    }
    if (estado.includes('finalizado') || estado.includes('completado')) {
        return { class: 'bg-green-100 text-green-800 border-green-200', label: 'Finalizado' }
    }
    if (estado.includes('cancelado') || estado.includes('suspendido')) {
        return { class: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelado' }
    }
    return { class: 'bg-gray-100 text-gray-700 border-gray-200', label: props.estadoProyecto }
})
</script>

<template>
    <div class="bg-white rounded-xl shadow-lg p-3 border border-green-100 hover:border-green-500 transition h-full flex flex-col justify-between">
        <div class="mb-2">
            <div class="flex-col">
                <h3 class="font-semibold text-lg">{{ nombreProyecto }}</h3>
                <div class="text-sm text-gray-500 space-y-1">
                    <p><span class="font-semibold">Tipo:</span> {{ tipoProyecto }}</p>
                    <p><span class="font-semibold">Estado:</span> {{ estadoProyecto }}</p>
                    <p><span class="font-semibold">Inicio:</span> {{ fechaInicio }}</p>
                    <p><span class="font-semibold">Fin Estimado:</span> {{ fechaFinEstimada }}</p>
                    <p>
                        <span class="font-semibold">Presupuesto: </span>
                        <span class="text-green-500 font-semibold">
                            Bs. {{ presupuesto }}
                        </span>
                    </p>

                    <hr class="my-2 border-gray-100">

                    <div class="text-sm mt-2">
                        <p class="font-bold text-gray-700 mb-1">Estado:</p>
                        <span :class="['px-3 py-1.5 rounded-full text-xs font-semibold border', estadoBadge.class]">
                            {{ estadoBadge.label }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 font-semibold mt-2">
            <button @click="editarProyecto" class="items-center text-center flex justify-center bg-blue-500 rounded-lg text-white p-1 cursor-pointer hover:bg-blue-600 transition">
                <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                Editar
            </button>
            <button @click="eliminarProyecto" class="items-center text-center flex justify-center bg-red-500 rounded-lg text-white p-1 cursor-pointer hover:bg-red-600 transition">
                <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" />
                Eliminar
            </button>
            <button @click="verDetalles" class="col-span-2 items-center text-center flex justify-center bg-yellow-300 rounded-lg text-black p-1 cursor-pointer hover:bg-yellow-500 transition">
                <Icon icon="clarity:details-solid" width="20" height="20" class="mr-2" />
                Ver Detalles
            </button>
        </div>
    </div>
</template>
