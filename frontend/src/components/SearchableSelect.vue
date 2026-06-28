<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
    modelValue: { type: [String, Number], default: null },
    options: { type: Array, required: true },
    labelKey: { type: String, default: 'nombre' },
    sublabelKey: { type: String, default: null },
    placeholder: { type: String, default: 'Buscar...' },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: false },
    createLabel: { type: String, default: 'Crear nuevo...' }
})

const emit = defineEmits(['update:modelValue', 'select', 'create'])

const search = ref('')
const isOpen = ref(false)
const selectedObj = ref(null)

watch(() => props.modelValue, (val) => {
    if (val != null && props.options.length) {
        const found = props.options.find(o => {
            const id = o.id || o.id_proyecto || o.id_cliente || o.id_locacion || o.id_recurso || o.id_personal || o.id_rol || o.id_estado_proyecto || o.id_tipo_proyecto || o.id_tipo_recurso || o.id_categoria_gasto || o.id_entregable
            return id == val
        })
        if (found) {
            selectedObj.value = found
            search.value = found[props.labelKey] || ''
        }
    } else {
        selectedObj.value = null
        search.value = ''
    }
}, { immediate: true })

const filtered = computed(() => {
    if (!search.value.trim()) return props.options.slice(0, 10)
    const q = search.value.toLowerCase()
    return props.options.filter(o => {
        const label = (o[props.labelKey] || '').toLowerCase()
        const sublabel = props.sublabelKey ? (o[props.sublabelKey] || '').toLowerCase() : ''
        const rif = (o.rif_cliente || '').toLowerCase()
        return label.includes(q) || sublabel.includes(q) || rif.includes(q)
    }).slice(0, 10)
})

const getOptionId = (o) => {
    return o.id || o.id_proyecto || o.id_cliente || o.id_locacion || o.id_recurso || o.id_personal || o.id_rol || o.id_estado_proyecto || o.id_tipo_proyecto || o.id_tipo_recurso || o.id_categoria_gasto || o.id_entregable
}

const getLabel = (o) => {
    return o[props.labelKey] || ''
}

const getSublabel = (o) => {
    return props.sublabelKey ? o[props.sublabelKey] : null
}

const selectOption = (o) => {
    const id = getOptionId(o)
    selectedObj.value = o
    search.value = getLabel(o)
    emit('update:modelValue', id)
    emit('select', o)
    isOpen.value = false
}

const clearSelection = () => {
    selectedObj.value = null
    search.value = ''
    emit('update:modelValue', null)
    emit('select', null)
    isOpen.value = false
}

const handleCreate = () => {
    emit('create')
    isOpen.value = false
}

const onFocus = () => {
    isOpen.value = true
    if (selectedObj.value) search.value = ''
}

const onBlur = () => {
    setTimeout(() => {
        isOpen.value = false
        if (selectedObj.value) search.value = getLabel(selectedObj.value)
    }, 200)
}

defineExpose({ clearSelection })
</script>

<template>
    <div class="relative">
        <div class="relative">
            <Icon icon="material-symbols:search" width="18" height="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                v-model="search"
                type="text"
                :placeholder="placeholder"
                @focus="onFocus"
                @blur="onBlur"
                class="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm"
            />
            <button v-if="selectedObj" @click="clearSelection" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer">
                <Icon icon="mdi:close-circle" width="16" height="16" />
            </button>
        </div>

        <div v-if="isOpen" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <div v-if="loading" class="px-3 py-3 text-sm text-gray-400 text-center">
                <Icon icon="mdi:loading" class="animate-spin w-4 h-4 inline mr-1" />
                Cargando...
            </div>
            <div v-else-if="filtered.length === 0" class="px-3 py-3 text-sm text-gray-400 text-center">
                No se encontraron resultados
            </div>
            <template v-else>
                <div
                    v-for="o in filtered"
                    :key="getOptionId(o)"
                    @mousedown.prevent="selectOption(o)"
                    class="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0 transition"
                >
                    <div class="text-sm font-medium text-gray-700">{{ getLabel(o) }}</div>
                    <div v-if="getSublabel(o)" class="text-xs text-gray-400">{{ getSublabel(o) }}</div>
                </div>
            </template>
            <div v-if="allowCreate && search.trim() && !filtered.some(o => getLabel(o).toLowerCase() === search.trim().toLowerCase())"
                @mousedown.prevent="handleCreate"
                class="px-3 py-2 hover:bg-green-50 cursor-pointer border-t border-gray-100 text-sm text-green-600 font-medium flex items-center gap-1 transition">
                <Icon icon="mdi:plus" class="w-4 h-4" />
                {{ createLabel }}
            </div>
        </div>
    </div>
</template>
