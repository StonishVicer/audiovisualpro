import { Router } from "express";
import { getEstadosProyecto, getEstadoProyectoById, createEstadoProyecto, deleteEstadoProyecto, updateEstadoProyecto } from "../controllers/catalogos.controller.js";
import { validateEstadoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/estadosproyecto:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar estados de proyecto
 *     responses: { 200: { description: Lista de estados } }
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear estado de proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_estado]
 *             properties:
 *               nombre_estado: { type: string }
 *     responses: { 201: { description: Estado creado } }
 */
router.get('/', getEstadosProyecto)
router.get('/:id', validateIdParam, getEstadoProyectoById)
router.post('/', validateEstadoNombre, createEstadoProyecto)
router.delete('/:id', validateIdParam, deleteEstadoProyecto)
router.put('/:id', validateIdParam, updateEstadoProyecto)

export default router
