import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockFindAll = jest.fn()
const mockCreate = jest.fn()
const mockRemove = jest.fn()

jest.unstable_mockModule('../services/proyectoService.js', () => ({
    ProyectoService: {
        findAll: mockFindAll,
        create: mockCreate,
        remove: mockRemove
    }
}))

const { getProyectos, createProyecto, deleteProyecto } = await import('../controllers/proyecto.controller.js')

import { NotFoundError } from '../utils/errors.js'

describe('Proyecto Controller', () => {
    let req, res, next

    beforeEach(() => {
        jest.clearAllMocks()
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() }
        next = jest.fn()
    })

    it('getProyectos retorna lista', async () => {
        req = {}
        mockFindAll.mockResolvedValue([{ id_proyecto: 1, nombre_proyecto: 'P1' }])
        await getProyectos(req, res, next)
        expect(res.json).toHaveBeenCalledWith([{ id_proyecto: 1, nombre_proyecto: 'P1' }])
    })

    it('getProyectos retorna vacío', async () => {
        req = {}
        mockFindAll.mockResolvedValue([])
        await getProyectos(req, res, next)
        expect(res.json).toHaveBeenCalledWith([])
    })

    it('createProyecto retorna 201', async () => {
        req = { body: { nombre_proyecto: 'Test', id_tipo_proyecto: 1, id_estado_proyecto: 1 } }
        mockCreate.mockResolvedValue({ id_proyecto: 1, nombre_proyecto: 'Test' })
        await createProyecto(req, res, next)
        expect(res.status).toHaveBeenCalledWith(201)
    })

    it('deleteProyecto elimina correctamente', async () => {
        req = { params: { id: '1' } }
        mockRemove.mockResolvedValue({ message: 'Proyecto eliminado correctamente' })
        await deleteProyecto(req, res, next)
        expect(res.json).toHaveBeenCalledWith({ message: 'Proyecto eliminado correctamente' })
    })

    it('deleteProyecto llama next con NotFoundError si no existe', async () => {
        req = { params: { id: '999' } }
        mockRemove.mockRejectedValue(new NotFoundError('Proyecto no encontrado'))
        await deleteProyecto(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
    })
})
