/**
 * 📌 JUSTIFICACIÓN DE ARQUITECTURA
 * ================================
 * Servicio de moneda bimonetaria para AudiovisualPro.
 *
 * 🎯 PROBLEMA RESUELTO:
 * - Venezuela opera con dos monedas (USD y VES) con tasas de cambio fluctuantes.
 * - Los contratos se firman en USD pero se pagan en VES.
 * - Necesidad de reportes históricos precisos sin perder la trazabilidad de la tasa.
 *
 * 🏗️ SOLUCIÓN ARQUITECTÓNICA:
 * - Almacenar montos en ambas monedas para evitar pérdida de precisión decimal.
 * - Guardar tasa de cambio por transacción para auditoría.
 * - Caché en memoria de tasa diaria para rendimiento (TTL: 1 hora).
 * - Service layer desacoplado para fácil testing.
 *
 * 🔗 PATRONES APLICADOS:
 * - Repository Pattern: Aislamiento de lógica de BD.
 * - Service Layer: Orquestación de operaciones de negocio.
 * - Caching Strategy: Reducción de latencia en consultas de tasa.
 */
import { MonedaModel, TipoCambioModel } from '../models/moneda.js'
import { ValidationError } from '../utils/errors.js'
import { logger } from '../config/logger.js'

const tasaCache = {
    valor: null,
    fecha: null,
    timestamp: 0,
    TTL_MS: 60 * 60 * 1000 // 1 hora
}

function getCacheKey(fecha) {
    return `tasa_${fecha}`
}

/**
 * Obtiene la tasa de cambio USD -> VES para una fecha dada.
 * Usa caché en memoria con TTL de 1 hora.
 */
async function getTasaCambio(fecha) {
    const fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0]
    const ahora = Date.now()

    if (tasaCache.fecha === fechaStr && tasaCache.valor !== null && (ahora - tasaCache.timestamp) < tasaCache.TTL_MS) {
        logger.debug('Tasa de cambio obtenida de caché', { fecha: fechaStr, tasa: tasaCache.valor })
        return tasaCache.valor
    }

    try {
        const result = await TipoCambioModel.findByFecha(fechaStr)
        const tasa = result.rows.length > 0 ? parseFloat(result.rows[0].valor) : null

        if (tasa !== null) {
            tasaCache.valor = tasa
            tasaCache.fecha = fechaStr
            tasaCache.timestamp = ahora
            logger.info('Tasa de cambio obtenida de BD', { fecha: fechaStr, tasa })
            return tasa
        }

        logger.warn('No se encontró tasa de cambio para la fecha, insertando default 1.0', { fecha: fechaStr })
        try {
            await TipoCambioModel.setTasaHoy(1.0, 'Auto-default')
        } catch (insertErr) {
            logger.warn('No se pudo insertar tasa default (posiblemente BD no tiene tablas monedas/tipos_cambio)', { error: insertErr.message })
        }

        const defaultTasa = 1.0
        tasaCache.valor = defaultTasa
        tasaCache.fecha = fechaStr
        tasaCache.timestamp = ahora
        return defaultTasa
    } catch (err) {
        logger.error('Error obteniendo tasa de cambio de BD', { error: err.message, fecha: fechaStr })
        return 1.0
    }
}

/**
 * Convierte un monto entre monedas.
 * @param {number} monto - Monto a convertir
 * @param {string} origen - Código de moneda origen ('USD' o 'VES')
 * @param {string} destino - Código de moneda destino ('USD' o 'VES')
 * @param {string} fecha - Fecha de la tasa a usar (YYYY-MM-DD)
 * @returns {number} Monto convertido
 */
async function convertirMonto(monto, origen, destino, fecha) {
    if (origen === destino) return Number(monto)

    const tasa = await getTasaCambio(fecha)
    const montoNum = Number(monto)

    if (origen === 'USD' && destino === 'VES') {
        return montoNum * tasa
    }
    if (origen === 'VES' && destino === 'USD') {
        return montoNum / tasa
    }

    throw new ValidationError(`Conversión no soportada: ${origen} → ${destino}`)
}

/**
 * Dado un monto y su moneda, calcula ambos valores (USD y VES) para una fecha.
 * @returns {{ monto_usd: number, monto_ves: number, tasa_usada: number }}
 */
async function guardarConAmbasMonedas(monto, moneda, fecha) {
    const montoNum = Number(monto)
    const tasa = await getTasaCambio(fecha)

    let monto_usd, monto_ves

    if (moneda === 'USD') {
        monto_usd = montoNum
        monto_ves = montoNum * tasa
    } else if (moneda === 'VES') {
        monto_usd = montoNum / tasa
        monto_ves = montoNum
    } else {
        // Default: tratar como USD
        monto_usd = montoNum
        monto_ves = montoNum * tasa
    }

    logger.info('Conversión bimonetaria realizada', {
        monto_original: montoNum,
        moneda_original: moneda,
        fecha,
        tasa,
        monto_usd: Math.round(monto_usd * 100) / 100,
        monto_ves: Math.round(monto_ves * 100) / 100
    })

    return {
        monto_usd: Math.round(monto_usd * 100) / 100,
        monto_ves: Math.round(monto_ves * 100) / 100,
        tasa_usada: tasa
    }
}

/**
 * Obtiene el ID de moneda por su código.
 */
async function getIdMonedaPorCodigo(codigo) {
    if (codigo === 'USD') return 1
    if (codigo === 'VES') return 2
    const result = await MonedaModel.findByCodigo(codigo)
    if (result.rows.length === 0) throw new ValidationError(`Moneda no encontrada: ${codigo}`)
    return result.rows[0].id_moneda
}

/**
 * Establece la tasa de cambio para el día actual.
 */
async function setTasaCambioHoy(valor, fuente = 'Manual') {
    if (!valor || valor <= 0) throw new ValidationError('La tasa de cambio debe ser mayor a 0')
    const result = await TipoCambioModel.setTasaHoy(valor, fuente)
    const hoy = new Date().toISOString().split('T')[0]

    // Invalidar caché
    tasaCache.valor = valor
    tasaCache.fecha = hoy
    tasaCache.timestamp = Date.now()

    logger.info('Tasa de cambio actualizada', { fecha: hoy, valor, fuente })
    return result.rows[0]
}

/**
 * Obtiene todas las monedas disponibles.
 */
async function getMonedas() {
    const result = await MonedaModel.findAll()
    return result.rows
}

export const MonedaService = {
    getTasaCambio,
    convertirMonto,
    guardarConAmbasMonedas,
    getIdMonedaPorCodigo,
    setTasaCambioHoy,
    getMonedas
}
