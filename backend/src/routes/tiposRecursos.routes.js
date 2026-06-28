import { Router } from "express";
import { getTiposRecursos, getTipoRecursoById, createTipoRecurso, deleteTipoRecurso, updateTipoRecurso } from "../controllers/locacion.controller.js";
import { validateTipoRecursoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/tiposrecursos:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar tipos de recurso
 *     responses: { 200: { description: Lista de tipos } }
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear tipo de recurso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_tipo]
 *             properties:
 *               nombre_tipo: { type: string }
 *     responses: { 201: { description: Tipo creado } }
 */
router.get('/', getTiposRecursos)
router.get('/:id', validateIdParam, getTipoRecursoById)
router.post('/', validateTipoRecursoNombre, createTipoRecurso)
router.delete('/:id', validateIdParam, deleteTipoRecurso)
router.put('/:id', validateIdParam, updateTipoRecurso)

export default router
