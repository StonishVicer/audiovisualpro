import { Router } from 'express'
import { getPagos, getPagoById, createPago, deletePago, updatePago } from '../controllers/gastoController.js'

const router = Router()
router.get('/:id', getPagoById)
router.get('/', getPagos)
router.post('/', createPago)
router.put('/:id', updatePago)
router.delete('/:id', deletePago)

export default router
