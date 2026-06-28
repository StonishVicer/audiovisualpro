import { CatalogoService } from '../services/catalogoService.js'

export const getTiposProyecto = async (req, res, next) => {
    try {
        const tipos = await CatalogoService.getTiposProyecto()
        res.json(tipos)
    } catch (err) { next(err) }
}

export const getTipoProyectoById = async (req, res, next) => {
    try {
        const tipo = await CatalogoService.getTipoProyectoById(req.params.id)
        res.json(tipo)
    } catch (err) { next(err) }
}

export const createTipoProyecto = async (req, res, next) => {
    try {
        const tipo = await CatalogoService.createTipoProyecto(req.body.nombre_tipo)
        res.status(201).json(tipo)
    } catch (err) { next(err) }
}

export const deleteTipoProyecto = async (req, res, next) => {
    try {
        const result = await CatalogoService.deleteTipoProyecto(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateTipoProyecto = async (req, res, next) => {
    try {
        const tipo = await CatalogoService.updateTipoProyecto(req.params.id, req.body.nombre_tipo)
        res.json(tipo)
    } catch (err) { next(err) }
}

export const getEstadosProyecto = async (req, res, next) => {
    try {
        const estados = await CatalogoService.getEstadosProyecto()
        res.json(estados)
    } catch (err) { next(err) }
}

export const getEstadoProyectoById = async (req, res, next) => {
    try {
        const estado = await CatalogoService.getEstadoProyectoById(req.params.id)
        res.json(estado)
    } catch (err) { next(err) }
}

export const createEstadoProyecto = async (req, res, next) => {
    try {
        const estado = await CatalogoService.createEstadoProyecto(req.body.nombre_estado)
        res.status(201).json(estado)
    } catch (err) { next(err) }
}

export const deleteEstadoProyecto = async (req, res, next) => {
    try {
        const result = await CatalogoService.deleteEstadoProyecto(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateEstadoProyecto = async (req, res, next) => {
    try {
        const estado = await CatalogoService.updateEstadoProyecto(req.params.id, req.body.nombre_estado)
        res.json(estado)
    } catch (err) { next(err) }
}

export const getRolesPersonal = async (req, res, next) => {
    try {
        const roles = await CatalogoService.getRolesPersonal()
        res.json(roles)
    } catch (err) { next(err) }
}

export const getRolPersonalById = async (req, res, next) => {
    try {
        const rol = await CatalogoService.getRolPersonalById(req.params.id)
        res.json(rol)
    } catch (err) { next(err) }
}

export const createRolPersonal = async (req, res, next) => {
    try {
        const rol = await CatalogoService.createRolPersonal(req.body.nombre_rol)
        res.status(201).json(rol)
    } catch (err) { next(err) }
}

export const deleteRolPersonal = async (req, res, next) => {
    try {
        const result = await CatalogoService.deleteRolPersonal(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateRolPersonal = async (req, res, next) => {
    try {
        const rol = await CatalogoService.updateRolPersonal(req.params.id, req.body.nombre_rol)
        res.json(rol)
    } catch (err) { next(err) }
}

export const getFinanceStats = async (req, res, next) => {
    try {
        const stats = await CatalogoService.getFinanceStats()
        res.json(stats)
    } catch (err) { next(err) }
}
