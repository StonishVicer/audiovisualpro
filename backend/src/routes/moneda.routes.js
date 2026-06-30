/**
 * 📌 JUSTIFICACIÓN DE ARQUITECTURA
 * ================================
 * Rutas para el módulo de moneda bimonetaria.
 *
 * 🔗 PATRONES APLICADOS:
 * - API RESTful con parámetros de ruta y query.
 * - Delegación a servicio para mantener controladores delgados.
 */
import { Router } from 'express'
import { MonedaService } from '../services/monedaService.js'
import { logger } from '../config/logger.js'

const router = Router()

/**
 * @swagger
 * /api/moneda/tasa:
 *   get:
 *     summary: Obtener tasa de cambio USD → VES del día actual
 *     tags: [Moneda]
 *     responses:
 *       200:
 *         description: Tasa de cambio del día
 */
router.get('/tasa', async (req, res, next) => {
    try {
        const fecha = new Date().toISOString().split('T')[0]
        const tasa = await MonedaService.getTasaCambio(fecha)
        res.json({ fecha, tasa, moneda_base: 'USD', moneda_destino: 'VES' })
    } catch (err) {
        next(err)
    }
})

/**
 * @swagger
 * /api/moneda/tasa/{fecha}:
 *   get:
 *     summary: Obtener tasa de cambio USD → VES para una fecha específica
 *     tags: [Moneda]
 *     parameters:
 *       - in: path
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de la tasa (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Tasa de cambio
 *       400:
 *         description: Formato de fecha inválido
 */
router.get('/tasa/:fecha', async (req, res, next) => {
    try {
        const { fecha } = req.params
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ message: 'Formato de fecha inválido. Use YYYY-MM-DD' })
        }
        const tasa = await MonedaService.getTasaCambio(fecha)
        res.json({ fecha, tasa, moneda_base: 'USD', moneda_destino: 'VES' })
    } catch (err) {
        next(err)
    }
})

/**
 * @swagger
 * /api/moneda/tasa:
 *   post:
 *     summary: Establecer tasa de cambio para hoy
 *     tags: [Moneda]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *               fuente:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tasa actualizada
 */
router.post('/tasa', async (req, res, next) => {
    try {
        const { valor, fuente } = req.body
        const tasa = await MonedaService.setTasaCambioHoy(valor, fuente)
        res.status(201).json(tasa)
    } catch (err) {
        next(err)
    }
})

/**
 * @swagger
 * /api/moneda/convertir:
 *   post:
 *     summary: Convertir monto entre monedas
 *     tags: [Moneda]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:
 *                 type: number
 *               origen:
 *                 type: string
 *               destino:
 *                 type: string
 *               fecha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de conversión
 */
router.post('/convertir', async (req, res, next) => {
    try {
        const { monto, origen, destino, fecha } = req.body
        const fechaStr = fecha || new Date().toISOString().split('T')[0]
        const resultado = await MonedaService.convertirMonto(monto, origen, destino, fechaStr)
        const tasa = await MonedaService.getTasaCambio(fechaStr)
        res.json({ monto_original: monto, moneda_origen: origen, moneda_destino: destino, monto_convertido: resultado, tasa_usada: tasa })
    } catch (err) {
        next(err)
    }
})

/**
 * @swagger
 * /api/moneda/list:
 *   get:
 *     summary: Listar monedas disponibles
 *     tags: [Moneda]
 *     responses:
 *       200:
 *         description: Lista de monedas
 */
router.get('/list', async (req, res, next) => {
    try {
        const monedas = await MonedaService.getMonedas()
        res.json(monedas)
    } catch (err) {
        next(err)
    }
})

export default router
