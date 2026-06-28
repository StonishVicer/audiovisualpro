import { GastoModel, PagoModel } from '../models/gasto.js'

export const getGastos = async (req, res) => {
    try { const r = await GastoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

export const getGastoById = async (req, res) => {
    try {
        const r = await GastoModel.findById(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' })
        res.json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const createGasto = async (req, res) => {
    try { const r = await GastoModel.create(req.body); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

export const deleteGasto = async (req, res) => {
    try {
        const r = await GastoModel.remove(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' })
        res.json({ message: 'Gasto eliminado' })
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const updateGasto = async (req, res) => {
    try {
        const r = await GastoModel.update(req.params.id, req.body)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Gasto no encontrado' })
        res.json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}

// Pagos
export const getPagos = async (req, res) => {
    try { const r = await PagoModel.findAll(); res.json(r.rows) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

export const getPagoById = async (req, res) => {
    try {
        const r = await PagoModel.findById(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' })
        res.json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const createPago = async (req, res) => {
    try { const r = await PagoModel.create(req.body); res.status(201).json(r.rows[0]) }
    catch (e) { res.status(500).json({ message: e.message }) }
}

export const deletePago = async (req, res) => {
    try {
        const r = await PagoModel.remove(req.params.id)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' })
        res.json({ message: 'Pago eliminado' })
    } catch (e) { res.status(500).json({ message: e.message }) }
}

export const updatePago = async (req, res) => {
    try {
        const r = await PagoModel.update(req.params.id, req.body)
        if (r.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' })
        res.json(r.rows[0])
    } catch (e) { res.status(500).json({ message: e.message }) }
}
