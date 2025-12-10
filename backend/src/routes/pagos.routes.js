import { Router } from 'express'
import { 
    getPagos, 
    createPago, 
    updatePago, 
    deletePago,
    getPagoById 
} from '../controllers/pagosController.js' // Asegúrate que la ruta al controlador sea correcta

const router = Router()

// ERROR COMÚN: No pongas '/pagos_personal' aquí. Pon solo '/'.
// Ya definiste el prefijo '/api/pagos_personal' en tu app.js

// Obtener todos los pagos -> GET /api/pagos_personal
router.get('/', getPagos)

// Crear pago -> POST /api/pagos_personal
router.post('/', createPago)

// Obtener un pago -> GET /api/pagos_personal/:id
router.get('/:id', getPagoById)

// Actualizar -> PUT /api/pagos_personal/:id
router.put('/:id', updatePago)

// Eliminar -> DELETE /api/pagos_personal/:id
router.delete('/:id', deletePago)

export default router