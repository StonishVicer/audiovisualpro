<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../services/api'

const showModal = ref(false)
const titulo = ref('')
const fileLink = ref('')
const file = ref(null)
const submitting = ref(false)
const errors = ref({})
const entregables = ref([])
const editingId = ref(null)

const abrirModal = () => {
	console.log('abrirModal called')
	clearForm()
	showModal.value = true
}

const cerrarModal = () => {
	showModal.value = false
}

const clearForm = () => {
	titulo.value = ''
	fileLink.value = ''
	file.value = null
	errors.value = {}
	editingId.value = null
}

const nombreArchivo = computed(() => file.value ? file.value.name : '')

const fetchEntregables = async () => {
	try {
		const res = await api.get('/api/entregables')
		entregables.value = res.data || []
	} catch (err) {
		console.error('Error fetching entregables:', err)
	}
}

onMounted(() => {
	fetchEntregables()
})

const onFileChange = (e) => {
	const f = e.target.files && e.target.files[0]
	if (f) {
		file.value = f
	} else {
		file.value = null
	}
}

const validate = () => {
	const e = {}
	if (!titulo.value || !titulo.value.trim()) e.titulo = 'El título es requerido.'
	if (!file.value && (!fileLink.value || !fileLink.value.trim())) e.archivo = 'Debes añadir un link o subir un archivo.'
	errors.value = e
	return Object.keys(e).length === 0
}

const submit = async () => {
	if (!validate()) return
	submitting.value = true
	try {
		let res
		if (editingId.value) {
			if (file.value) {
				const fd = new FormData()
				fd.append('titulo', titulo.value)
				fd.append('archivo', file.value)
				fd.append('link', fileLink.value)
				res = await api.put(`/api/entregables/${editingId.value}`, fd)
			} else {
				res = await api.put(`/api/entregables/${editingId.value}`, { titulo: titulo.value, link: fileLink.value })
			}
		} else {
			if (file.value) {
				const fd = new FormData()
				fd.append('titulo', titulo.value)
				fd.append('archivo', file.value)
				res = await api.post('/api/entregables', fd)
			} else {
				res = await api.post('/api/entregables', { titulo: titulo.value, link: fileLink.value })
			}
		}
		const created = res && res.data ? res.data : null
		if (created) {
			if (editingId.value) {
				const idx = entregables.value.findIndex((x) => x.id === created.id)
				if (idx !== -1) entregables.value.splice(idx, 1, created)
				else entregables.value.unshift(created)
			} else {
				entregables.value.unshift(created)
			}
		} else {
			fetchEntregables()
		}
		clearForm()
		showModal.value = false
		console.log('Entregable enviado', created)
	} catch (err) {
		console.error('Error enviando entregable:', err.response ? err.response.data : err.message)
		const serverMsg = err.response && err.response.data && err.response.data.message
		errors.value.form = serverMsg || 'Error al enviar. Revisa la consola.'
	} finally {
		submitting.value = false
	}
}

const editar = (e) => {
	editingId.value = e.id
	titulo.value = e.titulo || ''
	fileLink.value = e.link || ''
	showModal.value = true
}

const eliminar = async (id) => {
	if (!confirm('¿Eliminar este entregable?')) return
	try {
		await api.delete(`/api/entregables/${id}`)
		const idx = entregables.value.findIndex((x) => x.id === id)
		if (idx !== -1) entregables.value.splice(idx, 1)
	} catch (err) {
		console.error('Error eliminando:', err)
		alert('Error eliminando entregable')
	}
}
</script>

<template>
	<div class="h-screen flex flex-col">
		<div class="border-b border-gray-200 pb-3 mb-4">
			<h3 class="text-center font-bold text-lg">Entregables por Proyecto</h3>
		</div>

		<div class="mb-3">
			<div class="flex justify-end">
				<button type="button" @click="abrirModal" class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
					Agregar entregable
				</button>
			</div>
		</div>

		<div class="mb-3">
			<div class="flex space-x-2">
				<div class="relative flex-1">
					<input
						type="text"
						class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
						placeholder="Buscar entregable"
					>
				</div>
			</div>
		</div>

		<div v-if="showModal" class="mb-3">
			<div class="border border-gray-200 rounded-lg bg-white overflow-hidden">
				<div class="p-4 border-b">
					<h4 class="font-semibold">Nuevo entregable</h4>
				</div>
				<div class="p-4">
					<div class="mb-3">
						<label class="block text-sm font-medium mb-1">Título</label>
						<input v-model="titulo" type="text" placeholder="Nombre o título del entregable" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200" />
						<p v-if="errors.titulo" class="text-red-600 text-sm mt-1">{{ errors.titulo }}</p>
					</div>

					<div class="mb-3">
						<label class="block text-sm font-medium mb-1">Link del archivo (opcional)</label>
						<input v-model="fileLink" type="url" placeholder="https://ejemplo.com/archivo.pdf" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200" />
					</div>

					<div class="mb-3">
						<label class="block text-sm font-medium mb-1">O subir archivo</label>
						<input @change="onFileChange" type="file" class="w-full" />
						<p v-if="nombreArchivo" class="text-sm text-gray-600 mt-1">Archivo seleccionado: {{ nombreArchivo }}</p>
						<p v-if="errors.archivo" class="text-red-600 text-sm mt-1">{{ errors.archivo }}</p>
					</div>

					<p v-if="errors.form" class="text-red-600 text-sm mb-2">{{ errors.form }}</p>
				</div>

				<div class="p-4 border-t flex justify-end gap-2">
					<button @click="cerrarModal" type="button" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
					<button @click="submit" :disabled="submitting" class="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-60">
						{{ submitting ? 'Enviando...' : 'Guardar entregable' }}
					</button>
				</div>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[300px] max-h-[calc(100vh-240px)] p-2">
			<table class="table-auto w-full">
				<thead>
					<tr class="bg-green-100 text-green-900">
						<th class="px-4 py-2 text-left">Título</th>
						<th class="px-4 py-2 text-left">Archivo / Link</th>
						<th class="px-4 py-2 text-left">Fecha</th>
						<th class="px-4 py-2 text-left">Acciones</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(e, idx) in entregables" :key="e.id || idx" class="border-b hover:bg-green-50 transition">
						<td class="px-4 py-2">{{ e.titulo }}</td>
						<td class="px-4 py-2">
							<div v-if="e.link">
								<a :href="e.link" target="_blank" class="text-blue-600 underline">Ver link</a>
							</div>
							<div v-else-if="e.archivo">
								{{ e.archivo.originalname || e.archivo.filename }}
							</div>
							<div v-else class="text-gray-500">—</div>
						</td>
						<td class="px-4 py-2">{{ e.createdAt ? new Date(e.createdAt).toLocaleString() : '-' }}</td>
						<td class="px-4 py-2 flex items-center gap-2">
							<button @click="editar(e)" class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg">Editar</button>
							<button @click="eliminar(e.id)" class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg">Eliminar</button>
						</td>
					</tr>
					<tr v-if="entregables.length === 0">
						<td colspan="4" class="px-4 py-6 text-center text-gray-500">No hay entregables aún.</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>
</style>