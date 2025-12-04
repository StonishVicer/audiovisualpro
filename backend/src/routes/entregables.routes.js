import { Router } from 'express'
import { getEntregables } from '../controllers/entregables.controller.js'

const router = Router()
router.get('/', getEntregables)

export default router