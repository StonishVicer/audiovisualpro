import { Router } from "express";
import { getRecursoTecnicoById, getRecursosTecnicos, createRecursoTecnico, deleteRecursoTecnico, updateRecursoTecnico } from "../controllers/locacion.controller.js";
import { validateRecursoTecnico, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/recursostecnicos:
 *   get:
 *     tags: [Recursos Técnicos]
 *     summary: Listar todos los recursos técnicos
 *     responses: { 200: { description: Lista de recursos } }
 *   post:
 *     tags: [Recursos Técnicos]
 *     summary: Crear un recurso técnico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_equipo, id_tipo_recurso]
 *             properties:
 *               nombre_equipo: { type: string }
 *               id_tipo_recurso: { type: integer }
 *     responses: { 201: { description: Recurso creado } }
 * /api/recursostecnicos/{id}:
 *   get:
 *     tags: [Recursos Técnicos]
 *     summary: Obtener recurso por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Recurso } }
 *   put:
 *     tags: [Recursos Técnicos]
 *     summary: Actualizar recurso
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Recurso actualizado } }
 *   delete:
 *     tags: [Recursos Técnicos]
 *     summary: Eliminar recurso
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Recurso eliminado } }
 */
router.get('/:id', validateIdParam, getRecursoTecnicoById)
router.get('/', getRecursosTecnicos)
router.post('/', validateRecursoTecnico, createRecursoTecnico)
router.delete('/:id', validateIdParam, deleteRecursoTecnico)
router.put('/:id', validateIdParam, updateRecursoTecnico)

export default router
