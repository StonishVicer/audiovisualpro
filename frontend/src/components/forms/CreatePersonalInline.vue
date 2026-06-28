<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

const emit = defineEmits(['created', 'cancel'])

const loading = ref(false)
const error = ref('')

const nombre_personal = ref('')
const cedula = ref('')
const id_rol = ref(null)
const salario = ref('')
const email = ref('')
const telefono = ref('')
const rolesPersonal = ref([])

const showForm = ref(false)

const cargarRoles = async () => {
    try {
        const res = await api.get('/api/roles_personal')
        rolesPersonal.value = res.data
    } catch (err) {
        console.error('Error al cargar roles:', err)
    }
}

const submit = async () => {
    if (!nombre_personal.value.trim() || !cedula.value.trim() || !id_rol.value) {
        error.value = 'Nombre, Cedula y Rol son obligatorios'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const res = await api.crearPersonalInline({
            nombre_personal: nombre_personal.value.trim(),
            cedula_personal: cedula.value.trim(),
            id_rol: id_rol.value,
            salario: salario.value ? parseFloat(salario.value) : 0,
            email_personal: email.value.trim() || null,
            telefono: telefono.value.trim() || null
        })
        emit('created', res.data)
        nombre_personal.value = ''
        cedula.value = ''
        id_rol.value = null
        salario.value = ''
        email.value = ''
        telefono.value = ''
        showForm.value = false
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al crear personal'
    } finally {
        loading.value = false
    }
}

const toggle = () => {
    showForm.value = !showForm.value
    error.value = ''
    if (showForm.value) cargarRoles()
}

defineExpose({ showForm, toggle })
</script>

<template>
    <div>
        <button v-if="!showForm" @click="toggle"
            class="w-full flex items-center justify-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer font-medium">
            <Icon icon="mdi:plus" class="w-4 h-4" />
            Crear nuevo personal
        </button>

        <div v-else class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 space-y-2">
            <p class="text-xs font-bold text-indigo-800 uppercase">Nuevo Personal</p>
            <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ error }}</div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="text-xs font-medium text-gray-600">Nombre *</label>
                    <input v-model="nombre_personal" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Cedula *</label>
                    <input v-model="cedula" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Rol *</label>
                    <select v-model="id_rol" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                        <option :value="null" disabled>Seleccione rol</option>
                        <option v-for="rol in rolesPersonal" :key="rol.id_rol" :value="rol.id_rol">{{ rol.nombre_rol }}</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Salario</label>
                    <input v-model="salario" type="number" step="0.01" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Email</label>
                    <input v-model="email" type="email" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-600">Telefono</label>
                    <input v-model="telefono" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
            </div>
            <div class="flex gap-2 justify-end">
                <button @click="toggle" :disabled="loading"
                    class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition cursor-pointer">Cancelar</button>
                <button @click="submit" :disabled="loading"
                    class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50">
                    <Icon v-if="loading" icon="mdi:loading" class="animate-spin w-4 h-4 inline" />
                    <span v-else>Guardar</span>
                </button>
            </div>
        </div>
    </div>
</template>
