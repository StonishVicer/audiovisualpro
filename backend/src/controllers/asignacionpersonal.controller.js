import { PersonalModel, AsignacionModel } from '../models/personal.js'

export const getAsignacionesPersonal = async (req, res) => {
    try {
        const result = await AsignacionModel.findAll()
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getAsignacionPersonalById = async (req, res) => {
    try {
        const result = await AsignacionModel.findById(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Asignacion no encontrada' })
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getAsignacionesPorProyecto = async (req, res) => {
    try {
        const result = await AsignacionModel.findByProyecto(req.params.idProyecto)
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const createAsignacionPersonal = async (req, res) => {
    try {
        const { id_proyecto, id_personal, horas_trabajadas } = req.body
        const result = await AsignacionModel.create({
            id_proyecto, id_personal,
            horas_trabajadas: horas_trabajadas || 0,
            fecha_registro: new Date().toISOString().slice(0, 10)
        })
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const updateAsignacionPersonal = async (req, res) => {
    try {
        const result = await AsignacionModel.update(req.params.id, req.body)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Asignacion no encontrada' })
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const deleteAsignacionPersonal = async (req, res) => {
    try {
        const result = await AsignacionModel.remove(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Asignacion no encontrada' })
        res.json({ message: 'Asignacion eliminada' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
