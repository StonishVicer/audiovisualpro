import { Router } from 'express'
import { getAsignacionesPersonal, getAsignacionPersonalById, createAsignacionPersonal, updateAsignacionPersonal, deleteAsignacionPersonal, getAsignacionesPorProyecto } from '../controllers/asignacionpersonal.controller.js'
import { validateAsignacionPersonal, validateIdParam } from '../middlewares/validators.js'

const router = Router()

router.get('/', getAsignacionesPersonal)
router.get('/proyecto/:idProyecto', getAsignacionesPorProyecto)
router.get('/:id', validateIdParam, getAsignacionPersonalById)
router.post('/', validateAsignacionPersonal, createAsignacionPersonal)
router.put('/:id', validateIdParam, updateAsignacionPersonal)
router.delete('/:id', validateIdParam, deleteAsignacionPersonal)

export default router
