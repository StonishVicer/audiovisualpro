import { Router } from "express";
import { getFinanceStats } from "../controllers/catalogos.controller.js";

const router = Router()

/**
 * @openapi
 * /api/stats/finance:
 *   get:
 *     tags: [Stats]
 *     summary: Obtener estadísticas financieras
 *     responses: { 200: { description: Estadísticas } }
 */
router.get('/finance', getFinanceStats)

export default router
