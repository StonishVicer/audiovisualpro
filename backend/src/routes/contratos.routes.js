import { Router } from 'express'
import { getContratos, getContratoById, createContrato, updateContrato, deleteContrato } from '../controllers/contratos.controller.js'
import { validateContrato, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/contratos:
 *   get:
 *     tags: [Contratos]
 *     summary: Listar todos los contratos
 *     responses: { 200: { description: Lista de contratos con cliente y proyecto } }
 *   post:
 *     tags: [Contratos]
 *     summary: Crear un contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_proyecto, id_cliente, fecha_firma, monto_contrato]
 *             properties:
 *               id_proyecto: { type: integer }
 *               id_cliente: { type: integer }
 *               fecha_firma: { type: string, format: date }
 *               monto_contrato: { type: number }
 *               descripcion_servicios: { type: string }
 *     responses: { 201: { description: Contrato creado } }
 * /api/contratos/{id}:
 *   get:
 *     tags: [Contratos]
 *     summary: Obtener contrato por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Contrato } }
 *   put:
 *     tags: [Contratos]
 *     summary: Actualizar contrato
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Contrato actualizado } }
 *   delete:
 *     tags: [Contratos]
 *     summary: Eliminar contrato
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Contrato eliminado } }
 */
router.get('/', getContratos)
router.get('/:id', validateIdParam, getContratoById)
router.post('/', validateContrato, createContrato)
router.put('/:id', validateIdParam, updateContrato)
router.delete('/:id', validateIdParam, deleteContrato)

export default router
