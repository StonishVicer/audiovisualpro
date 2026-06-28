import { Router } from 'express'
import { getGastos, getGastoById, createGasto, deleteGasto, updateGasto } from '../controllers/gastoController.js'
import { validateGasto, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/:id', validateIdParam, getGastoById)
router.get('/', getGastos)
router.post('/', validateGasto, createGasto)
router.put('/:id', validateIdParam, updateGasto)
router.delete('/:id', validateIdParam, deleteGasto)

export default router
