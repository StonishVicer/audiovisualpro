import express from 'express'
import { getEstados, createEstado, deleteEstado } from '../controllers/estadosEntregable.controller.js'

const router = express.Router()

router.get('/', getEstados)
router.post('/', createEstado)
router.delete('/:id', deleteEstado)

export default router