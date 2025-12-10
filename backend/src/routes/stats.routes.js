import { Router } from 'express';
import { getFinanceStats } from '../controllers/statsController.js';

const router = Router();

router.get('/finance', getFinanceStats);

export default router;
