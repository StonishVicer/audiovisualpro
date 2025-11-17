<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import Toast from '../../../components/Toast.vue';
import api from '../../../services/api.js'

const isLoading = ref(false)
const loadingTipos = ref(false)

const nombre_tipo = ref('')

const tipos_proyecto = ref([])

const createTipoProyecto = async () => {
    isLoading.value = true

    try {
        const res = await api.post('/api/tiposproyecto', {
            nombre_tipo:  nombre_tipo.value
        })

        console.log('Tipo de proyecto creado con exito: ', res.data)
        tipos_proyecto.value.push(res.data)
        nombre_tipo.value = ''
    } catch (err) {
        err.response ? console.error('Error al crear el tipo de proyecto: ', err.response.data) : console.error('Error al crear el tipo de proyecto: ', err)
    } finally {
        isLoading.value = false
    }
}

const getTiposProyecto = async () => {
    loadingTipos.value = true

    try {
        const res = await api.get('/api/tiposproyecto')
        tipos_proyecto.value = res.data
        console.log('Tipos de proyecto obtenidos con exito: ', tipos_proyecto.value)
    } catch (err) {
        console.error('Error al obtener los tipos de proyecto: ', err)
    } finally {
        loadingTipos.value = false
    }
}

const deleteTipoProyecto = async (id) => {
    const confirmacion = confirm('Esta seguro/a que desea eliminar este tipo de proyecto?')
    if (!confirmacion) return
    isLoading.value = true

    try {
        await api.delete(`/api/tiposproyecto/${id}`)
        tipos_proyecto.value = tipos_proyecto.value.filter(tipo => tipo.id_tipo_proyecto !== id)
    } catch (err) {
        console.error('Error al eliminar el tipo de proyecto: ', err)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    getTiposProyecto()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestion de Tipos de Proyectos</h3>
        </div>

        <div class="mb-4 border-b border-gray-200 pb-3">
            <p class="text-sm font-semibold text-gray-500 mb-1">Nuevo tipo</p>
            <form @submit.prevent="createTipoProyecto">
                <div class="flex space-x-2">
                    <div class="relative flex-1">
                        <input
                            v-model="nombre_tipo"
                            type="text"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Crear tipo"
                            required
                        >
                    </div>
                    <button type="submit" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                        <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" />
                        Crear Tipo
                    </button>
                </div>
            </form>
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
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar tipo"
                    >
                </div>
                
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingTipos">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            Cargando tipos de proyectos...
                        </div>
                    </div>
                </div>
                <table v-else-if="tipos_proyecto.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">ID</th>
                            <th class="px-4 py-2 text-left">Nombre Tipo</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tipos in tipos_proyecto" :key="tipos.id_tipo_proyecto" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">{{ tipos.id_tipo_proyecto }}</td>
                            <td class="px-4 py-2">{{ tipos.nombre_tipo }}</td>
                            <td class="px-4 py-2 flex items-center gap-1">
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    @click="deleteTipoProyecto(tipos.id_tipo_proyecto)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" />
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else>
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            No hay tipos de proyectos creados.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Toast
            v-model="isLoading"
            message="Conectando..."
            type="loading"
        />
    </div>
</template>