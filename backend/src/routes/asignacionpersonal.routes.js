import { Router } from 'express'
import { getAsignacionesPersonal, getAsignacionPersonalById, createAsignacionPersonal, updateAsignacionPersonal, deleteAsignacionPersonal, getAsignacionesPorProyecto } from '../controllers/asignacionpersonal.controller.js'
import { validateAsignacionPersonal, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/asignaciones:
 *   get:
 *     tags: [Asignaciones]
 *     summary: Listar todas las asignaciones de personal
 *     responses: { 200: { description: Lista de asignaciones } }
 *   post:
 *     tags: [Asignaciones]
 *     summary: Asignar personal a proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_proyecto, id_personal]
 *             properties:
 *               id_proyecto: { type: integer }
 *               id_personal: { type: integer }
 *               horas_trabajadas: { type: number }
 *     responses: { 201: { description: Asignación creada } }
 * /api/asignaciones/{id}:
 *   get:
 *     tags: [Asignaciones]
 *     summary: Obtener asignación por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Asignación } }
 *   put:
 *     tags: [Asignaciones]
 *     summary: Actualizar asignación
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Asignación actualizada } }
 *   delete:
 *     tags: [Asignaciones]
 *     summary: Eliminar asignación
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Asignación eliminada } }
 * /api/asignaciones/proyecto/{idProyecto}:
 *   get:
 *     tags: [Asignaciones]
 *     summary: Listar asignaciones por proyecto
 *     parameters: [{ name: idProyecto, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Lista de asignaciones del proyecto } }
 */
router.get('/', getAsignacionesPersonal)
router.get('/proyecto/:idProyecto', getAsignacionesPorProyecto)
router.get('/:id', validateIdParam, getAsignacionPersonalById)
router.post('/', validateAsignacionPersonal, createAsignacionPersonal)
router.put('/:id', validateIdParam, updateAsignacionPersonal)
router.delete('/:id', validateIdParam, deleteAsignacionPersonal)

export default router
