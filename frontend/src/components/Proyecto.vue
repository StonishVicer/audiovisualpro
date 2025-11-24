<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
    nombreProyecto: { type: String, required: true, default: 'Nombre del Proyecto' },
    tipoProyecto: { type: String, required: true, default: 'Tipo del Proyecto' },
    estadoProyecto: { type: String, required: true, default: 'Estado del Proyecto' },
    fechaInicio: { type: String, required: true, default: '' },
    fechaFinEstimada: { type: String, required: true, default: ''},
    presupuesto: { type: Number, required: true, default: 0 },
    locacionesAsignadas: { type: Array, required: false, default: () => [] }
})

const emit = defineEmits(['verDetalles', 'editar', 'eliminar'])

const eliminarProyecto = () => {
    emit('eliminar')
}

const editarProyecto = () => {
    emit('editar')
}

const verDetalles = () => {
    emit('verDetalles')
}
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
                        <p class="font-bold text-gray-700 mb-1">Detalles:</p>

                        <div
                            v-if="locacionesAsignadas && locacionesAsignadas.length > 0"
                            class="flex items-center gap-1 p-2 rounded bg-green-100 text-green-700 text-sm font-medium"
                        >
                            <Icon icon="mdi:check-circle-outline" width="18" height="18" />
                            Todo está bien.
                        </div>

                        <div
                            v-else
                            class="flex flex-col gap-1 p-2 rounded bg-red-100 text-red-700 text-sm font-medium border border-red-300"
                        >
                            <div class="flex items-center font-bold">
                                <Icon icon="mdi:alert-circle-outline" width="18" height="18" class="mr-1" />
                                Faltan:
                            </div>
                            <ul class="list-disc list-inside ml-2 text-xs">
                                <li>Asignar al menos una locación.</li>
                            </ul>
                        </div>
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
