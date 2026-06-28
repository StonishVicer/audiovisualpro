import { Router } from 'express'
import { healthcheck } from '../controllers/health.controller.js'

const router = Router()

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verificar estado del servidor y conexión a BD
 *     responses:
 *       200:
 *         description: Servidor y BD operativos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 database: { type: string, example: connected }
 *                 uptime: { type: number }
 *       503:
 *         description: Servicio degradado (BD no disponible)
 */
router.get('/', healthcheck)

export default router
