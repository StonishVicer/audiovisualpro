import { Router } from "express";
import { getEstadosEntregable, getEstadoEntregableById, createEstadoEntregable, deleteEstadoEntregable, updateEstadoEntregable } from "../controllers/entregables.controller.js";

const router = Router()
router.get('/', getEstadosEntregable)
router.get('/:id', getEstadoEntregableById)
router.post('/', createEstadoEntregable)
router.delete('/:id', deleteEstadoEntregable)
router.put('/:id', updateEstadoEntregable)

export default router
