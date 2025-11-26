<template>
  <div class="h-screen flex flex-col">
    <div class="border-b border-gray-200 pb-3 mb-4">
      <h3 class="text-center font-bold text-lg">Gestión de Facturas</h3>
    </div>

    <div class="mb-3 flex justify-between items-center">
      <div class="flex space-x-2">
        <input
          v-model="query"
          type="text"
          placeholder="Buscar factura, cliente o número"
          class="transition w-[420px] border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div class="flex items-center gap-2">
        <button @click="openNew" class="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="mdi:plus" width="20" height="20" class="mr-2" /> Nueva Factura
        </button>
        <button @click="getFacturas" class="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold p-2 rounded-lg">
          <Icon icon="material-symbols:refresh" width="20" height="20" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
      <div v-if="loadingFacturas" class="p-4">
        <div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 rounded-xl">
          <Icon icon="mdi:loading" width="20" height="20" class="mr-2" /> Cargando facturas...
        </div>
      </div>

      <table v-else-if="filtered.length > 0" class="table-auto w-full">
        <thead>
          <tr class="bg-green-100 text-green-900">
            <th class="px-4 py-2 text-left">N°</th>
            <th class="px-4 py-2 text-left">Fecha</th>
            <th class="px-4 py-2 text-left">Cliente</th>
            <th class="px-4 py-2 text-left">Total</th>
            <th class="px-4 py-2 text-left">Estado</th>
            <th class="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fact in filtered" :key="fact.id_factura" class="border-b hover:bg-green-50">
            <td class="px-4 py-2">{{ fact.numero_factura }}</td>
            <td class="px-4 py-2">{{ formatDate(fact.fecha_factura) }}</td>
            <td class="px-4 py-2">{{ fact.cliente?.nombre_cliente ?? fact.nombre_cliente ?? '—' }}</td>
            <td class="px-4 py-2">${{ Number(fact.total).toFixed(2) }}</td>
            <td class="px-4 py-2">{{ fact.estado }}</td>
            <td class="px-4 py-2 flex items-center gap-2">
              <button @click="toggleDetail(fact)" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center">
                <Icon icon="mdi:eye" width="18" height="18" class="mr-2" /> Ver
              </button>
              <button @click="openEdit(fact)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg flex items-center">
                <Icon icon="material-symbols:edit" width="18" height="18" class="mr-2" /> Editar
              </button>
              <button @click="deleteFactura(fact.id_factura)" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg flex items-center">
                <Icon icon="material-symbols:delete" width="18" height="18" class="mr-2" /> Eliminar
              </button>
            </td>
          </tr>

          <tr v-if="fact._showDetail" class="bg-white">
            <td colspan="6" class="px-4 py-3">
              <div class="p-3 border rounded-lg">
                <div class="flex justify-between">
                  <div>
                    <div class="font-semibold">Factura: {{ fact.numero_factura }}</div>
                    <div class="small text-gray-600">Cliente: {{ fact.cliente?.nombre_cliente ?? fact.nombre_cliente }}</div>
                    <div class="small text-gray-600">Fecha: {{ formatDate(fact.fecha_factura) }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold">${{ Number(fact.total).toFixed(2) }}</div>
                    <div class="small">Subtotal: ${{ Number(fact.subtotal || 0).toFixed(2) }}</div>
                    <div class="small">Impuesto: ${{ Number(fact.impuesto || 0).toFixed(2) }}</div>
                  </div>
                </div>

                <hr class="my-2" />

                <div>
                  <h4 class="font-semibold mb-2">Items</h4>
                  <div v-for="it in fact.items || []" :key="it.id_item" class="flex justify-between items-center py-1 border-b">
                    <div>
                      <div class="font-medium">{{ it.descripcion }}</div>
                      <div class="small text-gray-600">Cant: {{ it.cantidad }} × ${{ Number(it.precio_unitario).toFixed(2) }}</div>
                    </div>
                    <div class="font-semibold">${{ (Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2) }}</div>
                  </div>
                </div>

                <div v-if="fact.notas" class="mt-2 small text-gray-700">Notas: {{ fact.notas }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="p-4">
        <div class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 rounded-xl">
          <Icon icon="mdi:error" width="20" height="20" class="mr-2" /> No hay facturas.
        </div>
      </div>
    </div>

    <Modal v-if="showModal" :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Factura' : 'Nueva Factura'">
      <div>
        <div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 rounded-xl mb-3">
          <Icon icon="mdi:error" width="25" height="25" class="mr-2" /> Complete los campos requeridos.
        </div>

        <form @submit.prevent="saveFactura" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Número</label>
              <input v-model="form.numero_factura" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-500">Fecha</label>
              <input v-model="form.fecha_factura" type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Cliente</label>
            <select v-model="form.cliente_id" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">-- Seleccionar cliente --</option>
              <option v-for="c in clientes" :key="c.id_cliente" :value="c.id_cliente">
                {{ c.nombre_cliente }} — {{ c.rif_cliente }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Items</label>
            <div class="space-y-2">
              <div v-for="(it, idx) in form.items" :key="it.tmpId" class="p-2 border rounded flex gap-2 items-start">
                <div class="flex-1">
                  <input v-model="it.descripcion" placeholder="Descripción" class="w-full border border-gray-300 rounded-md px-2 py-1 mb-1 focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <div class="flex gap-2">
                    <input v-model.number="it.cantidad" type="number" min="1" placeholder="Cantidad" class="w-1/3 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <input v-model.number="it.precio_unitario" type="number" min="0" step="0.01" placeholder="Precio unitario" class="w-1/3 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <div class="flex-1 text-right self-center font-semibold">${{ (Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2) }}</div>
                  </div>
                </div>
                <div>
                  <button type="button" @click="removeItem(idx)" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
                </div>
              </div>

              <div>
                <button type="button" @click="addItem" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                  <Icon icon="mdi:plus" width="18" height="18" class="mr-2" /> Agregar item
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-sm font-semibold text-gray-500">Subtotal</label>
              <input :value="subtotal.toFixed(2)" readonly class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-500">Impuesto (%)</label>
              <input v-model.number="form.impuesto_porcentaje" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-500">Total</label>
              <input :value="total.toFixed(2)" readonly class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" />
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Estado</label>
            <select v-model="form.estado" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option>PENDIENTE</option>
              <option>PAGADA</option>
              <option>CANCELADA</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-500">Notas</label>
            <textarea v-model="form.notas" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" rows="3"></textarea>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
              {{ isEditing ? 'Actualizar factura' : 'Crear factura' }}
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

const facturas = ref([])
const clientes = ref([])
const loadingFacturas = ref(false)
const isLoading = ref(false)
const error = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const query = ref('')

const emptyItem = () => ({ tmpId: Date.now() + Math.random(), descripcion: '', cantidad: 1, precio_unitario: 0 })

const form = ref({
  numero_factura: '',
  fecha_factura: '',
  cliente_id: '',
  items: [emptyItem()],
  impuesto_porcentaje: 16,
  estado: 'PENDIENTE',
  notas: '',
})

const subtotal = computed(() => {
  return form.value.items.reduce((acc, it) => acc + (Number(it.cantidad || 0) * Number(it.precio_unitario || 0)), 0)
})

const total = computed(() => {
  const imp = Number(form.value.impuesto_porcentaje || 0)
  return subtotal.value + (subtotal.value * imp / 100)
})

const getClientes = async () => {
  try {
    const res = await api.get('/api/clientes')
    clientes.value = res.data
  } catch (e) {
    console.error('No se pudieron obtener clientes', e)
  }
}

const getFacturas = async () => {
  loadingFacturas.value = true
  try {
    const res = await api.get('/api/facturas')
    // marca interna para mostrar detalle en tabla
    facturas.value = res.data.map(f => ({ ...f, _showDetail: false }))
  } catch (e) {
    console.error('Error al obtener facturas', e)
    facturas.value = []
  } finally {
    loadingFacturas.value = false
  }
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return facturas.value
  return facturas.value.filter(f =>
    String(f.numero_factura).toLowerCase().includes(q) ||
    (f.cliente && f.cliente.nombre_cliente && f.cliente.nombre_cliente.toLowerCase().includes(q)) ||
    (f.nombre_cliente && f.nombre_cliente.toLowerCase().includes(q))
  )
})

const openNew = () => {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

const openEdit = (fact) => {
  isEditing.value = true
  editingId.value = fact.id_factura
  form.value.numero_factura = fact.numero_factura || ''
  form.value.fecha_factura = fact.fecha_factura ? fact.fecha_factura.split('T')[0] : ''
  form.value.cliente_id = fact.cliente?.id_cliente ?? fact.cliente_id ?? ''
  form.value.items = (fact.items && fact.items.length) ? fact.items.map(it => ({ tmpId: Date.now()+Math.random(), id_item: it.id_item, descripcion: it.descripcion, cantidad: it.cantidad, precio_unitario: it.precio_unitario })) : [emptyItem()]
  form.value.impuesto_porcentaje = Number(fact.impuesto_porcentaje ?? fact.impuesto ?? 16)
  form.value.estado = fact.estado || 'PENDIENTE'
  form.value.notas = fact.notas || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  error.value = false
}

const resetForm = () => {
  form.value = {
    numero_factura: '',
    fecha_factura: new Date().toISOString().slice(0,10),
    cliente_id: '',
    items: [emptyItem()],
    impuesto_porcentaje: 16,
    estado: 'PENDIENTE',
    notas: ''
  }
}

const addItem = () => form.value.items.push(emptyItem())
const removeItem = (idx) => {
  if (form.value.items.length === 1) {
    form.value.items = [emptyItem()]
    return
  }
  form.value.items.splice(idx, 1)
}

const validar = () => {
  if (!form.value.numero_factura || !form.value.fecha_factura || !form.value.cliente_id) return false
  if (!form.value.items || form.value.items.length === 0) return false
  for (const it of form.value.items) {
    if (!it.descripcion || Number(it.cantidad) <= 0 || Number(it.precio_unitario) < 0) return false
  }
  return true
}

const saveFactura = async () => {
  if (!validar()) {
    error.value = true
    return
  }
  error.value = false
  isLoading.value = true

  const payload = {
    numero_factura: form.value.numero_factura,
    fecha_factura: form.value.fecha_factura,
    cliente_id: form.value.cliente_id,
    items: form.value.items.map(it => ({ descripcion: it.descripcion, cantidad: it.cantidad, precio_unitario: it.precio_unitario })),
    impuesto_porcentaje: form.value.impuesto_porcentaje,
    subtotal: subtotal.value,
    total: total.value,
    estado: form.value.estado,
    notas: form.value.notas
  }

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/api/facturas/${editingId.value}`, payload)
    } else {
      const res = await api.post('/api/facturas', payload)
      // si backend devuelve la factura creada, agregarla al listado
      if (res && res.data) facturas.value.unshift({ ...res.data, _showDetail: false })
    }
    await getFacturas()
    closeModal()
  } catch (e) {
    console.error('Error guardando factura', e)
  } finally {
    isLoading.value = false
  }
}

const deleteFactura = async (id) => {
  const ok = confirm('¿Está seguro/a de eliminar esta factura?')
  if (!ok) return
  isLoading.value = true
  try {
    await api.delete(`/api/facturas/${id}`)
    facturas.value = facturas.value.filter(f => f.id_factura !== id)
  } catch (e) {
    console.error('Error eliminando factura', e)
  } finally {
    isLoading.value = false
  }
}

const toggleDetail = (fact) => {
  fact._showDetail = !fact._showDetail
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString()
}

onMounted(() => {
  getClientes()
  getFacturas()
  resetForm()
})
</script>