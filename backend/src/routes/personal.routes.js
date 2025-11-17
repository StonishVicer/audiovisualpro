import { Router } from 'express'
import {
    getPersonal,
    getPersonalById,
    createPersonal,
    updatePersonal,
    deletePersonal
} from '../controllers/personal.controller.js'

const router = Router()

router.get('/', getPersonal)
router.get('/:id', getPersonalById)
router.post('/', createPersonal)
router.put('/:id', updatePersonal)
router.delete('/:id', deletePersonal)

export default router
