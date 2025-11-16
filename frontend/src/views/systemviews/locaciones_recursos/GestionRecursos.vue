<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Recursos</h3>
        </div>
        <div
            class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)] p-3">
            <table class="table-auto w-full">
                <thead>
                    <tr class="bg-green-100 text-green-900">
                        <th class="px-4 py-2 text-left">ID</th>
                        <th class="px-4 py-2 text-left">Nombre del Equipo</th>
                        <th class="px-4 py-2 text-left">Tipo de Recurso</th>
                        <th class="px-4 py-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="recurso in recursos" :key="recurso.idrecurso"
                        class="border-b border-green-100 hover:bg-green-50 transition">
                        <td class="px-4 py-2">{{ recurso.idrecurso }}</td>
                        <td class="px-4 py-2">{{ recurso.nombreequipo }}</td>
                        <td class="px-4 py-2">{{ recurso.nombretipo }}</td>
                        <td class="px-4 py-2 flex items-center gap-1">
                            <button
                                class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" /> Editar
                            </button>
                            <button
                                class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors">
                                <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" /> Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-end mt-4">
            <button
                class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors"
                @click="showModal = true">
                <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" /> Nuevo Recurso
            </button>
        </div>

        <Modal
            v-if="showModal" :show="showModal" @close="showModal = false"
            title="Nuevo Recurso Tecnico"
        >
            <div>
                <form @submit.prevent="createRecursoTecnico" class="mb-2">
                    <div class="mb-2">
                        
                    </div>
                </form>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../../services/api.js'
import Modal from '../../../components/Modal.vue'

const showModal = ref(false)

tiposRecursos_select = ref([])

const cargarTiposRecursos = async () => {
    try {
        const res = await api.get('/api/tiposrecursos')
        tiposRecursos_select.value = res.data
    } catch (err) {
        console.error('Error al cargar los tipos de recurso:', err);
    }
}

const createRecursoTecnico = async () => {

}

onMounted(() => {
    cargarTiposRecursos()
})
</script>
