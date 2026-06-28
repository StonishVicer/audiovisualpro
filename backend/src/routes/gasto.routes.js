import { Router } from 'express'
import { getGastos, getGastoById, createGasto, deleteGasto, updateGasto } from '../controllers/gastoController.js'
import { validateGasto, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/gastos:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar todos los gastos
 *     responses: { 200: { description: Lista de gastos con categoría } }
 *   post:
 *     tags: [Gastos]
 *     summary: Registrar un gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto_gasto]
 *             properties:
 *               monto_gasto: { type: number }
 *               descripcion_gasto: { type: string }
 *               id_categoria_gasto: { type: integer }
 *               id_proyecto: { type: integer }
 *               fecha_gasto: { type: string, format: date }
 *     responses: { 201: { description: Gasto creado } }
 * /api/gastos/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener gasto por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Gasto } }
 *   put:
 *     tags: [Gastos]
 *     summary: Actualizar gasto
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Gasto actualizado } }
 *   delete:
 *     tags: [Gastos]
 *     summary: Eliminar gasto
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Gasto eliminado } }
 */
router.get('/:id', validateIdParam, getGastoById)
router.get('/', getGastos)
router.post('/', validateGasto, createGasto)
router.put('/:id', validateIdParam, updateGasto)
router.delete('/:id', validateIdParam, deleteGasto)

export default router
