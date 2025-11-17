import { Router } from 'express'
import { getEstadoProyectoById, getEstadosProyecto, createEstadoProyecto, deleteEstadoProyecto } from '../controllers/estadosProyecto.controller.js'

const router = Router()
router.post('/', createEstadoProyecto)
router.get('/', getEstadosProyecto)
router.get('/:id', getEstadoProyectoById)
router.delete('/:id', deleteEstadoProyecto)

export default router