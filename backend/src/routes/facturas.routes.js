import express from 'express';
import { 
    getFacturas, 
    createFactura, 
    updateFactura, 
    deleteFactura 
} from '../controllers/facturaController.js';

const router = express.Router();

router.get('/', getFacturas);
router.post('/', createFactura);
router.put('/:id', updateFactura);
router.delete('/:id', deleteFactura);

export default router;