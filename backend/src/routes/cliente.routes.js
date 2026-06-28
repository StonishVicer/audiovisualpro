import { Router } from 'express'
import { createCliente, getClientes, getClienteById, deleteCliente, updateCliente } from '../controllers/cliente.controller.js'
import { validateCliente, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar todos los clientes
 *     responses: { 200: { description: Lista de clientes } }
 *   post:
 *     tags: [Clientes]
 *     summary: Crear un cliente
 *     responses: { 201: { description: Cliente creado } }
 */
router.get('/', getClientes)
router.post('/', validateCliente, createCliente)
router.get('/:id', validateIdParam, getClienteById)
router.delete('/:id', validateIdParam, deleteCliente)
router.put('/:id', validateIdParam, updateCliente)

export default router
