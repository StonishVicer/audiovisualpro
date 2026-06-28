import { Router } from "express";
import { getTiposProyecto, getTipoProyectoById, createTipoProyecto, deleteTipoProyecto, updateTipoProyecto } from "../controllers/catalogos.controller.js";
import { validateTipoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/tiposproyecto:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar tipos de proyecto
 *     responses: { 200: { description: Lista de tipos } }
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear tipo de proyecto
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
 * /api/tiposproyecto/{id}:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtener tipo por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Tipo } }
 *   put:
 *     tags: [Catálogos]
 *     summary: Actualizar tipo
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Tipo actualizado } }
 *   delete:
 *     tags: [Catálogos]
 *     summary: Eliminar tipo
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Tipo eliminado } }
 */
router.get('/', getTiposProyecto)
router.get('/:id', validateIdParam, getTipoProyectoById)
router.post('/', validateTipoNombre, createTipoProyecto)
router.put('/:id', validateIdParam, updateTipoProyecto)
router.delete('/:id', validateIdParam, deleteTipoProyecto)

export default router
