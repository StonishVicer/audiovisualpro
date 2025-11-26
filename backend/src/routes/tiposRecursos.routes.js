import { Router } from "express";
import { createTipoRecurso, getTiposRecurso, getTipoRecursoById, deleteTipoRecurso } from "../controllers/tiposRecursos.controller.js";

const router = Router()
router.post('/', createTipoRecurso)
router.get('/', getTiposRecurso)
router.get('/:id', getTipoRecursoById)
router.delete('/:id', deleteTipoRecurso)

export default router
