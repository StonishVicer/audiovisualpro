import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockClient = {
    query: jest.fn(),
    release: jest.fn()
}

const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    query: jest.fn()
}

jest.unstable_mockModule('../config/database.js', () => ({
    pool: mockPool
}))

const { FacturaService } = await import('../services/facturaService.js')
import { NotFoundError, ValidationError } from '../utils/errors.js'

describe('FacturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPool.connect.mockResolvedValue(mockClient)
    })

    describe('getAll', () => {
        it('retorna facturas con items', async () => {
            mockPool.query.mockImplementation((sql) => {
                if (sql.includes('ORDER BY f.fecha_factura')) {
                    return Promise.resolve({ rows: [{ id_factura: 1, nombre_cliente: 'C1' }] })
                }
                return Promise.resolve({ rows: [{ item_id: 1, descripcion: 'item1' }] })
            })

            const result = await FacturaService.getAll()
            expect(result).toHaveLength(1)
            expect(result[0].items).toHaveLength(1)
        })
    })

    describe('create', () => {
        it('valida campos obligatorios', async () => {
            await expect(FacturaService.create({}))
                .rejects.toThrow(ValidationError)
        })

        it('crea factura con items en transacción', async () => {
            const facturaInsert = { rows: [{ id_factura: 1 }] }
            mockClient.query.mockImplementation((sql) => {
                if (sql.includes('INSERT INTO facturas')) return Promise.resolve(facturaInsert)
                if (sql.includes('COMMIT')) return Promise.resolve()
                return Promise.resolve({ rows: [] })
            })

            const result = await FacturaService.create({
                numero_factura: 'F001',
                fecha_factura: '2025-01-01',
                cliente_id: 1,
                items: [{ descripcion: 'Servicio', cantidad: 1, precio_unitario: 100 }]
            })

            expect(result.id_factura).toBe(1)
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
        })

        it('hace ROLLBACK en error', async () => {
            mockClient.query.mockImplementation((sql) => {
                if (sql === 'BEGIN') return Promise.resolve()
                throw new Error('DB error')
            })

            await expect(FacturaService.create({
                numero_factura: 'F001',
                fecha_factura: '2025-01-01',
                cliente_id: 1
            })).rejects.toThrow('DB error')

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
            expect(mockClient.release).toHaveBeenCalled()
        })
    })

    describe('delete', () => {
        it('elimina factura con items', async () => {
            mockClient.query.mockImplementation((sql) => {
                if (sql.includes('DELETE FROM facturas')) {
                    return Promise.resolve({ rows: [{ id_factura: 1 }] })
                }
                return Promise.resolve({ rows: [] })
            })

            const result = await FacturaService.delete(1)
            expect(result.message).toContain('eliminada')
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
        })

        it('lanza NotFoundError si no existe', async () => {
            mockClient.query.mockImplementation((sql) => {
                if (sql.includes('DELETE FROM facturas')) {
                    return Promise.resolve({ rows: [] })
                }
                return Promise.resolve({ rows: [] })
            })

            await expect(FacturaService.delete(999)).rejects.toThrow(NotFoundError)
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
        })
    })
})
