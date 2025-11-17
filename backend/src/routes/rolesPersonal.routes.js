import { Router } from 'express'
import {
    getRolesPersonal,
    getRolPersonalById,
    createRolPersonal,
    updateRolPersonal,
    deleteRolPersonal
} from '../controllers/rolespersonal.controller.js'

const router = Router()

router.get('/', getRolesPersonal)
router.get('/:id', getRolPersonalById)
router.post('/', createRolPersonal)
router.put('/:id', updateRolPersonal)
router.delete('/:id', deleteRolPersonal)

export default router
