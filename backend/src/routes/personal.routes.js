import { Router } from 'express'
import { getPersonal, getPersonalById, createPersonal, updatePersonal, deletePersonal } from '../controllers/personal.controller.js'
import { validatePersonal, validateIdParam } from '../middlewares/validators.js'

const router = Router()

router.get('/', getPersonal)
router.get('/:id', validateIdParam, getPersonalById)
router.post('/', validatePersonal, createPersonal)
router.put('/:id', validateIdParam, updatePersonal)
router.delete('/:id', validateIdParam, deletePersonal)

export default router
