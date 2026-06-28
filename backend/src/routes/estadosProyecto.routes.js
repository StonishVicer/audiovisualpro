import { Router } from "express";
import { getEstadosProyecto, getEstadoProyectoById, createEstadoProyecto, deleteEstadoProyecto, updateEstadoProyecto } from "../controllers/catalogos.controller.js";
import { validateEstadoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getEstadosProyecto)
router.get('/:id', validateIdParam, getEstadoProyectoById)
router.post('/', validateEstadoNombre, createEstadoProyecto)
router.delete('/:id', validateIdParam, deleteEstadoProyecto)
router.put('/:id', validateIdParam, updateEstadoProyecto)

export default router
