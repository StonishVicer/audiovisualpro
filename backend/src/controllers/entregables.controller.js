import { EntregableModel, EstadoEntregableModel } from '../models/entregable.js'
import fs from 'fs'
import path from 'path'

const deleteFile = (fileUrl) => {
    if (!fileUrl) return
    try {
        const filename = fileUrl.split('/').pop()
        if (!filename) return
        const filePath = path.join(path.resolve('uploads'), filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (err) { console.error('Error eliminando archivo:', err.message) }
}

export const getEntregables = async (req, res) => {
    try {
        const result = await EntregableModel.findAll()
        const entregables = result.rows.map(row => ({
            id: row.id_entregable,
            id_proyecto: row.id_proyecto,
            titulo: row.descripcion || 'Sin título',
            archivo: row.link_entrega ? { filename: 'Archivo', url: row.link_entrega } : null,
            fecha_entrega: row.fecha_entrega_estimada,
            id_estado_entregable: row.id_estado_entregable
        }))
        res.json(entregables)
    } catch (err) { res.status(500).json({ message: err.message }) }
}

export const createEntregable = async (req, res) => {
    try {
        const { titulo, fecha_entrega, id_estado_entregable } = req.body
        if (!titulo) return res.status(400).json({ message: 'El título es obligatorio' })

        let dataExtra = ''
        if (req.file) {
            const PORT = process.env.PORT || 3000
            dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, '/')}`
        } else if (req.body.link) {
            dataExtra = req.body.link
        }

        let desc = titulo
        if (desc.length > 255) desc = desc.slice(0, 252) + '...'
        const idProyecto = req.body.id_proyecto ? Number(req.body.id_proyecto) : 1

        const result = await EntregableModel.create({
            id_proyecto: idProyecto,
            descripcion: desc,
            fecha_entrega_estimada: fecha_entrega || null,
            id_estado_entregable: id_estado_entregable || null,
            link_entrega: dataExtra || null
        })

        res.status(201).json({
            id: result.rows[0].id_entregable,
            titulo: result.rows[0].descripcion,
            archivo: req.file ? { url: dataExtra, filename: req.file.filename } : null,
            fecha_entrega: result.rows[0].fecha_entrega_estimada,
            id_estado_entregable: result.rows[0].id_estado_entregable
        })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

export const updateEntregable = async (req, res) => {
    try {
        const id = req.params.id
        const existing = await EntregableModel.findById(id)
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Entregable no encontrado' })

        if (req.file && existing.rows[0].link_entrega) deleteFile(existing.rows[0].link_entrega)

        let dataExtra = req.file
            ? `http://localhost:${process.env.PORT || 3000}/${req.file.path.replace(/\\/g, '/')}`
            : (req.body.link !== undefined ? (req.body.link?.trim() || null) : existing.rows[0].link_entrega)

        const desc = (req.body.titulo?.trim() || existing.rows[0].descripcion || 'Sin título').slice(0, 255)
        const result = await EntregableModel.update(id, {
            descripcion: desc,
            fecha_entrega_estimada: req.body.fecha_entrega || existing.rows[0].fecha_entrega_estimada,
            id_estado_entregable: req.body.id_estado_entregable || existing.rows[0].id_estado_entregable,
            link_entrega: dataExtra,
            id_proyecto: req.body.id_proyecto || existing.rows[0].id_proyecto
        })

        res.json({ message: 'Actualizado correctamente', entregable: result.rows[0] })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

export const deleteEntregable = async (req, res) => {
    try {
        const id = req.params.id
        const existing = await EntregableModel.findById(id)
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Entregable no encontrado' })

        if (existing.rows[0].link_entrega) deleteFile(existing.rows[0].link_entrega)
        await EntregableModel.remove(id)

        res.json({ message: 'Eliminado correctamente' })
    } catch (err) { res.status(500).json({ message: err.message }) }
}

// Estados Entregable
export const getEstadosEntregable = async (req, res) => {
    try { const r = await EstadoEntregableModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getEstadoEntregableById = async (req, res) => {
    try { const r = await EstadoEntregableModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createEstadoEntregable = async (req, res) => {
    try { const r = await EstadoEntregableModel.create(req.body); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteEstadoEntregable = async (req, res) => {
    try { const r = await EstadoEntregableModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateEstadoEntregable = async (req, res) => {
    try { const r = await EstadoEntregableModel.update(req.params.id, req.body); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
