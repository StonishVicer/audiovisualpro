import { Router } from 'express'
import { getGastos, getGastoById, createGasto, deleteGasto, updateGasto } from '../controllers/gastoController.js'

const router = Router()
router.get('/:id', getGastoById)
router.get('/', getGastos)
router.post('/', createGasto)
router.put('/:id', updateGasto)
router.delete('/:id', deleteGasto)

export default router
