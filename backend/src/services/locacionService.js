import { LocacionModel, RecursoTecnicoModel, TipoRecursoModel } from '../models/locacion.js'
import { NotFoundError, ConflictError } from '../utils/errors.js'

export const LocacionService = {
    async findAll() {
        const result = await LocacionModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await LocacionModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Locación no encontrada')
        return result.rows[0]
    },

    async create(data) {
        const result = await LocacionModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await LocacionModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Locación no encontrada')
        const result = await LocacionModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await LocacionModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Locación no encontrada')
        return { message: 'Locación eliminada' }
    }
}

export const RecursoTecnicoService = {
    async findAll() {
        const result = await RecursoTecnicoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await RecursoTecnicoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Recurso técnico no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await RecursoTecnicoModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await RecursoTecnicoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Recurso técnico no encontrado')

        const check = await RecursoTecnicoModel.hasUsos(id)
        if (parseInt(check.rows[0].count) > 0) {
            throw new ConflictError('Recurso vinculado a un proyecto')
        }

        const result = await RecursoTecnicoModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await RecursoTecnicoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Recurso técnico no encontrado')
        return { message: 'Recurso eliminado' }
    }
}

export const TipoRecursoService = {
    async findAll() {
        const result = await TipoRecursoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await TipoRecursoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Tipo de recurso no encontrado')
        return result.rows[0]
    },

    async create(nombre_tipo) {
        const result = await TipoRecursoModel.create(nombre_tipo)
        return result.rows[0]
    },

    async update(id, nombre_tipo) {
        const existing = await TipoRecursoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Tipo de recurso no encontrado')
        const result = await TipoRecursoModel.update(id, nombre_tipo)
        return result.rows[0]
    },

    async remove(id) {
        const result = await TipoRecursoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Tipo de recurso no encontrado')
        return { message: 'Tipo de recurso eliminado' }
    }
}
