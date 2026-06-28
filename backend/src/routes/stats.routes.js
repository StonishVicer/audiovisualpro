import { Router } from "express";
import { getFinanceStats } from "../controllers/catalogos.controller.js";

const router = Router()
router.get('/finance', getFinanceStats)

export default router
