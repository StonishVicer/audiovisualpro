<template>
  <div class="h-screen flex flex-col">
    <div class="border-b border-gray-200 pb-3 mb-4">
      <h3 class="text-center font-bold text-lg">Reportes financieros</h3>
    </div>

    <div class="mb-4 flex items-center justify-between gap-4">
      <input
        v-model="query"
        type="text"
        placeholder="Buscar gastos o pagos (descripción, proyecto, personal, motivo, fecha...)"
        class="transition w-full md:w-[640px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div class="flex gap-2">
        <button @click="refresh" class="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="material-symbols:refresh" width="20" height="20" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-auto">
      <!-- Gastos -->
      <section class="border border-gray-200 rounded-lg p-3 bg-white">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold">Gastos ({{ gastos.length }})</h4>
          <div class="text-sm text-gray-600">Total: <strong>${{ totalGastos.toFixed(2) }}</strong></div>
        </div>

        <div v-if="loadingGastos" class="text-center text-gray-600 py-6">Cargando gastos...</div>

        <table v-else-if="filteredGastos.length" class="table-auto w-full">
          <thead>
            <tr class="bg-gray-100 text-gray-800">
              <th class="px-3 py-2 text-left">ID</th>
              <th class="px-3 py-2 text-left">Proyecto</th>
              <th class="px-3 py-2 text-left">Descripción</th>
              <th class="px-3 py-2 text-right">Monto</th>
              <th class="px-3 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in filteredGastos" :key="g.id_gasto" class="border-b hover:bg-gray-50">
              <td class="px-3 py-2 text-sm">{{ g.id_gasto }}</td>
              <td class="px-3 py-2 text-sm">{{ g.proyecto?.nombre_proyecto ?? g.id_proyecto ?? '—' }}</td>
              <td class="px-3 py-2 text-sm">{{ g.descripcion_gasto }}</td>
              <td class="px-3 py-2 text-right font-semibold">${{ Number(g.monto_gasto).toFixed(2) }}</td>
              <td class="px-3 py-2 text-sm">{{ formatDate(g.fecha_gasto) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-center text-gray-600 py-6">No se encontraron gastos.</div>
      </section>

      <!-- Pagos -->
      <section class="border border-gray-200 rounded-lg p-3 bg-white">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold">Pagos ({{ pagos.length }})</h4>
          <div class="text-sm text-gray-600">Total: <strong>${{ totalPagos.toFixed(2) }}</strong></div>
        </div>

        <div v-if="loadingPagos" class="text-center text-gray-600 py-6">Cargando pagos...</div>

        <table v-else-if="filteredPagos.length" class="table-auto w-full">
          <thead>
            <tr class="bg-gray-100 text-gray-800">
              <th class="px-3 py-2 text-left">ID</th>
              <th class="px-3 py-2 text-left">Personal</th>
              <th class="px-3 py-2 text-left">Asignación</th>
              <th class="px-3 py-2 text-right">Monto</th>
              <th class="px-3 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredPagos" :key="p.id_pago" class="border-b hover:bg-gray-50">
              <td class="px-3 py-2 text-sm">{{ p.id_pago }}</td>
              <td class="px-3 py-2 text-sm">{{ p.personal?.nombre_personal ?? p.id_personal ?? '—' }}</td>
              <td class="px-3 py-2 text-sm">{{ p.asignacion?.nombre_asignacion ?? p.id_asignacion ?? '—' }}</td>
              <td class="px-3 py-2 text-right font-semibold">${{ Number(p.monto_pagado).toFixed(2) }}</td>
              <td class="px-3 py-2 text-sm">{{ formatDate(p.fecha_pago) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-center text-gray-600 py-6">No se encontraron pagos.</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../../services/api.js'

const query = ref('')
const gastos = ref([])
const pagos = ref([])
const loadingGastos = ref(false)
const loadingPagos = ref(false)

const getGastos = async () => {
  loadingGastos.value = true
  try {
    const res = await api.get('/api/gastos')
    gastos.value = res.data || []
  } catch (e) {
    console.error('Error al obtener gastos', e)
    gastos.value = []
  } finally {
    loadingGastos.value = false
  }
}

const getPagos = async () => {
  loadingPagos.value = true
  try {
    const res = await api.get('/api/pagos_personal')
    pagos.value = res.data || []
  } catch (e) {
    console.error('Error al obtener pagos', e)
    pagos.value = []
  } finally {
    loadingPagos.value = false
  }
}

const qLower = computed(() => query.value.trim().toLowerCase())

const filteredGastos = computed(() => {
  const q = qLower.value
  if (!q) return gastos.value
  return gastos.value.filter(g =>
    String(g.descripcion_gasto || '').toLowerCase().includes(q) ||
    String(g.proyecto?.nombre_proyecto || g.id_proyecto || '').toLowerCase().includes(q) ||
    String(g.id_gasto || '').toLowerCase().includes(q) ||
    (g.fecha_gasto && new Date(g.fecha_gasto).toLocaleDateString().toLowerCase().includes(q))
  )
})

const filteredPagos = computed(() => {
  const q = qLower.value
  if (!q) return pagos.value
  return pagos.value.filter(p =>
    String(p.motivo_pago || '').toLowerCase().includes(q) ||
    String(p.personal?.nombre_personal || p.id_personal || '').toLowerCase().includes(q) ||
    String(p.asignacion?.nombre_asignacion || p.id_asignacion || '').toLowerCase().includes(q) ||
    String(p.id_pago || '').toLowerCase().includes(q) ||
    (p.fecha_pago && new Date(p.fecha_pago).toLocaleDateString().toLowerCase().includes(q))
  )
})

const totalGastos = computed(() => gastos.value.reduce((s, g) => s + Number(g.monto_gasto || 0), 0))
const totalPagos = computed(() => pagos.value.reduce((s, p) => s + Number(p.monto_pagado || 0), 0))

const refresh = () => {
  getGastos()
  getPagos()
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

onMounted(() => {
  refresh()
})
</script>