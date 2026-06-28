import { Router } from 'express'
import {
    getContratos,
    getContratoById,
    createContrato,
    updateContrato,
    deleteContrato
} from '../controllers/contratos.controller.js'

const router = Router()
router.get('/', getContratos)
router.get('/:id', getContratoById)
router.post('/', createContrato)
router.put('/:id', updateContrato)
router.delete('/:id', deleteContrato)

export default router
