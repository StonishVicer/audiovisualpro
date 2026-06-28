import { Router } from "express";
import { getRolesPersonal, getRolPersonalById, createRolPersonal, deleteRolPersonal, updateRolPersonal } from "../controllers/catalogos.controller.js";

const router = Router()
router.get('/', getRolesPersonal)
router.get('/:id', getRolPersonalById)
router.post('/', createRolPersonal)
router.delete('/:id', deleteRolPersonal)
router.put('/:id', updateRolPersonal)

export default router
