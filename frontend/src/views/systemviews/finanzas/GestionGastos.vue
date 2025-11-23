<template> Gestion Gastos 
  <div class="h-screen flex flex-col">
    <div class="border-b border-gray-200 pb-3 mb-4">
      <h3 class="text-center font-bold text-lg">Gestión de Gastos</h3>
    </div>

    <div class="mb-3 flex justify-between items-center">
      <div class="flex space-x-2">
        <input
          v-model="query"
          type="text"
          placeholder="Buscar gasto, proyecto o descripción"
          class="transition w-[420px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div class="flex items-center gap-2">
        <button @click="openNew" class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="mdi:plus" width="20" height="20" class="mr-2" /> Nuevo Gasto
        </button>
        <button @click="getGastos" class="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="material-symbols:refresh" width="20" height="20" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[300px] max-h-[calc(100vh-240px)] p-2">
      <div v-if="loadingGastos" class="p-4 text-center text-gray-600">Cargando gastos...</div>

      <table v-else-if="filtered.length" class="table-auto w-full">
        <thead>
          <tr class="bg-gray-100 text-gray-800">
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Proyecto</th>
            <th class="px-4 py-2 text-left">Categoría</th>
            <th class="px-4 py-2 text-left">Descripción</th>
            <th class="px-4 py-2 text-left">Monto</th>
            <th class="px-4 py-2 text-left">Fecha</th>
            <th class="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in filtered" :key="g.id_gasto" class="border-b hover:bg-gray-50">
            <td class="px-4 py-2">{{ g.id_gasto }}</td>
            <td class="px-4 py-2">{{ g.proyecto?.nombre_proyecto ?? g.id_proyecto ?? '—' }}</td>
            <td class="px-4 py-2">{{ g.categoria?.nombre_categoria ?? g.id_categoria_gasto ?? '—' }}</td>
            <td class="px-4 py-2">{{ g.descripcion_gasto }}</td>
            <td class="px-4 py-2">${{ Number(g.monto_gasto).toFixed(2) }}</td>
            <td class="px-4 py-2">{{ formatDate(g.fecha_gasto) }}</td>
            <td class="px-4 py-2 flex gap-2">
              <button @click="openEdit(g)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Editar</button>
              <button @click="deleteGasto(g.id_gasto)" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center text-gray-600 p-6">No hay gastos registrados.</div>
    </div>

    <Modal size="sm" v-if="showModal" :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Gasto' : 'Nuevo Gasto'">
      <div>
        <div v-if="error" class="mb-3 p-3 bg-red-100 text-red-700 rounded">Complete los campos requeridos.</div>

        <form @submit.prevent="saveGasto" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Proyecto</label>
              <select v-model="form.id_proyecto" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">-- Seleccionar proyecto --</option>
                <option v-for="p in proyectos" :key="p.id_proyecto" :value="p.id_proyecto">{{ p.nombre_proyecto }}</option>
              </select>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-500">Categoría</label>
              <select v-model="form.id_categoria_gasto" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">-- Seleccionar categoría --</option>
                <option v-for="c in categorias" :key="c.id_categoria_gasto" :value="c.id_categoria_gasto">{{ c.nombre_categoria }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Descripción</label>
            <input v-model="form.descripcion_gasto" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Monto</label>
              <input v-model.number="form.monto_gasto" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-500">Fecha</label>
              <input v-model="form.fecha_gasto" type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
              {{ isEditing ? 'Actualizar gasto' : 'Crear gasto' }}
            </button>
            <button type="button" @click="closeModal" class="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded">Cancelar</button>
          </div>
        </form>
      </div>
    </Modal>

    <Toast v-model="isLoading" message="Procesando..." type="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import api from '../../../services/api.js'

const gastos = ref([])
const proyectos = ref([])
const categorias = ref([])
const loadingGastos = ref(false)
const isLoading = ref(false)
const error = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const query = ref('')

const form = ref({
  id_proyecto: '',
  descripcion_gasto: '',
  id_categoria_gasto: '',
  monto_gasto: 0,
  fecha_gasto: new Date().toISOString().slice(0,10),
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return gastos.value
  return gastos.value.filter(g =>
    String(g.descripcion_gasto || '').toLowerCase().includes(q) ||
    String(g.proyecto?.nombre_proyecto || g.id_proyecto || '').toLowerCase().includes(q) ||
    String(g.categoria?.nombre_categoria || g.id_categoria_gasto || '').toLowerCase().includes(q)
  )
})

const getProyectos = async () => {
  try {
    const res = await api.get('/api/proyectos')
    proyectos.value = res.data
  } catch (e) {
    console.error('No se pudieron obtener proyectos', e)
    proyectos.value = []
  }
}

const getCategorias = async () => {
  try {
    const res = await api.get('/api/categorias_gastos')
    categorias.value = res.data
  } catch (e) {
    console.error('No se pudieron obtener categorías', e)
    categorias.value = []
  }
}

const getGastos = async () => {
  loadingGastos.value = true
  try {
    const res = await api.get('/api/gastos')
    gastos.value = res.data
  } catch (e) {
    console.error('Error al obtener gastos', e)
    gastos.value = []
  } finally {
    loadingGastos.value = false
  }
}

const openNew = () => {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

const openEdit = (g) => {
  isEditing.value = true
  editingId.value = g.id_gasto
  form.value.id_proyecto = g.id_proyecto ?? (g.proyecto?.id_proyecto ?? '')
  form.value.descripcion_gasto = g.descripcion_gasto ?? ''
  form.value.id_categoria_gasto = g.id_categoria_gasto ?? (g.categoria?.id_categoria_gasto ?? '')
  form.value.monto_gasto = Number(g.monto_gasto ?? 0)
  form.value.fecha_gasto = g.fecha_gasto ? g.fecha_gasto.split('T')[0] : new Date().toISOString().slice(0,10)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  error.value = false
}

const resetForm = () => {
  form.value = {
    id_proyecto: '',
    descripcion_gasto: '',
    id_categoria_gasto: '',
    monto_gasto: 0,
    fecha_gasto: new Date().toISOString().slice(0,10),
  }
}

const validar = () => {
  if (!form.value.id_proyecto || !form.value.id_categoria_gasto) return false
  if (!form.value.descripcion_gasto || form.value.descripcion_gasto.trim().length === 0) return false
  if (Number(form.value.monto_gasto) <= 0) return false
  if (!form.value.fecha_gasto) return false
  return true
}

const saveGasto = async () => {
  if (!validar()) {
    error.value = true
    return
  }
  error.value = false
  isLoading.value = true

  const payload = {
    id_proyecto: form.value.id_proyecto,
    descripcion_gasto: form.value.descripcion_gasto,
    id_categoria_gasto: form.value.id_categoria_gasto,
    monto_gasto: Number(form.value.monto_gasto),
    fecha_gasto: form.value.fecha_gasto
  }

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/api/gastos/${editingId.value}`, payload)
    } else {
      const res = await api.post('/api/gastos', payload)
      if (res && res.data) gastos.value.unshift(res.data)
    }
    await getGastos()
    closeModal()
  } catch (e) {
    console.error('Error guardando gasto', e)
  } finally {
    isLoading.value = false
  }
}

const deleteGasto = async (id) => {
  const ok = confirm('¿Está seguro/a de eliminar este gasto?')
  if (!ok) return
  isLoading.value = true
  try {
    await api.delete(`/api/gastos/${id}`)
    gastos.value = gastos.value.filter(g => g.id_gasto !== id)
  } catch (e) {
    console.error('Error eliminando gasto', e)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

onMounted(() => {
  getProyectos()
  getCategorias()
  getGastos()
  resetForm()
})
</script>