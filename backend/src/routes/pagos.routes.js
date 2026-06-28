import { Router } from 'express'
import { getPagos, getPagoById, createPago, deletePago, updatePago } from '../controllers/gastoController.js'
import { validatePago, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/pagos_personal:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar todos los pagos al personal
 *     responses: { 200: { description: Lista de pagos } }
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un pago al personal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_personal, monto_pagado]
 *             properties:
 *               id_personal: { type: integer }
 *               id_proyecto: { type: integer }
 *               monto_pagado: { type: number }
 *               fecha_pago: { type: string, format: date }
 *               sueldo: { type: number }
 *               extra: { type: number }
 *     responses: { 201: { description: Pago creado } }
 * /api/pagos_personal/{id}:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener pago por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Pago } }
 *   put:
 *     tags: [Pagos]
 *     summary: Actualizar pago
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Pago actualizado } }
 *   delete:
 *     tags: [Pagos]
 *     summary: Eliminar pago
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Pago eliminado } }
 */
router.get('/:id', validateIdParam, getPagoById)
router.get('/', getPagos)
router.post('/', validatePago, createPago)
router.put('/:id', validateIdParam, updatePago)
router.delete('/:id', validateIdParam, deletePago)

export default router
