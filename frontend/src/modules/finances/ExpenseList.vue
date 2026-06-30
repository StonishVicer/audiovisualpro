<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <div class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Icon icon="mdi:cash-multiple" class="text-green-600" />
        Gestión de Gastos
      </h3>
    </div>

    <div class="px-6 py-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="relative w-full md:w-96">
          <Icon icon="mdi:magnify" class="absolute left-3 top-3 text-gray-400" />
          <input
            v-model="query"
            type="text"
            placeholder="Buscar gasto, contrato o categoría..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
          />
        </div>

        <div class="flex items-center gap-3">
            <CurrencySelector />
            <button @click="getGastos" class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Refrescar">
                <Icon icon="material-symbols:refresh" width="24" height="24" />
            </button>
            <button @click="openNew" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
                <Icon icon="mdi:plus" width="20" height="20" /> Registrar Gasto
            </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto px-6 pb-6">
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        <div v-if="loading" class="p-10 flex flex-col items-center justify-center text-gray-500">
           <Icon icon="svg-spinners:180-ring-with-bg" width="40" height="40" class="text-green-500 mb-2" />
           <span>Cargando gastos...</span>
        </div>

        <table v-else-if="filtered.length > 0" class="w-full text-sm text-left">
          <thead class="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
            <tr>
              <th class="px-6 py-3">Fecha</th>
              <th class="px-6 py-3">Contrato / Proyecto</th> 
              <th class="px-6 py-3">Categoría</th>
              <th class="px-6 py-3">Descripción</th>
              <th class="px-6 py-3 text-right">Monto</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
             <tr v-for="gasto in filtered" :key="gasto.id_gasto" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-gray-600">{{ formatDate(gasto.fecha_gasto) }}</td>
                <td class="px-6 py-4 font-medium text-gray-800">
                    <div>{{ gasto.nombre_cliente || '...' }}</div>
                    <div class="text-xs text-gray-500">{{ gasto.nombre_proyecto }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-100">
                    {{ gasto.nombre_categoria }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600 truncate max-w-xs" :title="gasto.descripcion_gasto">
                    {{ gasto.descripcion_gasto }}
                </td>
                <td class="px-6 py-4 text-right font-bold text-gray-700">
                    {{ getMontoDisplay(gasto) }}
                </td>
                <td class="px-6 py-4 flex justify-center gap-2">
                   <button @click="openEdit(gasto)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Editar">
                     <Icon icon="material-symbols:edit" width="20" />
                   </button>
                   <button @click="deleteGasto(gasto.id_gasto)" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Eliminar">
                     <Icon icon="material-symbols:delete" width="20" />
                   </button>
                </td>
             </tr>
          </tbody>
        </table>
        
        <div v-else class="p-12 flex flex-col items-center text-gray-400">
           <Icon icon="mdi:cash-remove" width="60" height="60" class="mb-2 opacity-50" />
           <p>No se encontraron gastos registrados.</p>
        </div>
      </div>
    </div>

    <Modal :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Gasto' : 'Nuevo Gasto'">
      <div class="px-1">
        <form @submit.prevent="saveGasto" class="space-y-4">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contrato Asociado</label>
                <select v-model="form.id_contrato" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
                   <option value="" disabled>-- Seleccionar Contrato --</option>
                   <option v-for="c in contratos" :key="c.id_contrato" :value="c.id_contrato">
                      {{ c.nombre_cliente }} — {{ c.nombre_proyecto || 'Contrato #' + c.id_contrato }}
                   </option>
                </select>
             </div>
             
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha del Gasto</label>
                <input v-model="form.fecha_gasto" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
             </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select v-model="form.id_categoria_gasto" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
                   <option value="" disabled>-- Seleccionar --</option>
                   <option v-for="c in categorias" :key="c.id_categoria_gasto" :value="c.id_categoria_gasto">
                      {{ c.nombre_categoria }}
                   </option>
                </select>
             </div>

             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                <input v-model.number="form.monto_gasto" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-right font-medium" placeholder="0.00" />
             </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción / Detalle</label>
            <textarea v-model="form.descripcion_gasto" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ej: Pago de personal extra por horas nocturnas..."></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">Cancelar</button>
            <button type="submit" class="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-md transition">
                {{ isEditing ? 'Guardar Cambios' : 'Registrar Gasto' }}
            </button>
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
import Modal from '../../components/Modal.vue'
import Toast from '../../components/Toast.vue'
import CurrencySelector from '../../components/CurrencySelector.vue'
import api from '../../services/api.js'
import { useCurrency } from '../../composables/useCurrency.js'

const { getMontoDisplay, getMontoNumber } = useCurrency()

// States
const gastos = ref([])
const contratos = ref([]) // CAMBIO: Proyectos -> Contratos
const categorias = ref([]) 
const loading = ref(false)
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const query = ref('')

const form = ref({
  id_contrato: '', // CAMBIO: id_proyecto -> id_contrato
  id_categoria_gasto: '',
  descripcion_gasto: '',
  monto_gasto: '',
  fecha_gasto: new Date().toISOString().slice(0,10)
})

// Computed
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return gastos.value
  return gastos.value.filter(g => 
    (g.descripcion_gasto || '').toLowerCase().includes(q) ||
    (g.nombre_contrato || '').toLowerCase().includes(q) || // CAMBIO: Filtro por nombre_contrato
    (g.nombre_categoria || '').toLowerCase().includes(q)
  )
})

// API Calls
const fetchData = async () => {
    loading.value = true
    try {
        // CAMBIO: Carga contratos en lugar de proyectos
        const [resGastos, resContratos, resCat] = await Promise.all([
            api.get('/api/gastos'),
            api.get('/api/contratos'), 
            api.get('/api/gastos/categorias') 
        ])
        gastos.value = resGastos.data
        contratos.value = resContratos.data
        categorias.value = resCat.data
    } catch (e) {
        console.error("Error cargando datos", e)
    } finally {
        loading.value = false
    }
}

const getGastos = async () => {
    try {
        const res = await api.get('/api/gastos')
        gastos.value = res.data
    } catch (e) { console.error(e) }
}

// Actions
const openNew = () => {
    resetForm()
    isEditing.value = false
    showModal.value = true
}

const openEdit = (item) => {
    isEditing.value = true
    editingId.value = item.id_gasto
    form.value = {
        id_contrato: item.id_contrato, // CAMBIO: Mapeo id_contrato
        id_categoria_gasto: item.id_categoria_gasto,
        descripcion_gasto: item.descripcion_gasto,
        monto_gasto: item.monto_gasto,
        fecha_gasto: item.fecha_gasto ? item.fecha_gasto.split('T')[0] : ''
    }
    showModal.value = true
}

const closeModal = () => showModal.value = false

const resetForm = () => {
    form.value = {
        id_contrato: '', // CAMBIO: Reset id_contrato
        id_categoria_gasto: '',
        descripcion_gasto: '',
        monto_gasto: '',
        fecha_gasto: new Date().toISOString().slice(0,10)
    }
}

const saveGasto = async () => {
    // CAMBIO: Validación para id_contrato
    if (!form.value.id_contrato || !form.value.monto_gasto || !form.value.id_categoria_gasto) {
        return alert("Contrato, Categoría y Monto son obligatorios")
    }
    
    isLoading.value = true
    try {
        if (isEditing.value) {
            await api.put(`/api/gastos/${editingId.value}`, form.value)
        } else {
            await api.post('/api/gastos', form.value)
        }
        await getGastos()
        closeModal()
    } catch (e) {
        console.error(e)
        alert("Error al guardar el gasto")
    } finally {
        isLoading.value = false
    }
}

const deleteGasto = async (id) => {
    if (!confirm("¿Eliminar este gasto?")) return
    try {
        await api.delete(`/api/gastos/${id}`)
        gastos.value = gastos.value.filter(g => g.id_gasto !== id)
    } catch (e) { console.error(e) }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

onMounted(() => {
    fetchData()
})
</script>