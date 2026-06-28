import { Router } from "express";
import { getTiposRecursos, getTipoRecursoById, createTipoRecurso, deleteTipoRecurso, updateTipoRecurso } from "../controllers/locacion.controller.js";

const router = Router()
router.get('/', getTiposRecursos)
router.get('/:id', getTipoRecursoById)
router.post('/', createTipoRecurso)
router.delete('/:id', deleteTipoRecurso)
router.put('/:id', updateTipoRecurso)

export default router
