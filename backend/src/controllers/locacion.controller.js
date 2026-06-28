import { LocacionModel, RecursoTecnicoModel, TipoRecursoModel } from '../models/locacion.js'

export const getLocacionById = async (req, res) => {
    try { const r = await LocacionModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'Locacion no encontrada' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getLocaciones = async (req, res) => {
    try { const r = await LocacionModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createLocacion = async (req, res) => {
    try { const r = await LocacionModel.create(req.body); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteLocacion = async (req, res) => {
    try { const r = await LocacionModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminada' }) : res.status(404).json({ message: 'No encontrada' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateLocacion = async (req, res) => {
    try { const r = await LocacionModel.update(req.params.id, req.body); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrada' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

// Recursos Técnicos
export const getRecursoTecnicoById = async (req, res) => {
    try { const r = await RecursoTecnicoModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getRecursosTecnicos = async (req, res) => {
    try { const r = await RecursoTecnicoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createRecursoTecnico = async (req, res) => {
    try { const r = await RecursoTecnicoModel.create(req.body); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteRecursoTecnico = async (req, res) => {
    try { const r = await RecursoTecnicoModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateRecursoTecnico = async (req, res) => {
    try {
        const check = await RecursoTecnicoModel.hasUsos(req.params.id)
        if (parseInt(check.rows[0].count) > 0) return res.status(409).json({ message: 'Vinculado a proyecto' })
        const r = await RecursoTecnicoModel.update(req.params.id, req.body)
        r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' })
    } catch (e) { res.status(500).json({ message: e.message }) }
}

// Tipos de Recursos
export const getTiposRecursos = async (req, res) => {
    try { const r = await TipoRecursoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getTipoRecursoById = async (req, res) => {
    try { const r = await TipoRecursoModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createTipoRecurso = async (req, res) => {
    try { const r = await TipoRecursoModel.create(req.body.nombre_tipo); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteTipoRecurso = async (req, res) => {
    try { const r = await TipoRecursoModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateTipoRecurso = async (req, res) => {
    try { const r = await TipoRecursoModel.update(req.params.id, req.body.nombre_tipo); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
