import express from 'express';
import { getFacturas, createFactura, updateFactura, deleteFactura } from '../controllers/facturaController.js';
import { validateFactura, validateIdParam } from '../middlewares/validators.js'

const router = express.Router();

/**
 * @openapi
 * /api/facturas:
 *   get:
 *     tags: [Facturas]
 *     summary: Listar todas las facturas
 *     responses: { 200: { description: Lista de facturas } }
 *   post:
 *     tags: [Facturas]
 *     summary: Crear una factura con items
 *     responses: { 201: { description: Factura creada } }
 */
router.get('/', getFacturas);
router.post('/', validateFactura, createFactura);
router.put('/:id', validateIdParam, updateFactura);
router.delete('/:id', validateIdParam, deleteFactura);

export default router;
