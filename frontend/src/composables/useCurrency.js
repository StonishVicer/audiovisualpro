/**
 * 📌 JUSTIFICACIÓN DE ARQUITECTURA
 * ================================
 * Composable de moneda bimonetaria para el frontend de AudiovisualPro.
 *
 * 🎯 PROBLEMA RESUELTO:
 * - Proveer conversión de moneda consistente en todos los componentes financieros.
 * - Centralizar la lógica de formato de moneda (USD → $, VES → Bs.).
 * - Sincronizar la tasa de cambio entre componentes vía estado compartido.
 *
 * 🏗️ SOLUCIÓN ARQUITECTÓNICA:
 * - Estado reactivo compartido (selectedMoneda, tasaCambio).
 * - Métodos utilitarios para formateo y conversión.
 * - Fetch asíncrono de tasa de cambio con manejo de errores.
 *
 * 🔗 PATRONES APLICADOS:
 * - Composable Pattern (Vue 3): Lógica reutilizable y reactiva.
 * - Singleton-like state compartido vía module-level refs.
 */

import { ref } from 'vue'
import api from '../services/api.js'

const selectedMoneda = ref('USD')
const tasaCambio = ref(1)
const loadingTasa = ref(false)

export function useCurrency() {
    const fetchTasaCambio = async (fecha) => {
        loadingTasa.value = true
        try {
            const fechaStr = fecha || new Date().toISOString().split('T')[0]
            const res = await api.get(`/api/moneda/tasa/${fechaStr}`)
            tasaCambio.value = res.data.tasa
            return res.data.tasa
        } catch (e) {
            console.error('Error al obtener tasa de cambio:', e)
            return tasaCambio.value
        } finally {
            loadingTasa.value = false
        }
    }

    const setMoneda = (moneda) => {
        selectedMoneda.value = moneda
    }

    const convertir = (monto, de, a) => {
        const m = Number(monto)
        if (de === a) return m
        if (de === 'USD' && a === 'VES') return m * tasaCambio.value
        if (de === 'VES' && a === 'USD') return m / tasaCambio.value
        return m
    }

    const formatCurrency = (monto, moneda) => {
        const m = Number(monto) || 0
        if (moneda === 'VES') return `Bs. ${m.toFixed(2)}`
        return `$ ${m.toFixed(2)}`
    }

    const getMontoDisplay = (item) => {
        if (!item) return formatCurrency(0, selectedMoneda.value)

        if (selectedMoneda.value === 'VES' && item.monto_ves != null) {
            return formatCurrency(item.monto_ves, 'VES')
        }

        if (selectedMoneda.value === 'USD') {
            const usdValue = item.monto_usd != null ? item.monto_usd : (item.total || item.monto_gasto || item.monto_pagado || 0)
            return formatCurrency(usdValue, 'USD')
        }

        const amount = item.total || item.monto_gasto || item.monto_pagado || 0
        const converted = convertir(amount, 'USD', selectedMoneda.value)
        return formatCurrency(converted, selectedMoneda.value)
    }

    const getMontoNumber = (item) => {
        if (!item) return 0

        if (selectedMoneda.value === 'VES' && item.monto_ves != null) {
            return Number(item.monto_ves)
        }

        if (selectedMoneda.value === 'USD') {
            return Number(item.monto_usd != null ? item.monto_usd : (item.total || item.monto_gasto || item.monto_pagado || 0))
        }

        const amount = Number(item.total || item.monto_gasto || item.monto_pagado || 0)
        return convertir(amount, 'USD', selectedMoneda.value)
    }

    return {
        selectedMoneda,
        tasaCambio,
        loadingTasa,
        fetchTasaCambio,
        setMoneda,
        convertir,
        formatCurrency,
        getMontoDisplay,
        getMontoNumber
    }
}
