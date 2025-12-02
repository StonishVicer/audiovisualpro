import { Router } from 'express';
import { 
    getGastos, 
    getCategoriasGasto, 
    createGasto, 
    updateGasto, 
    deleteGasto 
} from '../controllers/gastoController.js';

const router = Router();

router.get('/', getGastos);
router.get('/categorias', getCategoriasGasto); // Ruta especial para el select
router.post('/', createGasto);
router.put('/:id', updateGasto);
router.delete('/:id', deleteGasto);

export default router;