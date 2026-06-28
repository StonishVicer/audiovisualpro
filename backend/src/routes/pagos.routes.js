import { Router } from 'express'
import { getPagos, getPagoById, createPago, deletePago, updatePago } from '../controllers/gastoController.js'
import { validatePago, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/:id', validateIdParam, getPagoById)
router.get('/', getPagos)
router.post('/', validatePago, createPago)
router.put('/:id', validateIdParam, updatePago)
router.delete('/:id', validateIdParam, deletePago)

export default router
