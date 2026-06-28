import { Router } from 'express'
import {
    getAsignacionesPersonal,
    getAsignacionPersonalById,
    createAsignacionPersonal,
    updateAsignacionPersonal,
    deleteAsignacionPersonal,
    getAsignacionesPorProyecto
} from '../controllers/asignacionpersonal.controller.js'

const router = Router()

// GET /api/asignaciones
router.get('/', getAsignacionesPersonal)

// GET /api/asignaciones/proyecto/:idProyecto
router.get('/proyecto/:idProyecto', getAsignacionesPorProyecto)

// GET /api/asignaciones/:id
router.get('/:id', getAsignacionPersonalById)

// POST /api/asignaciones
router.post('/', createAsignacionPersonal)

// PUT /api/asignaciones/:id
router.put('/:id', updateAsignacionPersonal)

// DELETE /api/asignaciones/:id
router.delete('/:id', deleteAsignacionPersonal)

export default router
