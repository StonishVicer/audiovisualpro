import { Router } from 'express'
import { login } from '../controllers/auth.controller.js'
import { validateLogin } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_gestor, pass_gestor]
 *             properties:
 *               usuario_gestor: { type: string }
 *               pass_gestor: { type: string }
 *     responses:
 *       200: { description: Token JWT }
 */
router.post('/login', validateLogin, login)

export default router
