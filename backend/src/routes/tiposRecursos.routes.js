import { Router } from "express";
import { getTiposRecursos, getTipoRecursoById, createTipoRecurso, deleteTipoRecurso, updateTipoRecurso } from "../controllers/locacion.controller.js";
import { validateTipoRecursoNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getTiposRecursos)
router.get('/:id', validateIdParam, getTipoRecursoById)
router.post('/', validateTipoRecursoNombre, createTipoRecurso)
router.delete('/:id', validateIdParam, deleteTipoRecurso)
router.put('/:id', validateIdParam, updateTipoRecurso)

export default router
