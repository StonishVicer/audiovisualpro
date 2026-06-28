import { Router } from 'express'
import { getCategoriaGastoByID, getCategoriaGasto, createCategoriaGasto, deleteCategoriaGasto, editCategoriaGasto } from '../controllers/categoriasGasto.controller.js'
import { validateCategoriaNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/:id', validateIdParam, getCategoriaGastoByID)
router.get('/', getCategoriaGasto)
router.post('/', validateCategoriaNombre, createCategoriaGasto)
router.delete('/:id', validateIdParam, deleteCategoriaGasto)
router.put('/:id', validateIdParam, editCategoriaGasto)

export default router
