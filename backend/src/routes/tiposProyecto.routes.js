import { Router } from "express";
import { getTiposProyecto, getTipoProyectoById, createTipoProyecto, deleteTipoProyecto } from "../controllers/catalogos.controller.js";

const router = Router()
router.get('/', getTiposProyecto)
router.get('/:id', getTipoProyectoById)
router.post('/', createTipoProyecto)
router.delete('/:id', deleteTipoProyecto)

export default router
