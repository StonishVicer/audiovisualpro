import { Router } from "express";
import { getProyectoById, getProyectos, createProyecto, deleteProyecto, asignarLocacion, desasignarLocacion, asignarRecurso, desasignarRecurso, getAsignacionesProyecto } from "../controllers/proyecto.controller.js";

const router = Router()
router.get('/:id/asignaciones', getAsignacionesProyecto)
router.get('/:id', getProyectoById)
router.get('/', getProyectos)
router.post('/', createProyecto)
router.delete('/:id', deleteProyecto)
router.post('/asignarlocacion', asignarLocacion)
router.delete('/desasignarlocacion/:idProyecto/:idLocacion', desasignarLocacion)
router.post('/asignarrecurso', asignarRecurso)
router.delete('/desasignarrecurso/:idProyecto/:idRecurso', desasignarRecurso)

export default router
