<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../services/api.js'
import Confirmation from '../../../components/Confirmation.vue'
import Toast from '../../../components/Toast.vue'

const categorias = ref([])

const nombre_categoria = ref('')

const loadingCategorias = ref(false)

const getCategoria = async () => {
    loadingCategorias.value = true
    try {
        const res = await api.get('/api/categoriasgasto')
        categorias.value = res.data
    } catch (err) {
        console.error('Error al cargar las categorias de gasto: ', err)
    } finally {
        loadingCategorias.value = false
    }
}

const createCategoria = async () => {
    try {
        const res = await api.post('/api/categoriasgasto', {
            nombre_categoria: nombre_categoria.value
        })

        categorias.value.push(res.data)
    } catch (err) {
        console.log('Error al crear la categoria de gasto')
    }
}

const deleteCategoria = async () => {
    try {

    } catch (err) {

    }
}

const editCategoria = async () => {
    try {
        
    } catch (err) {

    }
}

onMounted(() => {
    getCategoria()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestion de Estados de Proyectos</h3>
        </div>

        <div class="mb-4 border-b border-gray-200 pb-3">
            <p class="text-sm font-semibold text-gray-500 mb-1">Nuevo estado</p>
            <form @submit.prevent="createCategoria">
                <div class="flex space-x-2">
                    <div class="relative flex-1">
                        <input
                            v-model="nombre_categoria"
                            type="text"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Crear estado"
                            required
                        >
                    </div>
                    <button type="submit" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                        <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" />
                        Crear Estado
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
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar estado"
                    >
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <div v-if="loadingCategorias">
                    <div class="flex items-center justify-center text-center mt-3">
                        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
                            <Icon icon="mdi:error" width="25" height="25" class="mr-2" />
                            Cargando categorias de gastos...
                        </div>
                    </div>
                </div>
                <table v-else-if="categorias.length > 0" class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">ID</th>
                            <th class="px-4 py-2 text-left">Nombre Categoria</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="categoria in categorias" :key="categoria.id_categoria_gasto" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">{{ categoria.id_categoria_gasto }}</td>
                            <td class="px-4 py-2">{{ categoria.nombre_categoria }}</td>
                            <td class="px-4 py-2 flex items-center gap-1">
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
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
                            No hay categorias de gastos creadas.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Toast
            v-model="showToast"
            :message="toastMessage"
            :type="toastType"
        />

        <Confirmation
            :show="showConfirmation"
            title="Eliminar estado proyecto"
            message="¿Está seguro/a que desea eliminar este estado de proyecto?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            @confirm="deleteEstadoProyecto"
            @cancel="showConfirmation = false"
        />
    </div>
</template>
