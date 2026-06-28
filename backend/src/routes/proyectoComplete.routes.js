import { Router } from "express";
import { createProyectoCompleto, updateProyectoCompleto } from "../controllers/proyectoComplete.controller.js";
import { validateIdParam } from '../middlewares/validators.js'

const router = Router()

router.post('/', createProyectoCompleto)
router.put('/:id', validateIdParam, updateProyectoCompleto)

export default router
