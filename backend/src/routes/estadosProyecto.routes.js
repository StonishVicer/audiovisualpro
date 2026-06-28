import { Router } from "express";
import { getEstadosProyecto, getEstadoProyectoById, createEstadoProyecto, deleteEstadoProyecto, updateEstadoProyecto } from "../controllers/catalogos.controller.js";

const router = Router()
router.get('/', getEstadosProyecto)
router.get('/:id', getEstadoProyectoById)
router.post('/', createEstadoProyecto)
router.delete('/:id', deleteEstadoProyecto)
router.put('/:id', updateEstadoProyecto)

export default router
