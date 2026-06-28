import { ContratoModel } from '../models/contrato.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export const ContratoService = {
    async findAll() {
        const result = await ContratoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await ContratoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Contrato no encontrado')
        return result.rows[0]
    },

    async create(data) {
        if (!data.id_proyecto || !data.id_cliente || !data.fecha_firma || !data.monto_contrato) {
            throw new ValidationError('Faltan campos obligatorios')
        }
        const result = await ContratoModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await ContratoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Contrato no encontrado')
        const result = await ContratoModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await ContratoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Contrato no encontrado')
        return { message: 'Contrato eliminado correctamente' }
    }
}
