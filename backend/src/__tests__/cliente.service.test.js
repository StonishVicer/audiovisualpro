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

const { ClienteService } = await import('../services/clienteService.js')
import { NotFoundError, ConflictError } from '../utils/errors.js'

describe('ClienteService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('findAll', () => {
        it('retorna lista de clientes', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_cliente: 1, nombre_cliente: 'C1' }] })
            const result = await ClienteService.findAll()
            expect(result).toEqual([{ id_cliente: 1, nombre_cliente: 'C1' }])
        })
    })

    describe('findById', () => {
        it('lanza NotFoundError si no existe', async () => {
            mockPool.query.mockResolvedValue({ rows: [] })
            await expect(ClienteService.findById(999)).rejects.toThrow(NotFoundError)
        })
    })

    describe('create', () => {
        it('crea cliente', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_cliente: 1, nombre_cliente: 'Nuevo' }] })
            const result = await ClienteService.create({ rif_cliente: 'J-123', nombre_cliente: 'Nuevo' })
            expect(result.nombre_cliente).toBe('Nuevo')
        })
    })

    describe('update', () => {
        it('bloquea edición si tiene contratos vinculados', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id_cliente: 1 }] })
                .mockResolvedValueOnce({ rows: [{ count: '3' }] })

            await expect(ClienteService.update(1, { nombre_cliente: 'Editado' }))
                .rejects.toThrow(ConflictError)
        })

        it('actualiza si no tiene contratos', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id_cliente: 1 }] })
                .mockResolvedValueOnce({ rows: [{ count: '0' }] })
                .mockResolvedValueOnce({ rows: [{ id_cliente: 1, nombre_cliente: 'Editado' }] })

            const result = await ClienteService.update(1, { nombre_cliente: 'Editado' })
            expect(result.nombre_cliente).toBe('Editado')
        })
    })

    describe('remove', () => {
        it('elimina cliente', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_cliente: 1 }] })
            const result = await ClienteService.remove(1)
            expect(result.message).toContain('eliminado')
        })
    })
})
