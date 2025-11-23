<template> Pagos personal
  <div class="h-screen flex flex-col">
    <div class="border-b border-gray-200 pb-3 mb-4">
      <h3 class="text-center font-bold text-lg">Pagos al Personal</h3>
    </div>

    <div class="mb-3 flex justify-between items-center">
      <div class="flex space-x-2">
        <input
          v-model="query"
          type="text"
          placeholder="Buscar pago, personal o motivo"
          class="transition w-[420px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div class="flex items-center gap-2">
        <button @click="openNew" class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="mdi:plus" width="20" height="20" class="mr-2" /> Nuevo Pago
        </button>
        <button @click="getPagos" class="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="material-symbols:refresh" width="20" height="20" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[300px] max-h-[calc(100vh-240px)] p-2">
      <div v-if="loadingPagos" class="p-4 text-center text-gray-600">Cargando pagos...</div>

      <table v-else-if="filtered.length" class="table-auto w-full">
        <thead>
          <tr class="bg-gray-100 text-gray-800">
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Personal</th>
            <th class="px-4 py-2 text-left">Asignación</th>
            <th class="px-4 py-2 text-left">Monto</th>
            <th class="px-4 py-2 text-left">Fecha</th>
            <th class="px-4 py-2 text-left">Motivo</th>
            <th class="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id_pago" class="border-b hover:bg-gray-50">
            <td class="px-4 py-2">{{ p.id_pago }}</td>
            <td class="px-4 py-2">{{ p.personal?.nombre_personal ?? p.id_personal ?? '—' }}</td>
            <td class="px-4 py-2">{{ p.asignacion?.nombre_asignacion ?? p.id_asignacion ?? '—' }}</td>
            <td class="px-4 py-2">${{ Number(p.monto_pagado).toFixed(2) }}</td>
            <td class="px-4 py-2">{{ formatDate(p.fecha_pago) }}</td>
            <td class="px-4 py-2">{{ p.motivo_pago }}</td>
            <td class="px-4 py-2 flex gap-2">
              <button @click="openEdit(p)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Editar</button>
              <button @click="deletePago(p.id_pago)" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center text-gray-600 p-6">No hay pagos registrados.</div>
    </div>

    <Modal size="sm" v-if="showModal" :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Pago' : 'Nuevo Pago'">
      <div>
        <div v-if="error" class="mb-3 p-3 bg-red-100 text-red-700 rounded">Complete los campos requeridos.</div>

        <form @submit.prevent="savePago" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Personal</label>
              <select v-model="form.id_personal" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">-- Seleccionar personal --</option>
                <option v-for="per in personal" :key="per.id_personal" :value="per.id_personal">
                  {{ per.nombre_personal }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-500">Asignación</label>
              <select v-model="form.id_asignacion" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">-- Seleccionar asignación --</option>
                <option v-for="a in asignaciones" :key="a.id_asignacion" :value="a.id_asignacion">
                  {{ a.nombre_asignacion }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Monto pagado</label>
            <input v-model.number="form.monto_pagado" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Fecha de pago</label>
              <input v-model="form.fecha_pago" type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-500">Motivo</label>
              <input v-model="form.motivo_pago" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
              {{ isEditing ? 'Actualizar pago' : 'Crear pago' }}
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

const pagos = ref([])
const personal = ref([])
const asignaciones = ref([])
const loadingPagos = ref(false)
const isLoading = ref(false)
const error = ref(false)
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

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return pagos.value
  return pagos.value.filter(p =>
    String(p.motivo_pago || '').toLowerCase().includes(q) ||
    String(p.personal?.nombre_personal || p.id_personal || '').toLowerCase().includes(q) ||
    String(p.asignacion?.nombre_asignacion || p.id_asignacion || '').toLowerCase().includes(q)
  )
})

const getPersonal = async () => {
  try {
    const res = await api.get('/api/personal')
    personal.value = res.data
  } catch (e) {
    console.error('No se pudo obtener personal', e)
    personal.value = []
  }
}

const getAsignaciones = async () => {
  try {
    const res = await api.get('/api/asignaciones')
    asignaciones.value = res.data
  } catch (e) {
    console.error('No se pudieron obtener asignaciones', e)
    asignaciones.value = []
  }
}

const getPagos = async () => {
  loadingPagos.value = true
  try {
    const res = await api.get('/api/pagos_personal')
    pagos.value = res.data
  } catch (e) {
    console.error('Error al obtener pagos', e)
    pagos.value = []
  } finally {
    loadingPagos.value = false
  }
}

const openNew = () => {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

const openEdit = (p) => {
  isEditing.value = true
  editingId.value = p.id_pago
  form.value.id_personal = p.id_personal ?? (p.personal?.id_personal ?? '')
  form.value.id_asignacion = p.id_asignacion ?? (p.asignacion?.id_asignacion ?? '')
  form.value.monto_pagado = Number(p.monto_pagado ?? 0)
  form.value.fecha_pago = p.fecha_pago ? p.fecha_pago.split('T')[0] : new Date().toISOString().slice(0,10)
  form.value.motivo_pago = p.motivo_pago ?? ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  error.value = false
}

const resetForm = () => {
  form.value = {
    id_personal: '',
    id_asignacion: '',
    monto_pagado: 0,
    fecha_pago: new Date().toISOString().slice(0,10),
    motivo_pago: ''
  }
}

const validar = () => {
  if (!form.value.id_personal || !form.value.id_asignacion) return false
  if (Number(form.value.monto_pagado) <= 0) return false
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
    id_personal: form.value.id_personal,
    id_asignacion: form.value.id_asignacion,
    monto_pagado: Number(form.value.monto_pagado),
    fecha_pago: form.value.fecha_pago,
    motivo_pago: form.value.motivo_pago
  }

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/api/pagos_personal/${editingId.value}`, payload)
    } else {
      const res = await api.post('/api/pagos_personal', payload)
      if (res && res.data) pagos.value.unshift(res.data)
    }
    await getPagos()
    closeModal()
  } catch (e) {
    console.error('Error guardando pago', e)
  } finally {
    isLoading.value = false
  }
}

const deletePago = async (id) => {
  const ok = confirm('¿Está seguro/a de eliminar este pago?')
  if (!ok) return
  isLoading.value = true
  try {
    await api.delete(`/api/pagos_personal/${id}`)
    pagos.value = pagos.value.filter(p => p.id_pago !== id)
  } catch (e) {
    console.error('Error eliminando pago', e)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

onMounted(() => {
  getPersonal()
  getAsignaciones()
  getPagos()
  resetForm()
})
</script>