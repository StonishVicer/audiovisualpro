import { Router } from 'express'
import { getCategoriaGastoByID, getCategoriaGasto, createCategoriaGasto, deleteCategoriaGasto, editCategoriaGasto } from '../controllers/categoriasGasto.controller.js'

const router = Router()
router.get('/:id', getCategoriaGastoByID)
router.get('/', getCategoriaGasto)
router.post('/', createCategoriaGasto)
router.delete('/:id', deleteCategoriaGasto)
router.put('/:id', editCategoriaGasto)

export default router