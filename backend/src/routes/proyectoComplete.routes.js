import { Router } from "express";
import { createProyectoCompleto, updateProyectoCompleto } from "../controllers/proyectoComplete.controller.js";
import { validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/proyectos/complete:
 *   post:
 *     tags: [Proyectos]
 *     summary: Crear proyecto completo con cliente, locaciones, recursos, personal y contrato (transaccional)
 *     responses: { 201: { description: Proyecto completo creado } }
 * /api/proyectos/complete/{id}:
 *   put:
 *     tags: [Proyectos]
 *     summary: Actualizar proyecto completo con todas sus relaciones (transaccional)
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Proyecto completo actualizado } }
 */
router.post('/', createProyectoCompleto)
router.put('/:id', validateIdParam, updateProyectoCompleto)

export default router
