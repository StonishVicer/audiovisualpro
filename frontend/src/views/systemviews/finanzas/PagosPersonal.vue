<template>
  <div class="h-screen flex flex-col bg-white">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-3 mb-4 p-4">
      <h3 class="text-center font-bold text-lg text-gray-800">Pagos al Personal</h3>
    </div>

    <!-- Controles Superiores -->
    <div class="mb-3 flex flex-col sm:flex-row justify-between items-center gap-3 px-4">
      <div class="w-full sm:w-auto">
        <input
          v-model="query"
          type="text"
          placeholder="Buscar pago, personal o motivo..."
          class="transition w-full sm:w-[420px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button @click="openNew" class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition">
          <Icon icon="mdi:plus" width="20" height="20" class="mr-2" /> Nuevo Pago
        </button>
        <button @click="getPagos" class="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg transition" title="Recargar">
          <Icon icon="material-symbols:refresh" width="20" height="20" />
        </button>
      </div>
    </div>

    <!-- Tabla de Datos -->
    <div class="flex-1 overflow-y-auto border-t border-gray-200 bg-gray-50 p-4">
      <div v-if="loadingPagos" class="p-8 text-center text-gray-600 flex flex-col items-center">
        <Icon icon="eos-icons:loading" class="animate-spin mb-2" width="30" />
        Cargando pagos...
      </div>

      <div v-else-if="filtered.length" class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table class="table-auto w-full text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th class="px-4 py-3 text-left">ID</th>
              <th class="px-4 py-3 text-left">Personal</th>
              <th class="px-4 py-3 text-left">Asignación</th>
              <th class="px-4 py-3 text-left">Monto</th>
              <th class="px-4 py-3 text-left">Fecha</th>
              <th class="px-4 py-3 text-left">Motivo</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="p in filtered" :key="p.id_pago" class="hover:bg-green-50 transition">
              <td class="px-4 py-3 font-medium text-gray-900">{{ p.id_pago }}</td>
              <td class="px-4 py-3">{{ p.personal?.nombre_personal ?? p.id_personal ?? '—' }}</td>
              <td class="px-4 py-3">
                <!-- Lógica para mostrar nombre basado en ID manual si no viene populado -->
                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {{ getNombreAsignacion(p.id_asignacion) }}
                </span>
              </td>
              <td class="px-4 py-3 font-semibold text-green-700">${{ Number(p.monto_pagado).toFixed(2) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(p.fecha_pago) }}</td>
              <td class="px-4 py-3 text-gray-600 italic">{{ p.motivo_pago || '—' }}</td>
              <td class="px-4 py-3 flex justify-center gap-2">
                <button @click="openEdit(p)" class="text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 p-1.5 rounded transition" title="Editar">
                  <Icon icon="mdi:pencil" width="18" />
                </button>
                <button @click="deletePago(p.id_pago)" class="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 p-1.5 rounded transition" title="Eliminar">
                  <Icon icon="mdi:trash-can" width="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-500 p-10 bg-white rounded-lg border border-dashed border-gray-300">
        <Icon icon="mdi:file-document-outline" width="48" class="mx-auto text-gray-400 mb-2" />
        No se encontraron pagos registrados con ese criterio.
      </div>
    </div>

    <!-- Modal Formulario -->
    <Modal size="md" :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Pago' : 'Nuevo Pago'">
      <div class="p-1">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center">
          <Icon icon="mdi:alert-circle" class="mr-2" /> {{ errorMessage || 'Por favor complete todos los campos requeridos.' }}
        </div>

        <form @submit.prevent="savePago" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Personal <span class="text-red-500">*</span></label>
              <select v-model="form.id_personal" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="" disabled>-- Seleccionar --</option>
                <option v-for="per in personal" :key="per.id_personal" :value="per.id_personal">
                  {{ per.nombre_personal }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Asignación <span class="text-red-500">*</span></label>
              <select v-model="form.id_asignacion" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="" disabled>-- Seleccionar --</option>
                <option v-for="a in asignaciones" :key="a.id_asignacion" :value="a.id_asignacion">
                  {{ a.nombre_asignacion }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Monto ($) <span class="text-red-500">*</span></label>
              <input v-model.number="form.monto_pagado" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago <span class="text-red-500">*</span></label>
              <input v-model="form.fecha_pago" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>
          
          <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Motivo / Descripción</label>
             <textarea v-model="form.motivo_pago" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" @click="closeModal" class="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition flex justify-center items-center" :disabled="isLoading">
               <Icon v-if="isLoading" icon="eos-icons:loading" class="animate-spin mr-2" />
               {{ isEditing ? 'Actualizar' : 'Guardar Pago' }}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Usamos el Toast solo si existe en tu proyecto, sino se puede remover -->
    <Toast v-if="isLoading" message="Procesando solicitud..." type="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
// Asegúrate que estas rutas sean correctas en tu proyecto
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import api from '../../../services/api.js'

// Estado
const pagos = ref([])
const personal = ref([])


const asignaciones = ref([
    { id_asignacion: 1, nombre_asignacion: 'Sueldo' },
    { id_asignacion: 2, nombre_asignacion: 'Pagos extra' }
])

const loadingPagos = ref(false)
const isLoading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const query = ref('')

const form = ref({
  id_personal: '',
  id_asignacion: '',
  monto_pagado: 0,
  fecha_pago: new Date().toISOString().slice(0,10),
  motivo_pago: ''
})

// Helper para mostrar nombres correctos en la tabla
const getNombreAsignacion = (id) => {
    // Busca en el array fijo primero
    const found = asignaciones.value.find(a => a.id_asignacion == id)
    if (found) return found.nombre_asignacion
    
    // Si no encuentra (caso legacy), devuelve el ID
    return id
}

// Computed Filter
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return pagos.value
  return pagos.value.filter(p => {
    // Obtenemos el nombre de la asignación usando la función helper
    const nombreAsignacion = getNombreAsignacion(p.id_asignacion)
    
    return String(p.motivo_pago || '').toLowerCase().includes(q) ||
           String(p.personal?.nombre_personal || p.id_personal || '').toLowerCase().includes(q) ||
           String(nombreAsignacion || '').toLowerCase().includes(q)
  })
})

// API Calls
const getPersonal = async () => {
  try {
    const res = await api.get('/api/personal')
    personal.value = res.data
  } catch (e) {
    console.error('Error cargando personal:', e)
  }
}

// NOTA: Se eliminó getAsignaciones() ya que ahora son fijas

const getPagos = async () => {
  loadingPagos.value = true
  try {
    const res = await api.get('/api/pagos_personal')
    pagos.value = res.data || [] 
  } catch (e) {
    console.error('Error cargando pagos:', e)
    pagos.value = []
  } finally {
    loadingPagos.value = false
  }
}

// Actions
const openNew = () => {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

const openEdit = (p) => {
  resetForm()
  isEditing.value = true
  editingId.value = p.id_pago
  
  form.value.id_personal = p.id_personal ?? (p.personal?.id_personal ?? '')
  form.value.id_asignacion = p.id_asignacion ?? (p.asignacion?.id_asignacion ?? '')
  form.value.monto_pagado = Number(p.monto_pagado ?? 0)
  
  if (p.fecha_pago) {
      form.value.fecha_pago = p.fecha_pago.toString().split('T')[0]
  }
  
  form.value.motivo_pago = p.motivo_pago ?? ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  error.value = false
  setTimeout(() => resetForm(), 300)
}

const resetForm = () => {
  form.value = {
    id_personal: '',
    id_asignacion: '',
    monto_pagado: 0,
    fecha_pago: new Date().toISOString().slice(0,10),
    motivo_pago: ''
  }
  error.value = false
  errorMessage.value = ''
}

const validar = () => {
  errorMessage.value = 'Por favor complete todos los campos requeridos.'
  if (!form.value.id_personal || !form.value.id_asignacion) return false
  if (Number(form.value.monto_pagado) <= 0) {
      errorMessage.value = 'El monto debe ser mayor a 0.'
      return false
  }
  if (!form.value.fecha_pago) return false
  return true
}

const savePago = async () => {
  if (!validar()) {
    error.value = true
    return
  }
  error.value = false
  isLoading.value = true

  const payload = {
    id_personal: Number(form.value.id_personal),
    id_asignacion: Number(form.value.id_asignacion),
    monto_pagado: Number(form.value.monto_pagado),
    fecha_pago: form.value.fecha_pago,
    motivo_pago: form.value.motivo_pago
  }
  
  // Debug: Imprimir lo que se envía para verificar
  console.log('Enviando payload:', payload);

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/api/pagos_personal/${editingId.value}`, payload)
    } else {
      const res = await api.post('/api/pagos_personal', payload)
    }
    
    // Siempre recargar para ver cambios reflejados con las asignaciones fijas
    await getPagos()
    
    closeModal()
  } catch (e) {
    console.error('Error detallado guardando pago:', e)
    
    // Mejor manejo de error para mostrar lo que dice el backend
    let msg = 'Error desconocido'
    if (e.response && e.response.data) {
        msg = e.response.data.message || JSON.stringify(e.response.data)
    } else if (e.message) {
        msg = e.message
    }
    
    errorMessage.value = `Error del servidor: ${msg}`
    error.value = true
    // No cerramos el modal para que veas el error
  } finally {
    isLoading.value = false
  }
}

const deletePago = async (id) => {
  if (!confirm('¿Está seguro de eliminar este registro de pago?')) return
  
  isLoading.value = true 
  try {
    await api.delete(`/api/pagos_personal/${id}`)
    pagos.value = pagos.value.filter(p => p.id_pago !== id)
  } catch (e) {
    console.error('Error eliminando pago:', e)
    const serverMessage = e.response?.data?.message || e.message || 'Error desconocido'
    alert(`No se pudo eliminar el pago: ${serverMessage}`)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const datePart = dateString.toString().split('T')[0]
  const [year, month, day] = datePart.split('-')
  return `${day}/${month}/${year}`
}

onMounted(() => {
  getPersonal()
  // getAsignaciones() <- Eliminado
  getPagos()
})
</script>