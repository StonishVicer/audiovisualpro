import { Router } from "express";
import { getRolesPersonal, getRolPersonalById, createRolPersonal, deleteRolPersonal, updateRolPersonal } from "../controllers/catalogos.controller.js";
import { validateRolNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/roles_personal:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar roles de personal
 *     responses: { 200: { description: Lista de roles } }
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear rol de personal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_rol]
 *             properties:
 *               nombre_rol: { type: string }
 *     responses: { 201: { description: Rol creado } }
 */
router.get('/', getRolesPersonal)
router.get('/:id', validateIdParam, getRolPersonalById)
router.post('/', validateRolNombre, createRolPersonal)
router.delete('/:id', validateIdParam, deleteRolPersonal)
router.put('/:id', validateIdParam, updateRolPersonal)

export default router
