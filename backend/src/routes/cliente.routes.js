import { Router } from 'express'
import { createCliente, getClientes, getClienteById, deleteCliente, updateCliente } from '../controllers/cliente.controller.js'

const router = Router()
router.post('/', createCliente)
router.get('/', getClientes)
router.get('/:id', getClienteById)
router.delete('/:id', deleteCliente)
router.put('/:id', updateCliente)

export default router