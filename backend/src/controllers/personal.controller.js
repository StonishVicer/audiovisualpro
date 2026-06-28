import { PersonalModel } from '../models/personal.js'

export const getPersonalById = async (req, res) => {
    try {
        const r = await PersonalModel.findById(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Personal no encontrado' })
        res.json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const getPersonal = async (req, res) => {
    try {
        const r = await PersonalModel.findAll()
        res.json(r.rows)
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const createPersonal = async (req, res) => {
    try {
        const r = await PersonalModel.create(req.body)
        res.status(201).json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const deletePersonal = async (req, res) => {
    try {
        const r = await PersonalModel.remove(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Personal no encontrado' })
        res.json({ message: 'Personal eliminado' })
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const updatePersonal = async (req, res) => {
    try {
        const r = await PersonalModel.update(req.params.id, req.body)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Personal no encontrado' })
        res.json(r.rows[0])
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: e.message })
    }
}
