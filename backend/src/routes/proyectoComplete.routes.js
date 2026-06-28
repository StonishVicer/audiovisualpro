import { Router } from "express";
import { createProyectoCompleto, updateProyectoCompleto } from "../controllers/proyectoComplete.controller.js";

const router = Router()
router.post('/', createProyectoCompleto)
router.put('/:id', updateProyectoCompleto)

export default router
