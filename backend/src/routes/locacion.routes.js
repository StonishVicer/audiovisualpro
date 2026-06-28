import { Router } from "express";
import { getLocacionById, getLocaciones, createLocacion, deleteLocacion, updateLocacion } from "../controllers/locacion.controller.js";
import { validateLocacion, validateIdParam } from '../middlewares/validators.js'
import { upload } from '../middlewares/multerConfig.js'

const router = Router()

/**
 * @openapi
 * /api/locacion:
 *   get:
 *     tags: [Locaciones]
 *     summary: Listar todas las locaciones
 *     responses: { 200: { description: Lista de locaciones } }
 *   post:
 *     tags: [Locaciones]
 *     summary: Crear una locación (multipart con imagen opcional)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nombre_locacion]
 *             properties:
 *               nombre_locacion: { type: string }
 *               direccion: { type: string }
 *               descripcion_locacion: { type: string }
 *               imagen: { type: string, format: binary }
 *     responses: { 201: { description: Locación creada } }
 * /api/locacion/{id}:
 *   get:
 *     tags: [Locaciones]
 *     summary: Obtener locación por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Locación } }
 *   put:
 *     tags: [Locaciones]
 *     summary: Actualizar locación
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Locación actualizada } }
 *   delete:
 *     tags: [Locaciones]
 *     summary: Eliminar locación
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Locación eliminada } }
 */
router.post("/", upload.single('imagen'), validateLocacion, createLocacion)
router.get("/", getLocaciones)
router.get("/:id", validateIdParam, getLocacionById)
router.delete("/:id", validateIdParam, deleteLocacion)
router.put('/:id', upload.single('imagen'), validateIdParam, updateLocacion)

export default router
