import { Router } from "express";
import { getRecursoTecnicoById, getRecursosTecnicos, createRecursoTecnico, deleteRecursoTecnico } from "../controllers/recursoTecnico.controller.js";

const router = Router()
router.get('/:id', getRecursoTecnicoById)
router.get('/', getRecursosTecnicos)
router.post('/', createRecursoTecnico)
router.delete('/:id', deleteRecursoTecnico)

export default router
