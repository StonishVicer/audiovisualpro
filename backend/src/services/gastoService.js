import { GastoModel, CategoriaGastoModel, PagoModel } from '../models/gasto.js'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js'

export const GastoService = {
    async findAll() {
        const result = await GastoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await GastoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Gasto no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await GastoModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await GastoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Gasto no encontrado')
        const result = await GastoModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await GastoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Gasto no encontrado')
        return { message: 'Gasto eliminado' }
    }
}

export const CategoriaGastoService = {
    async findAll() {
        const result = await CategoriaGastoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await CategoriaGastoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Categoría de gasto no encontrada')
        return result.rows[0]
    },

    async create(nombre_categoria) {
        if (!nombre_categoria) throw new ValidationError('Nombre de categoría requerido')
        const result = await CategoriaGastoModel.create(nombre_categoria)
        return result.rows[0]
    },

    async update(id, nombre_categoria) {
        const existing = await CategoriaGastoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Categoría de gasto no encontrada')

        const check = await CategoriaGastoModel.hasGastos(id)
        if (parseInt(check.rows[0].count) > 0) {
            throw new ConflictError('No se puede modificar la categoría porque está vinculada a gastos')
        }

        const result = await CategoriaGastoModel.update(id, nombre_categoria)
        return result.rows[0]
    },

    async remove(id) {
        const check = await CategoriaGastoModel.hasGastos(id)
        if (parseInt(check.rows[0].count) > 0) {
            throw new ConflictError('No se puede eliminar la categoría porque está vinculada a gastos')
        }
        const result = await CategoriaGastoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Categoría de gasto no encontrada')
        return { message: 'Categoría de gasto eliminada' }
    }
}

export const PagoService = {
    async findAll() {
        const result = await PagoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await PagoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Pago no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await PagoModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await PagoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Pago no encontrado')
        const result = await PagoModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await PagoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Pago no encontrado')
        return { message: 'Pago eliminado' }
    }
}
