<script setup>
/**
 * 📌 JUSTIFICACIÓN DE ARQUITECTURA
 * ================================
 * Selector de moneda para el frontend de AudiovisualPro.
 *
 * 🎯 PROBLEMA RESUELTO:
 * - Permitir al usuario seleccionar USD o VES para visualizar montos.
 * - Mostrar la tasa de cambio actual con opción de refrescar.
 *
 * 🔗 PATRONES APLICADOS:
 * - Component Pattern (Vue 3 SFC): UI reutilizable y autocontenida.
 */

import { Icon } from '@iconify/vue'
import { useCurrency } from '../composables/useCurrency.js'
import { onMounted } from 'vue'

const { selectedMoneda, tasaCambio, loadingTasa, fetchTasaCambio } = useCurrency()

const refreshTasa = async () => {
    await fetchTasaCambio()
}

onMounted(() => {
    fetchTasaCambio()
})
</script>

<template>
    <div class="flex items-center gap-3">
        <select
            v-model="selectedMoneda"
            class="border rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        >
            <option value="USD">$ USD</option>
            <option value="VES">Bs. VES</option>
        </select>
        <span class="text-xs text-gray-400 whitespace-nowrap">
            Tasa: 1 USD = {{ tasaCambio.toFixed(2) }} Bs.
        </span>
        <button
            @click="refreshTasa"
            class="text-blue-500 hover:text-blue-700 transition cursor-pointer"
            :disabled="loadingTasa"
            title="Refrescar tasa de cambio"
        >
            <Icon :icon="loadingTasa ? 'mdi:loading' : 'mdi:refresh'" :class="['w-[18px] h-[18px]', loadingTasa ? 'animate-spin' : '']" />
        </button>
    </div>
</template>
