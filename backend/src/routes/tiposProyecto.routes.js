import { Router } from "express";
import { getTiposProyecto, getTipoProyectoById, createTipoProyecto, deleteTipoProyecto, updateTipoProyecto } from "../controllers/catalogos.controller.js";
import { validateTipoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getTiposProyecto)
router.get('/:id', validateIdParam, getTipoProyectoById)
router.post('/', validateTipoNombre, createTipoProyecto)
router.put('/:id', validateIdParam, updateTipoProyecto)
router.delete('/:id', validateIdParam, deleteTipoProyecto)

export default router
