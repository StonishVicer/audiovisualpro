import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockPool = { query: jest.fn() };
jest.unstable_mockModule('../config/database.js', () => ({ pool: mockPool }));

const { getProyectos, createProyecto, deleteProyecto } = await import('../controllers/proyecto.controller.js');

describe('Proyecto Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        jest.clearAllMocks();
    });

    it('getProyectos retorna lista', async () => {
        mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1, nombre_proyecto: 'P1' }] });
        await getProyectos(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getProyectos retorna vacío', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });
        await getProyectos(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('createProyecto crea proyecto', async () => {
        req.body = { nombre_proyecto: 'Nuevo', id_tipo_proyecto: 1, id_estado_proyecto: 1, fecha_inicio: '2026-01-01', fecha_fin_estimada: '2026-06-01', presupuesto: 5000 };
        mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1 }] });
        await createProyecto(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deleteProyecto elimina', async () => {
        req.params = { id: '1' };
        mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1 }] });
        await deleteProyecto(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Proyecto eliminado correctamente' });
    });

    it('deleteProyecto 404', async () => {
        req.params = { id: '999' };
        mockPool.query.mockResolvedValue({ rows: [] });
        await deleteProyecto(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
