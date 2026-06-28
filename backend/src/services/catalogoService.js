import { TipoProyectoModel, EstadoProyectoModel, RolPersonalModel, StatsModel } from '../models/catalogos.js'
import { NotFoundError } from '../utils/errors.js'

export const CatalogoService = {
    async getTiposProyecto() {
        const result = await TipoProyectoModel.findAll()
        return result.rows
    },

    async getTipoProyectoById(id) {
        const result = await TipoProyectoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Tipo de proyecto no encontrado')
        return result.rows[0]
    },

    async createTipoProyecto(nombre_tipo) {
        const result = await TipoProyectoModel.create(nombre_tipo)
        return result.rows[0]
    },

    async updateTipoProyecto(id, nombre_tipo) {
        const existing = await TipoProyectoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Tipo de proyecto no encontrado')
        const result = await TipoProyectoModel.update(id, nombre_tipo)
        return result.rows[0]
    },

    async deleteTipoProyecto(id) {
        const result = await TipoProyectoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Tipo de proyecto no encontrado')
        return { message: 'Tipo de proyecto eliminado' }
    },

    async getEstadosProyecto() {
        const result = await EstadoProyectoModel.findAll()
        return result.rows
    },

    async getEstadoProyectoById(id) {
        const result = await EstadoProyectoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Estado de proyecto no encontrado')
        return result.rows[0]
    },

    async createEstadoProyecto(nombre_estado) {
        const result = await EstadoProyectoModel.create(nombre_estado)
        return result.rows[0]
    },

    async updateEstadoProyecto(id, nombre_estado) {
        const existing = await EstadoProyectoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Estado de proyecto no encontrado')
        const result = await EstadoProyectoModel.update(id, nombre_estado)
        return result.rows[0]
    },

    async deleteEstadoProyecto(id) {
        const result = await EstadoProyectoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Estado de proyecto no encontrado')
        return { message: 'Estado de proyecto eliminado' }
    },

    async getRolesPersonal() {
        const result = await RolPersonalModel.findAll()
        return result.rows
    },

    async getRolPersonalById(id) {
        const result = await RolPersonalModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Rol no encontrado')
        return result.rows[0]
    },

    async createRolPersonal(nombre_rol) {
        const result = await RolPersonalModel.create(nombre_rol)
        return result.rows[0]
    },

    async updateRolPersonal(id, nombre_rol) {
        const existing = await RolPersonalModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Rol no encontrado')
        const result = await RolPersonalModel.update(id, nombre_rol)
        return result.rows[0]
    },

    async deleteRolPersonal(id) {
        const result = await RolPersonalModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Rol no encontrado')
        return { message: 'Rol eliminado' }
    },

    async getFinanceStats() {
        const result = await StatsModel.getFinanceStats()
        return result.rows[0]
    }
}
