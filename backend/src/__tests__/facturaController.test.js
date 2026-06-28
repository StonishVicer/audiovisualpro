import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockClient = { query: jest.fn(), release: jest.fn() };
const mockPool = { query: jest.fn(), connect: jest.fn().mockResolvedValue(mockClient) };

jest.unstable_mockModule('../config/database.js', () => ({ pool: mockPool }));

const { getFacturas, createFactura, updateFactura, deleteFactura } = await import('../controllers/facturaController.js');

describe('Factura Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        jest.clearAllMocks();
    });

    it('getFacturas debe retornar lista', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [{ id_factura: 1, numero_factura: 'F-001' }] });
        mockPool.query.mockResolvedValueOnce({ rows: [] });
        await getFacturas(req, res);
        const facturas = res.json.mock.calls[0][0];
        expect(facturas).toHaveLength(1);
        expect(facturas[0].items).toEqual([]);
    });

    it('createFactura debe crear con transacción', async () => {
        req.body = { numero_factura: 'F-001', fecha_factura: '2026-01-15', cliente_id: '1', items: [{ descripcion: 'S', cantidad: 1, precio_unitario: 100 }], subtotal: '100', total: '100', estado: 'PAGADA' };
        mockClient.query.mockImplementation((sql) => {
            if (sql === 'BEGIN') return Promise.resolve();
            if (sql === 'COMMIT') return Promise.resolve();
            if (sql.includes('INSERT INTO facturas')) return Promise.resolve({ rows: [{ id_factura: 1 }] });
            if (sql.includes('INSERT INTO factura_items')) return Promise.resolve({ rows: [{ id_item: 1 }] });
            return Promise.resolve({ rows: [] });
        });
        await createFactura(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deleteFactura debe eliminar', async () => {
        req.params = { id: '1' };
        mockClient.query.mockImplementation((sql) => {
            if (sql === 'BEGIN') return Promise.resolve();
            if (sql === 'COMMIT') return Promise.resolve();
            if (sql.includes('DELETE FROM factura_items')) return Promise.resolve({ rows: [] });
            if (sql.includes('DELETE FROM facturas')) return Promise.resolve({ rows: [{ id_factura: 1 }] });
            return Promise.resolve({ rows: [] });
        });
        await deleteFactura(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Eliminada correctamente' });
    });
});
