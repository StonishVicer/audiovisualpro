import { LocacionService, RecursoTecnicoService, TipoRecursoService } from '../services/locacionService.js'

export const getLocacionById = async (req, res, next) => {
    try {
        const locacion = await LocacionService.findById(req.params.id)
        res.json(locacion)
    } catch (err) { next(err) }
}

export const getLocaciones = async (req, res, next) => {
    try {
        const locaciones = await LocacionService.findAll()
        res.json(locaciones)
    } catch (err) { next(err) }
}

export const createLocacion = async (req, res, next) => {
    try {
        const locacion = await LocacionService.create(req.body)
        res.status(201).json(locacion)
    } catch (err) { next(err) }
}

export const deleteLocacion = async (req, res, next) => {
    try {
        const result = await LocacionService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateLocacion = async (req, res, next) => {
    try {
        const locacion = await LocacionService.update(req.params.id, req.body)
        res.json(locacion)
    } catch (err) { next(err) }
}

export const getRecursoTecnicoById = async (req, res, next) => {
    try {
        const recurso = await RecursoTecnicoService.findById(req.params.id)
        res.json(recurso)
    } catch (err) { next(err) }
}

export const getRecursosTecnicos = async (req, res, next) => {
    try {
        const recursos = await RecursoTecnicoService.findAll()
        res.json(recursos)
    } catch (err) { next(err) }
}

export const createRecursoTecnico = async (req, res, next) => {
    try {
        const recurso = await RecursoTecnicoService.create(req.body)
        res.status(201).json(recurso)
    } catch (err) { next(err) }
}

export const deleteRecursoTecnico = async (req, res, next) => {
    try {
        const result = await RecursoTecnicoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateRecursoTecnico = async (req, res, next) => {
    try {
        const recurso = await RecursoTecnicoService.update(req.params.id, req.body)
        res.json(recurso)
    } catch (err) { next(err) }
}

export const getTiposRecursos = async (req, res, next) => {
    try {
        const tipos = await TipoRecursoService.findAll()
        res.json(tipos)
    } catch (err) { next(err) }
}

export const getTipoRecursoById = async (req, res, next) => {
    try {
        const tipo = await TipoRecursoService.findById(req.params.id)
        res.json(tipo)
    } catch (err) { next(err) }
}

export const createTipoRecurso = async (req, res, next) => {
    try {
        const tipo = await TipoRecursoService.create(req.body.nombre_tipo)
        res.status(201).json(tipo)
    } catch (err) { next(err) }
}

export const deleteTipoRecurso = async (req, res, next) => {
    try {
        const result = await TipoRecursoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateTipoRecurso = async (req, res, next) => {
    try {
        const tipo = await TipoRecursoService.update(req.params.id, req.body.nombre_tipo)
        res.json(tipo)
    } catch (err) { next(err) }
}
