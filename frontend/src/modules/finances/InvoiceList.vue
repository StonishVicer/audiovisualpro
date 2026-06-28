<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <div class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Icon icon="mdi:invoice-text-outline" class="text-green-600" />
        Facturación de Contratos
      </h3>
    </div>

    <div class="px-6 py-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="relative w-full md:w-96">
          <Icon icon="mdi:magnify" class="absolute left-3 top-3 text-gray-400" />
          <input
            v-model="query"
            type="text"
            placeholder="Buscar factura, contrato o cliente..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition shadow-sm"
          />
        </div>

        <div class="flex items-center gap-3">
            <button @click="getFacturas" class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Refrescar">
                <Icon icon="material-symbols:refresh" width="24" height="24" />
            </button>
            <button @click="openNew" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
                <Icon icon="mdi:plus" width="20" height="20" /> Nueva Factura
            </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto px-6 pb-6">
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        <div v-if="loadingFacturas" class="p-10 flex flex-col items-center justify-center text-gray-500">
           <Icon icon="svg-spinners:180-ring-with-bg" width="40" height="40" class="text-green-500 mb-2" />
           <span>Cargando facturas...</span>
        </div>

        <table v-else-if="filtered.length > 0" class="w-full text-sm text-left">
          <thead class="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
            <tr>
              <th class="px-6 py-3">N° Factura</th>
              <th class="px-6 py-3">Fecha</th>
              <th class="px-6 py-3">Contrato / Cliente</th>
              <th class="px-6 py-3 text-right">Total</th>
              <th class="px-6 py-3 text-center">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
             <template v-for="fact in filtered" :key="fact.id_factura">
              <tr class="hover:bg-gray-50 transition cursor-pointer" @click="toggleDetail(fact)">
                <td class="px-6 py-4 font-medium text-gray-900">#{{ fact.numero_factura }}</td>
                <td class="px-6 py-4 text-gray-600">{{ formatDate(fact.fecha_factura) }}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800">{{ fact.nombre_cliente || '...' }}</div>
                    <div class="text-xs text-gray-500 flex items-center gap-1">
                      <Icon icon="mdi:file-document-outline" /> 
                      {{ fact.nombre_proyecto || 'Sin proyecto asignado' }}
                    </div>
                </td>
                <td class="px-6 py-4 text-right font-bold text-green-700">${{ Number(fact.total).toFixed(2) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="{
                    'bg-yellow-100 text-yellow-800': fact.estado === 'PENDIENTE',
                    'bg-green-100 text-green-800': fact.estado === 'PAGADA'
                  }" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ fact.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 flex justify-center gap-2">
                   <button @click.stop="openEdit(fact)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Editar">
                     <Icon icon="material-symbols:edit" width="20" />
                   </button>
                   <button @click.stop="deleteFactura(fact.id_factura)" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Eliminar">
                     <Icon icon="material-symbols:delete" width="20" />
                   </button>
                   <Icon :icon="fact._showDetail ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="text-gray-400 self-center ml-2" width="20" />
                </td>
              </tr>
              <tr v-if="fact._showDetail" class="bg-gray-50">
                 <td colspan="6" class="px-6 py-4">
                    <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-inner">
                       <h4 class="font-bold text-gray-700 mb-2 border-b pb-2 text-xs uppercase">Items Facturados</h4>
                       <div v-for="it in fact.items || []" :key="it.id_item" class="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                          <span>{{ it.descripcion }} <span class="text-gray-400 text-xs">x{{ it.cantidad }}</span></span>
                          <span class="font-medium">${{ (Number(it.cantidad)*Number(it.precio_unitario)).toFixed(2) }}</span>
                       </div>
                    </div>
                 </td>
              </tr>
             </template>
          </tbody>
        </table>
        
        <div v-else class="p-12 flex flex-col items-center text-gray-400">
           <Icon icon="mdi:invoice-remove-outline" width="60" height="60" class="mb-2 opacity-50" />
           <p>No se encontraron facturas.</p>
        </div>
      </div>
    </div>

    <Modal :show="showModal" @close="closeModal" :title="isEditing ? 'Editar Factura' : 'Nueva Factura'">
      <div class="max-h-[80vh] overflow-y-auto px-1">
        <form @submit.prevent="saveFactura" class="space-y-6">
          
          <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
             <label class="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Icon icon="mdi:file-sign" /> Seleccionar Contrato
             </label>
             <select 
                v-model="selectedContratoId" 
                @change="onContratoChange"
                class="w-full bg-white border border-blue-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
             >
                <option value="" disabled>-- Seleccione un contrato --</option>
                <option v-for="c in contratos" :key="c.id_contrato" :value="c.id_contrato">
                   Cliente: {{ c.nombre_cliente }} — Proy: {{ c.nombre_proyecto }} (${{ c.monto_contrato }})
                </option>
             </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">N° Factura</label>
                <input v-model="form.numero_factura" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-800" placeholder="Ej: 001" />
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión</label>
                <input v-model="form.fecha_factura" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select v-model="form.estado" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none">
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="PAGADA">PAGADA</option>
                </select>
             </div>
          </div>

          <div class="border-t border-b border-gray-200 py-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold text-gray-700 text-sm">Detalle de Servicios</h4>
            </div>
            
            <div class="space-y-3">
              <div v-for="(it, idx) in form.items" :key="it.tmpId" class="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                 <div class="flex-1 grid grid-cols-12 gap-3">
                   <div class="col-span-8">
                     <label class="text-[10px] text-gray-500 uppercase font-bold">Descripción</label>
                     <input v-model="it.descripcion" class="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:border-green-500 outline-none" />
                   </div>
                   <div class="col-span-2">
                     <label class="text-[10px] text-gray-500 uppercase font-bold text-right block">Precio</label>
                     <input v-model.number="it.precio_unitario" type="number" class="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 text-right outline-none" />
                   </div>
                   <div class="col-span-2 text-right">
                     <label class="text-[10px] text-gray-500 uppercase font-bold block">Subtotal</label>
                     <div class="font-bold text-gray-700 text-sm py-1">
                        ${{ (Number(it.cantidad || 1) * Number(it.precio_unitario)).toFixed(2) }}
                     </div>
                   </div>
                 </div>
                 <button type="button" @click="removeItem(idx)" class="mt-5 text-red-400 hover:text-red-600 transition"><Icon icon="mdi:trash-can-outline" width="18"/></button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <div class="w-full md:w-1/2 bg-gray-50 p-4 rounded-xl">
               <div class="flex justify-between text-sm mb-1">
                 <span class="text-gray-500">Subtotal:</span>
                 <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
               </div>

               <div class="flex justify-between text-xl font-bold text-green-700 border-t border-gray-200 pt-2">
                 <span>Total a Pagar:</span>
                 <span>${{ total.toFixed(2) }}</span>
               </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">Cancelar</button>
            <button type="submit" class="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-md transition">
               <Icon v-if="isLoading" icon="eos-icons:loading" class="animate-spin mr-2" />
               {{ isEditing ? 'Guardar Cambios' : 'Crear Factura' }}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Modal from '../../components/Modal.vue'
import api from '../../services/api.js'

// --- Estados ---
const facturas = ref([])
const contratos = ref([]) 
const loadingFacturas = ref(false)
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const query = ref('')

const selectedContratoId = ref('') 

const emptyItem = () => ({ tmpId: Date.now() + Math.random(), descripcion: '', cantidad: 1, precio_unitario: 0 })

const form = ref({
  numero_factura: '',
  fecha_factura: new Date().toISOString().slice(0,10),
  cliente_id: '',
  id_contrato: null,
  items: [emptyItem()],
  estado: 'PENDIENTE',
  notas: '',
})

// --- Computadas ---
const subtotal = computed(() => form.value.items.reduce((acc, it) => acc + (Number(it.cantidad||1) * Number(it.precio_unitario||0)), 0))
const total = computed(() => {
  return subtotal.value
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return facturas.value
  return facturas.value.filter(f => 
    String(f.numero_factura).includes(q) ||
    (f.nombre_cliente || '').toLowerCase().includes(q) ||
    (f.nombre_proyecto || '').toLowerCase().includes(q)
  )
})

// --- API ---
const getContratos = async () => {
  try {
    const res = await api.get('/api/contratos') 
    contratos.value = res.data
  } catch (e) { console.error(e) }
}

const getFacturas = async () => {
  loadingFacturas.value = true
  try {
    const res = await api.get('/api/facturas')
    // Agregamos flag para el detalle desplegable
    facturas.value = res.data.map(f => ({ ...f, _showDetail: false }))
  } catch (e) { console.error(e) } 
  finally { loadingFacturas.value = false }
}

// --- Lógica del Contrato ---
const onContratoChange = () => {
   const contrato = contratos.value.find(c => c.id_contrato === selectedContratoId.value)
   if (!contrato) return

   form.value.cliente_id = contrato.id_cliente
   form.value.id_contrato = contrato.id_contrato
   
   // Pre-llenar item con datos del contrato
   form.value.items = [{
      tmpId: Date.now(),
      descripcion: `Contrato: ${contrato.nombre_proyecto}`,
      cantidad: 1,
      precio_unitario: Number(contrato.monto_contrato)
   }]
   
   form.value.notas = contrato.descripcion_servicios || ''
}

// --- Funciones del Form ---
const openNew = () => {
  resetForm()
  
  // Auto-incremento
  if (facturas.value.length > 0) {
      const numbers = facturas.value.map(f => {
          // Extraer solo dígitos
          const match = String(f.numero_factura).match(/(\d+)/);
          return match ? parseInt(match[1] || match[0]) : 0;
      });
      const max = Math.max(...numbers, 0);
      form.value.numero_factura = String(max + 1).padStart(3, '0');
  } else {
      form.value.numero_factura = '001';
  }

  isEditing.value = false
  showModal.value = true
}

const openEdit = (fact) => {
    isEditing.value = true
    editingId.value = fact.id_factura
    selectedContratoId.value = fact.id_contrato 

    form.value = {
        numero_factura: fact.numero_factura,
        fecha_factura: fact.fecha_factura ? fact.fecha_factura.split('T')[0] : '',
        cliente_id: fact.cliente_id,
        id_contrato: fact.id_contrato,

        estado: fact.estado,
        notas: fact.notas,
        items: fact.items?.map(it => ({
            ...it,
            tmpId: Math.random()
        })) || [emptyItem()]
    }
    showModal.value = true
}

const closeModal = () => showModal.value = false

const resetForm = () => {
  selectedContratoId.value = ''
  form.value = {
    numero_factura: '',
    fecha_factura: new Date().toISOString().slice(0,10),
    cliente_id: '',
    id_contrato: null,
    items: [emptyItem()],
    estado: 'PENDIENTE',
    notas: ''
  }
}

const addItem = () => form.value.items.push(emptyItem())
const removeItem = (idx) => {
    if(form.value.items.length > 1) form.value.items.splice(idx, 1)
}

// --- GUARDAR FACTURA (SOLUCIÓN CLAVE) ---
const saveFactura = async () => {
  if (!form.value.cliente_id || !form.value.numero_factura) {
      alert('Seleccione un contrato válido y escriba un N° de factura.')
      return
  }

  isLoading.value = true
  // Calculamos montos finales
  const payload = { ...form.value, subtotal: subtotal.value, total: total.value }

  try {
     if (isEditing.value) {
         // UPDATE
         const res = await api.put(`/api/facturas/${editingId.value}`, payload)
         
         // Actualización manual para no recargar todo
         const index = facturas.value.findIndex(f => f.id_factura === editingId.value)
         if (index !== -1) {
             const updated = res.data.factura; 
             // Mantenemos los nombres visibles
             const contratoInfo = contratos.value.find(c => c.id_contrato === updated.id_contrato)
             updated.nombre_cliente = contratoInfo ? contratoInfo.nombre_cliente : '...'
             updated.nombre_proyecto = contratoInfo ? contratoInfo.nombre_proyecto : '...'
             updated._showDetail = false
             updated.items = form.value.items // Mantenemos items locales
             facturas.value[index] = updated
         }
     } else {
         // CREATE
         const res = await api.post('/api/facturas', payload)
         const nuevaFactura = res.data
         
         // INYECCIÓN DE NOMBRES (Esto hace que se visualice guardada al instante)
         const contratoInfo = contratos.value.find(c => c.id_contrato === nuevaFactura.id_contrato)
         
         if (contratoInfo) {
             nuevaFactura.nombre_cliente = contratoInfo.nombre_cliente
             nuevaFactura.nombre_proyecto = contratoInfo.nombre_proyecto
         } else {
             nuevaFactura.nombre_cliente = 'Cargando...' // Fallback
         }

         nuevaFactura._showDetail = false
         facturas.value.unshift(nuevaFactura) // Se agrega arriba
     }
     
     showModal.value = false
  } catch (e) {
     console.error(e)
     alert('Error al guardar la factura: ' + (e.response?.data?.message || e.message))
  } finally {
     isLoading.value = false
  }
}

const deleteFactura = async (id) => {
  if(!confirm('¿Eliminar esta factura?')) return
  try {
    await api.delete(`/api/facturas/${id}`)
    facturas.value = facturas.value.filter(f => f.id_factura !== id)
  } catch (e) { console.error(e) }
}

const toggleDetail = (f) => f._showDetail = !f._showDetail
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

onMounted(() => {
  getContratos()
  getFacturas()
})
</script>