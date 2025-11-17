import { Router } from 'express'
import { createCliente, getClientes, getClienteById, deleteCliente } from '../controllers/cliente.controller.js'

const router = Router()
router.post('/', createCliente)
router.get('/', getClientes)
router.get('/:id', getClienteById)
router.delete('/:id', deleteCliente)

export default router