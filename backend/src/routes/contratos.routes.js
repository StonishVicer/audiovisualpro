import { Router } from 'express'
import { 
    getContratos, 
    getContratoById, 
    createContrato
} from '../controllers/contratos.controller.js'

const router = Router()
router.get('/', getContratos)
router.get('/:id', getContratoById)
router.post('/', createContrato)

export default router