import { Router } from "express";
import { getProyectoById, getProyectos, createProyecto, deleteProyecto, asignarLocacion, desasignarLocacion } from "../controllers/proyecto.controller.js";

const router = Router()
router.get('/:id', getProyectoById)
router.get('/', getProyectos)
router.post('/', createProyecto)
router.delete('/:id', deleteProyecto)
router.post('/asignarlocacion', asignarLocacion)
router.delete('/desasignarlocacion/:idProyecto/:idLocacion', desasignarLocacion)

export default router
