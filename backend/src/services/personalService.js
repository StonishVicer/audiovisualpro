import { PersonalModel, AsignacionModel } from '../models/personal.js'
import { NotFoundError } from '../utils/errors.js'

export const PersonalService = {
    async findAll() {
        const result = await PersonalModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await PersonalModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Personal no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await PersonalModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await PersonalModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Personal no encontrado')
        const result = await PersonalModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await PersonalModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Personal no encontrado')
        return { message: 'Personal eliminado' }
    }
}

export const AsignacionService = {
    async findAll() {
        const result = await AsignacionModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await AsignacionModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Asignación no encontrada')
        return result.rows[0]
    },

    async findByProyecto(idProyecto) {
        const result = await AsignacionModel.findByProyecto(idProyecto)
        return result.rows
    },

    async create({ id_proyecto, id_personal, horas_trabajadas }) {
        const result = await AsignacionModel.create({
            id_proyecto, id_personal,
            horas_trabajadas: horas_trabajadas || 0,
            fecha_registro: new Date().toISOString().slice(0, 10)
        })
        return result.rows[0]
    },

    async update(id, data) {
        const result = await AsignacionModel.update(id, data)
        if (result.rows.length === 0) throw new NotFoundError('Asignación no encontrada')
        return result.rows[0]
    },

    async remove(id) {
        const result = await AsignacionModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Asignación no encontrada')
        return { message: 'Asignación eliminada' }
    }
}
