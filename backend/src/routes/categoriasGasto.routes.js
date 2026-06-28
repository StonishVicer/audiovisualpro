import { Router } from 'express'
import { getCategoriaGastoByID, getCategoriaGasto, createCategoriaGasto, deleteCategoriaGasto, editCategoriaGasto } from '../controllers/categoriasGasto.controller.js'
import { validateCategoriaNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/categoriasgasto:
 *   get:
 *     tags: [Categorías de Gasto]
 *     summary: Listar todas las categorías de gasto
 *     responses: { 200: { description: Lista de categorías } }
 *   post:
 *     tags: [Categorías de Gasto]
 *     summary: Crear una categoría de gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_categoria]
 *             properties:
 *               nombre_categoria: { type: string }
 *     responses: { 201: { description: Categoría creada } }
 * /api/categoriasgasto/{id}:
 *   get:
 *     tags: [Categorías de Gasto]
 *     summary: Obtener categoría por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Categoría } }
 *   put:
 *     tags: [Categorías de Gasto]
 *     summary: Actualizar categoría
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Categoría actualizada } }
 *   delete:
 *     tags: [Categorías de Gasto]
 *     summary: Eliminar categoría
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Categoría eliminada } }
 */
router.get('/:id', validateIdParam, getCategoriaGastoByID)
router.get('/', getCategoriaGasto)
router.post('/', validateCategoriaNombre, createCategoriaGasto)
router.delete('/:id', validateIdParam, deleteCategoriaGasto)
router.put('/:id', validateIdParam, editCategoriaGasto)

export default router
