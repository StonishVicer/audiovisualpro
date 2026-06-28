import { EntregableModel, EstadoEntregableModel } from '../models/entregable.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'
import fs from 'fs'
import path from 'path'

const deleteFile = (fileUrl) => {
    if (!fileUrl) return
    try {
        const filename = fileUrl.split('/').pop()
        if (!filename) return
        const filePath = path.join(path.resolve('uploads'), filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (err) { /* noop */ }
}

export const EntregableService = {
    async findAll() {
        const result = await EntregableModel.findAll()
        return result.rows.map(row => ({
            id: row.id_entregable,
            id_proyecto: row.id_proyecto,
            titulo: row.descripcion || 'Sin título',
            archivo: row.link_entrega ? { filename: 'Archivo', url: row.link_entrega } : null,
            fecha_entrega: row.fecha_entrega_estimada,
            id_estado_entregable: row.id_estado_entregable
        }))
    },

    async findById(id) {
        const result = await EntregableModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Entregable no encontrado')
        return result.rows[0]
    },

    async create({ titulo, fecha_entrega, id_estado_entregable, id_proyecto, link, file }) {
        if (!titulo) throw new ValidationError('El título es obligatorio')

        let dataExtra = ''
        if (file) {
            const PORT = process.env.PORT || 3000
            dataExtra = `http://localhost:${PORT}/${file.path.replace(/\\/g, '/')}`
        } else if (link) {
            dataExtra = link
        }

        let desc = titulo
        if (desc.length > 255) desc = desc.slice(0, 252) + '...'
        const idProyectoStr = id_proyecto ? Number(id_proyecto) : 1

        const result = await EntregableModel.create({
            id_proyecto: idProyectoStr,
            descripcion: desc,
            fecha_entrega_estimada: fecha_entrega || null,
            id_estado_entregable: id_estado_entregable || null,
            link_entrega: dataExtra || null
        })

        return {
            id: result.rows[0].id_entregable,
            titulo: result.rows[0].descripcion,
            archivo: file ? { url: dataExtra, filename: file.filename } : null,
            fecha_entrega: result.rows[0].fecha_entrega_estimada,
            id_estado_entregable: result.rows[0].id_estado_entregable
        }
    },

    async update(id, { titulo, fecha_entrega, id_estado_entregable, id_proyecto, link, file }) {
        const existing = await EntregableModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Entregable no encontrado')

        if (file && existing.rows[0].link_entrega) deleteFile(existing.rows[0].link_entrega)

        let dataExtra = file
            ? `http://localhost:${process.env.PORT || 3000}/${file.path.replace(/\\/g, '/')}`
            : (link !== undefined ? (link?.trim() || null) : existing.rows[0].link_entrega)

        const desc = (titulo?.trim() || existing.rows[0].descripcion || 'Sin título').slice(0, 255)
        const result = await EntregableModel.update(id, {
            descripcion: desc,
            fecha_entrega_estimada: fecha_entrega || existing.rows[0].fecha_entrega_estimada,
            id_estado_entregable: id_estado_entregable || existing.rows[0].id_estado_entregable,
            link_entrega: dataExtra,
            id_proyecto: id_proyecto || existing.rows[0].id_proyecto
        })

        return { message: 'Actualizado correctamente', entregable: result.rows[0] }
    },

    async remove(id) {
        const existing = await EntregableModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Entregable no encontrado')

        if (existing.rows[0].link_entrega) deleteFile(existing.rows[0].link_entrega)
        await EntregableModel.remove(id)

        return { message: 'Eliminado correctamente' }
    }
}

export const EstadoEntregableService = {
    async findAll() {
        const result = await EstadoEntregableModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await EstadoEntregableModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Estado de entregable no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await EstadoEntregableModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await EstadoEntregableModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Estado de entregable no encontrado')
        const result = await EstadoEntregableModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await EstadoEntregableModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Estado de entregable no encontrado')
        return { message: 'Estado de entregable eliminado' }
    }
}
