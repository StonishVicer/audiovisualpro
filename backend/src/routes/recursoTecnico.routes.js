import { Router } from "express";
import { getRecursoTecnicoById, getRecursosTecnicos, createRecursoTecnico, deleteRecursoTecnico, updateRecursoTecnico } from "../controllers/locacion.controller.js";
import { validateRecursoTecnico, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/:id', validateIdParam, getRecursoTecnicoById)
router.get('/', getRecursosTecnicos)
router.post('/', validateRecursoTecnico, createRecursoTecnico)
router.delete('/:id', validateIdParam, deleteRecursoTecnico)
router.put('/:id', validateIdParam, updateRecursoTecnico)

export default router
