import { Router } from "express";
import { getRolesPersonal, getRolPersonalById, createRolPersonal, deleteRolPersonal, updateRolPersonal } from "../controllers/catalogos.controller.js";
import { validateRolNombre, validateIdParam } from '../middlewares/validators.js'

const router = Router()
router.get('/', getRolesPersonal)
router.get('/:id', validateIdParam, getRolPersonalById)
router.post('/', validateRolNombre, createRolPersonal)
router.delete('/:id', validateIdParam, deleteRolPersonal)
router.put('/:id', validateIdParam, updateRolPersonal)

export default router
