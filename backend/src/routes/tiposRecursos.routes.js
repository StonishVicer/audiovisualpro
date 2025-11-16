import { Router } from "express";
import { createTipoRecurso } from "../controllers/tiposRecursos.controller.js";
import { getTiposProyecto } from "../controllers/tiposProyecto.controller.js";

const router = Router()
router.post('/', createTipoRecurso)
router.get('/', getTiposProyecto)

export default router
