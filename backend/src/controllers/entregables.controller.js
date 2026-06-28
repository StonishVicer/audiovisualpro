import { EntregableService, EstadoEntregableService } from '../services/entregableService.js'

export const getEntregables = async (req, res, next) => {
    try {
        const entregables = await EntregableService.findAll()
        res.json(entregables)
    } catch (err) { next(err) }
}

export const createEntregable = async (req, res, next) => {
    try {
        const { id_proyecto, titulo, fecha_entrega, id_estado_entregable, link } = req.body
        const result = await EntregableService.create({
            id_proyecto, titulo, fecha_entrega, id_estado_entregable, link,
            file: req.file
        })
        res.status(201).json(result)
    } catch (err) { next(err) }
}

export const updateEntregable = async (req, res, next) => {
    try {
        const { titulo, fecha_entrega, id_estado_entregable, id_proyecto, link } = req.body
        const result = await EntregableService.update(req.params.id, {
            titulo, fecha_entrega, id_estado_entregable, id_proyecto, link,
            file: req.file
        })
        res.json(result)
    } catch (err) { next(err) }
}

export const deleteEntregable = async (req, res, next) => {
    try {
        const result = await EntregableService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const getEstadosEntregable = async (req, res, next) => {
    try {
        const estados = await EstadoEntregableService.findAll()
        res.json(estados)
    } catch (err) { next(err) }
}

export const getEstadoEntregableById = async (req, res, next) => {
    try {
        const estado = await EstadoEntregableService.findById(req.params.id)
        res.json(estado)
    } catch (err) { next(err) }
}

export const createEstadoEntregable = async (req, res, next) => {
    try {
        const estado = await EstadoEntregableService.create(req.body)
        res.status(201).json(estado)
    } catch (err) { next(err) }
}

export const deleteEstadoEntregable = async (req, res, next) => {
    try {
        const result = await EstadoEntregableService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateEstadoEntregable = async (req, res, next) => {
    try {
        const estado = await EstadoEntregableService.update(req.params.id, req.body)
        res.json(estado)
    } catch (err) { next(err) }
}
