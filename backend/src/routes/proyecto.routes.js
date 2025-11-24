import { Router } from "express";
import { getProyectoById, getProyectos, createProyecto, deleteProyecto, asignarLocacion } from "../controllers/proyecto.controller.js";

const router = Router()
router.get('/:id', getProyectoById)
router.get('/', getProyectos)
router.post('/', createProyecto)
router.delete('/:id', deleteProyecto)
router.post('/asignarlocacion', asignarLocacion)

export default router
