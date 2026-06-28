import { Router } from 'express'
import { getPersonal, getPersonalById, createPersonal, updatePersonal, deletePersonal } from '../controllers/personal.controller.js'
import { validatePersonal, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/personal:
 *   get:
 *     tags: [Personal]
 *     summary: Listar todo el personal
 *     responses: { 200: { description: Lista de personal con roles } }
 *   post:
 *     tags: [Personal]
 *     summary: Registrar personal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_personal]
 *             properties:
 *               nombre_personal: { type: string }
 *               cedula_personal: { type: string }
 *               id_rol: { type: integer }
 *               salario: { type: number }
 *               email_personal: { type: string }
 *               telefono: { type: string }
 *     responses: { 201: { description: Personal creado } }
 * /api/personal/{id}:
 *   get:
 *     tags: [Personal]
 *     summary: Obtener personal por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Personal } }
 *   put:
 *     tags: [Personal]
 *     summary: Actualizar personal
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Personal actualizado } }
 *   delete:
 *     tags: [Personal]
 *     summary: Eliminar personal
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Personal eliminado } }
 */
router.get('/', getPersonal)
router.get('/:id', validateIdParam, getPersonalById)
router.post('/', validatePersonal, createPersonal)
router.put('/:id', validateIdParam, updatePersonal)
router.delete('/:id', validateIdParam, deletePersonal)

export default router
