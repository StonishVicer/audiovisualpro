import { Router } from "express";
import { getEstadosEntregable, getEstadoEntregableById, createEstadoEntregable, deleteEstadoEntregable, updateEstadoEntregable } from "../controllers/entregables.controller.js";
import { validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getEstadosEntregable)
router.get('/:id', validateIdParam, getEstadoEntregableById)
router.post('/', createEstadoEntregable)
router.delete('/:id', validateIdParam, deleteEstadoEntregable)
router.put('/:id', validateIdParam, updateEstadoEntregable)

export default router
