import { Router } from 'express'
import { getContratos, getContratoById, createContrato, updateContrato, deleteContrato } from '../controllers/contratos.controller.js'
import { validateContrato, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getContratos)
router.get('/:id', validateIdParam, getContratoById)
router.post('/', validateContrato, createContrato)
router.put('/:id', validateIdParam, updateContrato)
router.delete('/:id', validateIdParam, deleteContrato)

export default router
