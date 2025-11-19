import { Router } from "express";
import { getProyectoById, getProyectos, createProyecto, deleteProyecto } from "../controllers/proyecto.controller.js";

const router = Router()
router.get('/:id', getProyectoById)
router.get('/', getProyectos)
router.post('/', createProyecto)
router.delete('/:id', deleteProyecto)

export default router