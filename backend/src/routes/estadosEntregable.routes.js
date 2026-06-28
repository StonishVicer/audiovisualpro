import { Router } from "express";
import { getEstadosEntregable, getEstadoEntregableById, createEstadoEntregable, deleteEstadoEntregable, updateEstadoEntregable } from "../controllers/entregables.controller.js";
import { validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/estadosentregable:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar estados de entregable
 *     responses: { 200: { description: Lista de estados } }
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear estado de entregable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_estado: { type: string }
 *     responses: { 201: { description: Estado creado } }
 */
router.get('/', getEstadosEntregable)
router.get('/:id', validateIdParam, getEstadoEntregableById)
router.post('/', createEstadoEntregable)
router.delete('/:id', validateIdParam, deleteEstadoEntregable)
router.put('/:id', validateIdParam, updateEstadoEntregable)

export default router
