<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../../services/api.js'

const emit = defineEmits(['created', 'cancel'])

const loading = ref(false)
const error = ref('')

const tipoId = ref('V')
const numeroId = ref('')
const nombre_personal = ref('')
const id_rol = ref(null)
const salario = ref('')
const email = ref('')
const prefijoTelefono = ref('0412')
const telefono = ref('')
const rolesPersonal = ref([])

const prefijos = ['0412', '0414', '0416', '0424', '0426', '0212', '0241', '0243', '0251', '0261']

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
    if (!numeroId.value.trim() || !nombre_personal.value.trim() || !id_rol.value) {
        error.value = 'Identificacion, Nombre y Rol son obligatorios'
        return
    }
    error.value = ''
    loading.value = true
    try {
        const cedulaCompleta = tipoId.value + '-' + numeroId.value.trim()
        const telefonoCompleto = telefono.value.trim() ? prefijoTelefono.value + telefono.value.trim() : ''
        const res = await api.crearPersonalInline({
            nombre_personal: nombre_personal.value.trim(),
            cedula_personal: cedulaCompleta,
            tipo_identificacion: tipoId.value,
            id_rol: id_rol.value,
            salario: salario.value ? parseFloat(salario.value) : 0,
            email_personal: email.value.trim() || null,
            telefono: telefonoCompleto || null,
            prefijo_telefono: telefono.value.trim() ? prefijoTelefono.value : null
        })
        emit('created', res.data)
        tipoId.value = 'V'
        numeroId.value = ''
        nombre_personal.value = ''
        id_rol.value = null
        salario.value = ''
        email.value = ''
        prefijoTelefono.value = '0412'
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
            Agregar personal
        </button>

        <div v-else class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 space-y-2">
            <p class="text-xs font-bold text-indigo-800 uppercase">Nuevo Personal</p>
            <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ error }}</div>
            <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                    <label class="text-xs font-medium text-gray-600">Nombre *</label>
                    <input v-model="nombre_personal" type="text" class="w-full border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </div>
                <div class="col-span-2">
                    <label class="text-xs font-medium text-gray-600">Identificacion *</label>
                    <div class="flex gap-1">
                        <select v-model="tipoId" class="w-14 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                            <option value="V">V</option>
                            <option value="J">J</option>
                            <option value="E">E</option>
                        </select>
                        <input v-model="numeroId" type="text" class="flex-1 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="12345678-9" />
                    </div>
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
                    <div class="flex gap-1">
                        <select v-model="prefijoTelefono" class="w-20 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                            <option v-for="p in prefijos" :key="p" :value="p">{{ p }}</option>
                        </select>
                        <input v-model="telefono" type="text" class="flex-1 border border-gray-300 rounded text-sm p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="1234567" />
                    </div>
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
