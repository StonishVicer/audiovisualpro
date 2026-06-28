import { ClienteModel } from '../models/cliente.js'
import { NotFoundError, ConflictError } from '../utils/errors.js'

export const ClienteService = {
    async findAll() {
        const result = await ClienteModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await ClienteModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Cliente no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await ClienteModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await ClienteModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Cliente no encontrado')

        const contratos = await ClienteModel.hasContratos(id)
        if (parseInt(contratos.rows[0].count) > 0) {
            throw new ConflictError('No se puede editar al cliente, está vinculado a un contrato')
        }

        const result = await ClienteModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await ClienteModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Cliente no encontrado')
        return { message: 'Cliente eliminado correctamente' }
    }
}
