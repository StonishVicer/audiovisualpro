import { AsignacionService } from '../services/personalService.js'

export const getAsignacionesPersonal = async (req, res, next) => {
    try {
        const asignaciones = await AsignacionService.findAll()
        res.json(asignaciones)
    } catch (err) { next(err) }
}

export const getAsignacionPersonalById = async (req, res, next) => {
    try {
        const asignacion = await AsignacionService.findById(req.params.id)
        res.json(asignacion)
    } catch (err) { next(err) }
}

export const getAsignacionesPorProyecto = async (req, res, next) => {
    try {
        const asignaciones = await AsignacionService.findByProyecto(req.params.idProyecto)
        res.json(asignaciones)
    } catch (err) { next(err) }
}

export const createAsignacionPersonal = async (req, res, next) => {
    try {
        const asignacion = await AsignacionService.create(req.body)
        res.status(201).json(asignacion)
    } catch (err) { next(err) }
}

export const updateAsignacionPersonal = async (req, res, next) => {
    try {
        const asignacion = await AsignacionService.update(req.params.id, req.body)
        res.json(asignacion)
    } catch (err) { next(err) }
}

export const deleteAsignacionPersonal = async (req, res, next) => {
    try {
        const result = await AsignacionService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}
