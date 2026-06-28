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

const { ProyectoService } = await import('../services/proyectoService.js')
import { NotFoundError, ValidationError } from '../utils/errors.js'

describe('ProyectoService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPool.connect.mockResolvedValue(mockClient)
    })

    describe('findAll', () => {
        it('retorna lista de proyectos', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1, nombre_proyecto: 'P1' }] })
            const result = await ProyectoService.findAll()
            expect(result).toEqual([{ id_proyecto: 1, nombre_proyecto: 'P1' }])
        })
    })

    describe('findById', () => {
        it('retorna proyecto', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1 }] })
            const result = await ProyectoService.findById(1)
            expect(result).toEqual({ id_proyecto: 1 })
        })

        it('lanza NotFoundError si no existe', async () => {
            mockPool.query.mockResolvedValue({ rows: [] })
            await expect(ProyectoService.findById(999)).rejects.toThrow(NotFoundError)
        })
    })

    describe('create', () => {
        it('crea proyecto', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ id_proyecto: 1, nombre_proyecto: 'Test' }] })
            const result = await ProyectoService.create({ nombre_proyecto: 'Test' })
            expect(result).toEqual({ id_proyecto: 1, nombre_proyecto: 'Test' })
        })
    })

    describe('createProyectoCompleto', () => {
        it('valida campos obligatorios', async () => {
            await expect(ProyectoService.createProyectoCompleto({ proyecto: null }))
                .rejects.toThrow(ValidationError)
        })

        it('crea proyecto completo con relaciones', async () => {
            const proyectoInsert = { rows: [{ id_proyecto: 100 }] }
            mockClient.query.mockImplementation((sql) => {
                if (sql.includes('INSERT INTO proyectos')) return Promise.resolve(proyectoInsert)
                if (sql.includes('COMMIT')) return Promise.resolve()
                return Promise.resolve({ rows: [] })
            })

            const result = await ProyectoService.createProyectoCompleto({
                proyecto: { nombre: 'Proyecto Test', id_tipo: 1, id_estado: 1, presupuesto: 5000 }
            })

            expect(result.id_proyecto).toBe(100)
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
        })

        it('hace ROLLBACK en error', async () => {
            mockClient.query.mockImplementation((sql) => {
                if (sql === 'BEGIN') return Promise.resolve()
                throw new Error('DB error')
            })

            await expect(ProyectoService.createProyectoCompleto({
                proyecto: { nombre: 'Test', id_tipo: 1, id_estado: 1 }
            })).rejects.toThrow('DB error')

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
            expect(mockClient.release).toHaveBeenCalled()
        })
    })

    describe('getAsignaciones', () => {
        it('retorna asignaciones completas', async () => {
            mockPool.query
                .mockResolvedValueOnce({ rows: [{ id_locacion: 1, nombre_locacion: 'L1' }] })
                .mockResolvedValueOnce({ rows: [{ id_recurso: 1, nombre_equipo: 'R1' }] })
                .mockResolvedValueOnce({ rows: [{ id_asignacion: 1 }] })

            const result = await ProyectoService.getAsignaciones(1)
            expect(result.locaciones).toHaveLength(1)
            expect(result.recursos).toHaveLength(1)
            expect(result.personal).toHaveLength(1)
        })
    })

    describe('remove', () => {
        it('elimina proyecto', async () => {
            mockPool.query.mockResolvedValueOnce({ rows: [{ id_proyecto: 1 }] })
            mockPool.query.mockResolvedValueOnce({ rows: [{ id_proyecto: 1 }] })
            const result = await ProyectoService.remove(1)
            expect(result.message).toContain('eliminado')
        })
    })
})
