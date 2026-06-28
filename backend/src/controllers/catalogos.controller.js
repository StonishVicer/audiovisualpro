import { TipoProyectoModel, EstadoProyectoModel, RolPersonalModel, StatsModel } from '../models/catalogos.js'

// Tipos Proyecto
export const getTiposProyecto = async (req, res) => {
    try { const r = await TipoProyectoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getTipoProyectoById = async (req, res) => {
    try { const r = await TipoProyectoModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createTipoProyecto = async (req, res) => {
    try { const r = await TipoProyectoModel.create(req.body.nombre_tipo); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteTipoProyecto = async (req, res) => {
    try { const r = await TipoProyectoModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

// Estados Proyecto
export const getEstadosProyecto = async (req, res) => {
    try { const r = await EstadoProyectoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getEstadoProyectoById = async (req, res) => {
    try { const r = await EstadoProyectoModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createEstadoProyecto = async (req, res) => {
    try { const r = await EstadoProyectoModel.create(req.body.nombre_estado); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteEstadoProyecto = async (req, res) => {
    try { const r = await EstadoProyectoModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateEstadoProyecto = async (req, res) => {
    try { const r = await EstadoProyectoModel.update(req.params.id, req.body.nombre_estado); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

// Roles Personal
export const getRolesPersonal = async (req, res) => {
    try { const r = await RolPersonalModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const getRolPersonalById = async (req, res) => {
    try { const r = await RolPersonalModel.findById(req.params.id); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const createRolPersonal = async (req, res) => {
    try { const r = await RolPersonalModel.create(req.body.nombre_rol); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const deleteRolPersonal = async (req, res) => {
    try { const r = await RolPersonalModel.remove(req.params.id); r.rows[0] ? res.json({ message: 'Eliminado' }) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
export const updateRolPersonal = async (req, res) => {
    try { const r = await RolPersonalModel.update(req.params.id, req.body.nombre_rol); r.rows[0] ? res.json(r.rows[0]) : res.status(404).json({ message: 'No encontrado' }) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

// Stats
export const getFinanceStats = async (req, res) => {
    try { const r = await StatsModel.getFinanceStats(); res.json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}
