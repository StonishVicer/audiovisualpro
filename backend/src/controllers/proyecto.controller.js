import { ProyectoService } from '../services/proyectoService.js'

export const getProyectoById = async (req, res, next) => {
    try {
        const proyecto = await ProyectoService.findById(req.params.id)
        res.json(proyecto)
    } catch (err) {
        next(err)
    }
}

export const getProyectos = async (req, res, next) => {
    try {
        const proyectos = await ProyectoService.findAll()
        res.json(proyectos)
    } catch (err) {
        next(err)
    }
}

export const createProyecto = async (req, res, next) => {
    try {
        const proyecto = await ProyectoService.create(req.body)
        res.status(201).json(proyecto)
    } catch (err) {
        next(err)
    }
}

export const updateProyecto = async (req, res, next) => {
    try {
        const proyecto = await ProyectoService.update(req.params.id, req.body)
        res.json(proyecto)
    } catch (err) {
        next(err)
    }
}

export const deleteProyecto = async (req, res, next) => {
    try {
        const result = await ProyectoService.remove(req.params.id)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const asignarLocacion = async (req, res, next) => {
    try {
        const { id_proyecto, id_locacion } = req.body
        const result = await ProyectoService.asignarLocacion(id_proyecto, id_locacion)
        res.status(200).json(result)
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ message: 'El proyecto o locación no existe' })
        next(err)
    }
}

export const desasignarLocacion = async (req, res, next) => {
    try {
        const { idProyecto, idLocacion } = req.params
        const result = await ProyectoService.desasignarLocacion(idProyecto, idLocacion)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const asignarRecurso = async (req, res, next) => {
    try {
        const { id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso } = req.body
        const result = await ProyectoService.asignarRecurso(id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso)
        res.status(201).json(result)
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ message: 'El proyecto o recurso no existe' })
        next(err)
    }
}

export const desasignarRecurso = async (req, res, next) => {
    try {
        const { idProyecto, idRecurso } = req.params
        if (!idProyecto || !idRecurso) return res.status(400).json({ message: 'Faltan campos' })
        const result = await ProyectoService.desasignarRecurso(idProyecto, idRecurso)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const getAsignacionesProyecto = async (req, res, next) => {
    try {
        const { id } = req.params
        const asignaciones = await ProyectoService.getAsignaciones(id)
        res.json(asignaciones)
    } catch (err) {
        next(err)
    }
}
