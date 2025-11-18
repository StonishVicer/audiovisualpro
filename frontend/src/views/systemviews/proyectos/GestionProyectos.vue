<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import Proyecto from '../../../components/Proyecto.vue'
import api from '../../../services/api.js'
import Toast from '../../../components/Toast.vue'
import Modal from '../../../components/Modal.vue'

//CARGAR OPTIONS
const tiposProyectos = ref([])
const estadosProyectos = ref([])

//FORM INFO
const nombre_proyecto = ref('')
const id_tipo_proyecto = ref(null)
const id_estado_proyecto = ref(null)
const fechaInicio = ref('')
const fechaFinEstimada = ref('')

const showModal = ref(false)

const arrayTest = [1, 2, 3, 4, 5, 6, 7, 8]

const limpiarCampos = () => {
    nombre_proyecto.value = ''
    id_tipo_proyecto.value = null
    id_estado_proyecto.value = null
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

onMounted(() => {
    cargarTiposProyectos()
    cargarEstadosProyectos()
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
            <div class="grid grid-cols-2 gap-3">
                <div v-for="array in arrayTest">
                    <Proyecto />
                </div>
            </div>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            title="Nuevo Proyecto"
        >
            <div>
                <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                    <Icon icon="mdi:error" width="25" heigth="25" class="mr-2" />
                    Complete todos los campos.
                </div>

                <form class="mb-2">
                    <div class="mb-2">
                        <div class="flex flex-col mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Nombre del Proyecto</label>
                            <input
                                type="text"
                                v-model="nombre_proyecto"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Nombre"
                            >
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Tipo de Proyecto</label>
                            <select
                                v-model="id_tipo_proyecto"
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mt-1"
                            >
                                <option :value="null" selected disabled>Seleccione un tipo</option>
                                <option v-for="tipo in tiposProyectos" :key="tipo.id_tipo_proyecto" :value="tipo.id_tipo_proyecto">{{ tipo.nombre_tipo }}</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Estado de Proyecto</label>
                            <select
                                v-model="id_estado_proyecto"
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus_ring-2 focus:ring-green-400 mt-1"
                            >
                                <option :value="null" selected disabled>Seleccione un estado</option>
                                <option v-for="estado in estadosProyectos" :key="estado.id_estado_proyecto" :value="estado.id_estado_proyecto">{{ estado.nombre_estado }}</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Fecha de Inicio</label>
                        </div>
                        <div class="mb-2">
                            <label class="text-sm font-semibold text-gray-500 mb-1">Fecha de Finalizacion (Estimada)</label>
                        </div>
                    </div>
                    <button type="submit" class="w-full flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                        Crear proyecto
                    </button>
                </form>
                <button @click="limpiarCampos" class="w-full flex items-center text-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                    Limpiar campos
                </button>
            </div>
        </Modal>
    </div>
</template>
