import { Router } from 'express'
import { 
    getPagos, 
    createPago, 
    updatePago, 
    deletePago,
    getPagoById 
} from '../controllers/pagosController.js'

const router = Router()


router.get('/pagos_personal', getPagos)


router.get('/pagos_personal/:id', getPagoById)


router.post('/pagos_personal', createPago)

// Actualizar un pago -> PUT /api/pagos_personal/:id
router.put('/pagos_personal/:id', updatePago)

// Eliminar un pago -> DELETE /api/pagos_personal/:id
router.delete('/pagos_personal/:id', deletePago)

export default router