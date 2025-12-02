import { Router } from 'express';
import { 
    getFacturas, 
    getFacturaById, 
    createFactura, 
    updateFactura, 
    deleteFactura 
} from '../controllers/facturaController.js';

const router = Router();

// Obtener todas las facturas
router.get('/', getFacturas);

// Obtener una factura específica por ID
router.get('/:id', getFacturaById);

// Crear nueva factura
router.post('/', createFactura);

// Actualizar factura
router.put('/:id', updateFactura);

// Eliminar factura
router.delete('/:id', deleteFactura);

export default router;