<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'
import Toast from '../../components/Toast.vue'

const categorias = ref([])
const nombre_categoria = ref('')
const editandoId = ref(null)
const editandoNombre = ref('')
const loadingCategorias = ref(false)
const showEditModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
}

const getCategoria = async () => {
    loadingCategorias.value = true
    try {
        const res = await api.get('/api/categoriasgasto')
        categorias.value = res.data
    } catch (err) {
        console.error('Error al cargar las categorias de gasto: ', err)
        displayToast('Error al cargar categorías', 'error')
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
        nombre_categoria.value = ''
        displayToast('Categoría creada exitosamente', 'success')
    } catch (err) {
        console.error('Error al crear la categoria de gasto:', err)
        displayToast('Error al crear la categoría', 'error')
    }
}

const abrirEditar = (categoria) => {
    editandoId.value = categoria.id_categoria_gasto
    editandoNombre.value = categoria.nombre_categoria
    showEditModal.value = true
}

const editCategoria = async () => {
    try {
        const res = await api.put(`/api/categoriasgasto/${editandoId.value}`, {
            nombre_categoria: editandoNombre.value
        })
        const idx = categorias.value.findIndex(c => c.id_categoria_gasto === editandoId.value)
        if (idx !== -1) categorias.value[idx] = res.data
        showEditModal.value = false
        displayToast('Categoría actualizada', 'success')
    } catch (err) {
        console.error('Error al editar la categoria:', err)
        displayToast('Error al editar la categoría', 'error')
    }
}

const deleteCategoria = async (id) => {
    if (!confirm('¿Está seguro/a que desea eliminar esta categoría de gasto?')) return
    try {
        await api.delete(`/api/categoriasgasto/${id}`)
        categorias.value = categorias.value.filter(c => c.id_categoria_gasto !== id)
        displayToast('Categoría eliminada', 'success')
    } catch (err) {
        console.error('Error al eliminar la categoria:', err)
        displayToast('Error al eliminar la categoría', 'error')
    }
}

onMounted(() => {
    getCategoria()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestión de Categorías de Gasto</h3>
        </div>

        <div class="mb-4 border-b border-gray-200 pb-3">
            <p class="text-sm font-semibold text-gray-500 mb-1">Nueva categoría</p>
            <form @submit.prevent="createCategoria">
                <div class="flex space-x-2">
                    <div class="relative flex-1">
                        <input
                            v-model="nombre_categoria"
                            type="text"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Nombre de la categoría"
                            required
                        >
                    </div>
                    <button type="submit" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                        <Icon icon="material-symbols:add" width="25" height="25" class="mr-2" />
                        Crear Categoría
                    </button>
                </div>
            </form>
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
                                <button @click="abrirEditar(categoria)"
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button @click="deleteCategoria(categoria.id_categoria_gasto)"
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

        <!-- Modal Editar -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h4 class="font-bold text-lg mb-4 text-center">Editar Categoría</h4>
                <form @submit.prevent="editCategoria">
                    <label class="block text-sm font-semibold text-gray-600 mb-1">Nombre</label>
                    <input v-model="editandoNombre" type="text" required
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-green-400 outline-none" />
                    <div class="flex gap-3">
                        <button type="button" @click="showEditModal = false"
                            class="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit"
                            class="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <Toast v-model="showToast" :message="toastMessage" :type="toastType" />
    </div>
</template>
