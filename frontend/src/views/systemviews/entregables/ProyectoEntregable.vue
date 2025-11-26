<script setup>
import { Icon } from '@iconify/vue';
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
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref(false)
const loadingEntregables = ref(false)

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
	error.value = false
}

const nombreArchivo = computed(() => file.value ? file.value.name : '')

const fetchEntregables = async () => {
	loadingEntregables.value = true
	try {
		const res = await api.get('/api/entregables')
		entregables.value = res.data || []
	} catch (err) {
		console.error('Error fetching entregables:', err)
	} finally {
		loadingEntregables.value = false
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

const validarFormulario = () => {
	const { titulo: tit, link, archivo } = {
		titulo: titulo.value.trim(),
		link: fileLink.value.trim(),
		archivo: file.value
	};
	
	if (!tit || (!link && !archivo)) {
		error.value = true
		return false
	}
	error.value = false
	return true
}

const submit = async () => {
	if (!validarFormulario()) return
	
	submitting.value = true
	isLoading.value = true
	
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
				res = await api.put(`/api/entregables/${editingId.value}`, { 
					titulo: titulo.value, 
					link: fileLink.value 
				})
			}
		} else {
			if (file.value) {
				const fd = new FormData()
				fd.append('titulo', titulo.value)
				fd.append('archivo', file.value)
				fd.append('link', fileLink.value)
				res = await api.post('/api/entregables', fd)
			} else {
				res = await api.post('/api/entregables', { 
					titulo: titulo.value, 
					link: fileLink.value 
				})
			}
		}
		
		const created = res?.data
		if (created) {
			if (editingId.value) {
				const idx = entregables.value.findIndex((x) => x.id === created.id)
				if (idx !== -1) entregables.value.splice(idx, 1, created)
				else entregables.value.unshift(created)
			} else {
				entregables.value.unshift(created)
			}
		} else {
			await fetchEntregables()
		}
		
		clearForm()
		showModal.value = false
		console.log('Entregable enviado', created)
	} catch (err) {
		console.error('Error enviando entregable:', err.response ? err.response.data : err.message)
		const serverMsg = err.response?.data?.message
		errors.value.form = serverMsg || 'Error al enviar. Revisa la consola.'
	} finally {
		submitting.value = false
		isLoading.value = false
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
	isLoading.value = true
	
	try {
		await api.delete(`/api/entregables/${id}`)
		const idx = entregables.value.findIndex((x) => x.id === id)
		if (idx !== -1) entregables.value.splice(idx, 1)
	} catch (err) {
		console.error('Error eliminando:', err)
		alert('Error eliminando entregable')
	} finally {
		isLoading.value = false
	}
}

// Computed para filtrar entregables
const entregablesFiltrados = computed(() => {
	if (!searchQuery.value) return entregables.value
	return entregables.value.filter(e => 
		e.titulo?.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
})

// Función para determinar el estado del entregable
const getEstado = (entregable) => {
	if (entregable.link || entregable.archivo) {
		return { 
			texto: 'Completado', 
			clase: 'bg-green-100 text-green-800',
			icono: 'mdi:check-circle'
		}
	}
	return { 
		texto: 'Pendiente', 
		clase: 'bg-yellow-100 text-yellow-800',
		icono: 'mdi:clock-outline'
	}
}
</script>

<template>
	<div class="h-screen flex flex-col relative">
		<div class="border-b border-gray-200 pb-3 mb-4">
			<h3 class="text-center font-bold text-lg">Entregables por Proyecto</h3>
		</div>

		<div class="mb-3">
			<div class="flex justify-end">
				<button 
					@click="abrirModal" 
					class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors"
				>
					<Icon icon="mdi:file-plus" width="25" height="25" class="mr-2" />
					Agregar Entregable
				</button>
			</div>
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
						v-model="searchQuery"
						type="text"
						class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
						placeholder="Buscar entregable"
					>
				</div>
			</div>
		</div>

		<!-- Modal que aparece encima del contenido pero sin fondo oscuro -->
		<div v-if="showModal" class="absolute inset-0 z-50 bg-white rounded-lg border border-gray-300 shadow-xl">
			<div class="h-full flex flex-col">
				<!-- Header -->
				<div class="border-b border-gray-200 p-4 bg-green-50 rounded-t-lg">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-bold text-gray-900">
							{{ editingId ? 'Editar Entregable' : 'Nuevo Entregable' }}
						</h3>
						<button @click="cerrarModal" class="text-gray-500 hover:text-gray-700 transition-colors">
							<Icon icon="mdi:close" width="24" height="24" />
						</button>
					</div>
				</div>

				<!-- Form -->
				<div class="flex-1 overflow-y-auto p-6">
					<div v-if="error" class="flex text-[15px] font-semibold text-red-500 items-center justify-center w-full bg-red-100 border border-red-200 p-3 mb-4 rounded-xl shadow-md">
						<Icon icon="mdi:error" width="25" height="25" class="mr-2" />
						Complete todos los campos requeridos.
					</div>

					<form @submit.prevent="submit" class="space-y-4">
						<!-- Título -->
						<div class="flex flex-col">
							<label for="titulo" class="text-sm font-semibold text-gray-500 mb-1">
								Título del Entregable *
							</label>
							<input
								type="text"
								v-model="titulo"
								class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
								placeholder="Nombre o título del entregable"
							>
						</div>

						<!-- Link del archivo -->
						<div class="flex flex-col">
							<label for="link" class="text-sm font-semibold text-gray-500 mb-1">
								Link del Archivo (Opcional)
							</label>
							<input
								type="url"
								v-model="fileLink"
								class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
								placeholder="https://ejemplo.com/archivo.pdf"
							>
						</div>

						<!-- Subir archivo -->
						<div class="flex flex-col">
							<label class="text-sm font-semibold text-gray-500 mb-1">
								O subir archivo *
							</label>
							<div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all hover:border-green-400 hover:bg-green-50">
								<input 
									@change="onFileChange" 
									type="file" 
									class="hidden" 
									id="file-upload"
								/>
								<label for="file-upload" class="cursor-pointer">
									<Icon icon="mdi:file-upload" width="40" height="40" class="text-gray-400 mx-auto mb-2" />
									<p class="text-gray-600 mb-1">Haz clic para subir un archivo</p>
									<p class="text-sm text-gray-500">PDF, DOC, DOCX, ZIP (Max. 10MB)</p>
								</label>
							</div>
							<p v-if="nombreArchivo" class="text-green-600 text-sm mt-2 flex items-center gap-2">
								<Icon icon="mdi:check-circle" width="16" height="16" />
								Archivo seleccionado: <span class="font-medium">{{ nombreArchivo }}</span>
							</p>
						</div>

						<!-- Botones -->
						<div class="flex space-x-3 pt-4">
							<button 
								type="submit" 
								:disabled="submitting"
								class="flex-1 flex items-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
							>
								<Icon v-if="submitting" icon="mdi:loading" class="animate-spin mr-2" width="20" height="20" />
								<Icon v-else icon="mdi:content-save" width="20" height="20" class="mr-2" />
								{{ submitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Entregable') }}
							</button>
							
							<button 
								type="button" 
								@click="clearForm"
								class="flex-1 flex items-center justify-center cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
							>
								<Icon icon="mdi:broom" width="20" height="20" class="mr-2" />
								Limpiar Campos
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Contenido principal (se oculta cuando el modal está abierto) -->
		<div v-if="!showModal" class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
			<div>
				<div v-if="loadingEntregables">
					<div class="flex items-center justify-center text-center mt-3">
						<div class="flex text-[15px] font-semibold text-blue-500 items-center justify-center w-full bg-blue-100 border border-blue-200 p-3 mx-3 rounded-xl shadow-md">
							<Icon icon="mdi:loading" class="animate-spin mr-2" width="25" height="25" />
							Cargando entregables...
						</div>
					</div>
				</div>
				
				<table v-else-if="entregablesFiltrados.length > 0" class="table-auto w-full">
					<thead>
						<tr class="bg-green-100 text-green-900">
							<th class="px-4 py-2 text-left">Título</th>
							<th class="px-4 py-2 text-left">Archivo / Link</th>
							<th class="px-4 py-2 text-left">Fecha</th>
							<th class="px-4 py-2 text-left">Estado</th>
							<th class="px-4 py-2 text-left">Acciones</th>
						</tr>
					</thead>
					<tbody>
						<tr 
							v-for="(e, idx) in entregablesFiltrados" 
							:key="e.id || idx" 
							class="border-b border-green-100 hover:bg-green-50 transition"
						>
							<td class="px-4 py-2">
								<div class="flex items-center">
									<Icon icon="mdi:file-document" width="20" height="20" class="text-gray-500 mr-2" />
									{{ e.titulo }}
								</div>
							</td>
							<td class="px-4 py-2">
								<div v-if="e.link" class="flex items-center">
									<a :href="e.link" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors">
										<Icon icon="mdi:link" width="16" height="16" class="mr-1" />
										Ver enlace
									</a>
								</div>
								<div v-else-if="e.archivo" class="flex items-center text-gray-700">
									<Icon icon="mdi:file" width="16" height="16" class="mr-1" />
									{{ e.archivo.originalname || e.archivo.filename }}
								</div>
								<div v-else class="text-gray-400 flex items-center">
									<Icon icon="mdi:file-remove" width="16" height="16" class="mr-1" />
									Sin archivo
								</div>
							</td>
							<td class="px-4 py-2 text-sm text-gray-600">
								{{ e.createdAt ? new Date(e.createdAt).toLocaleDateString('es-ES') : '-' }}
							</td>
							<td class="px-4 py-2">
								<span 
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
									:class="getEstado(e).clase"
								>
									<Icon :icon="getEstado(e).icono" width="12" height="12" class="mr-1" />
									{{ getEstado(e).texto }}
								</span>
							</td>
							<td class="px-4 py-2 flex items-center gap-2">
								<button
									@click="editar(e)"
									class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
								>
									<Icon icon="material-symbols:edit" width="16" height="16" class="mr-1" />
									Editar
								</button>
								<button
									@click="eliminar(e.id)"
									class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
								>
									<Icon icon="material-symbols:delete" width="16" height="16" class="mr-1" />
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
							No hay entregables {{ searchQuery ? 'que coincidan con la búsqueda' : 'creados' }}.
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Loading Toast -->
		<div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-xl p-6 flex items-center">
				<Icon icon="mdi:loading" class="animate-spin text-blue-500 mr-3" width="24" height="24" />
				<span class="text-gray-700">Procesando...</span>
			</div>
		</div>
	</div>
</template>