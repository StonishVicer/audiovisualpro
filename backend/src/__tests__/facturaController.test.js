import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockGetAll = jest.fn()
const mockCreate = jest.fn()
const mockDelete = jest.fn()

jest.unstable_mockModule('../services/facturaService.js', () => ({
    FacturaService: {
        getAll: mockGetAll,
        create: mockCreate,
        delete: mockDelete
    }
}))

const { getFacturas, createFactura, deleteFactura } = await import('../controllers/facturaController.js')

import { NotFoundError } from '../utils/errors.js'

describe('Factura Controller', () => {
    let req, res, next

    beforeEach(() => {
        jest.clearAllMocks()
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() }
        next = jest.fn()
    })

    it('getFacturas retorna lista con items', async () => {
        req = {}
        const mockFacturas = [{ id_factura: 1, items: [{ descripcion: 'item1' }] }]
        mockGetAll.mockResolvedValue(mockFacturas)
        await getFacturas(req, res, next)
        expect(res.json).toHaveBeenCalledWith(mockFacturas)
    })

    it('createFactura crea una factura', async () => {
        req = { body: { numero_factura: 'F001', cliente_id: 1, fecha_factura: '2025-01-01', items: [] } }
        const mockFactura = { id_factura: 1, numero_factura: 'F001' }
        mockCreate.mockResolvedValue(mockFactura)
        await createFactura(req, res, next)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(mockFactura)
    })

    it('deleteFactura debe eliminar', async () => {
        req = { params: { id: '1' } }
        mockDelete.mockResolvedValue({ message: 'Factura eliminada correctamente' })
        await deleteFactura(req, res, next)
        expect(res.json).toHaveBeenCalledWith({ message: 'Factura eliminada correctamente' })
    })

    it('deleteFactura llama next con NotFoundError si no existe', async () => {
        req = { params: { id: '999' } }
        mockDelete.mockRejectedValue(new NotFoundError('Factura no encontrada'))
        await deleteFactura(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
    })
})
