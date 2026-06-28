import { GastoService, PagoService } from '../services/gastoService.js'

export const getGastos = async (req, res, next) => {
    try {
        const gastos = await GastoService.findAll()
        res.json(gastos)
    } catch (err) { next(err) }
}

export const getGastoById = async (req, res, next) => {
    try {
        const gasto = await GastoService.findById(req.params.id)
        res.json(gasto)
    } catch (err) { next(err) }
}

export const createGasto = async (req, res, next) => {
    try {
        const gasto = await GastoService.create(req.body)
        res.status(201).json(gasto)
    } catch (err) { next(err) }
}

export const deleteGasto = async (req, res, next) => {
    try {
        const result = await GastoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updateGasto = async (req, res, next) => {
    try {
        const gasto = await GastoService.update(req.params.id, req.body)
        res.json(gasto)
    } catch (err) { next(err) }
}

export const getPagos = async (req, res, next) => {
    try {
        const pagos = await PagoService.findAll()
        res.json(pagos)
    } catch (err) { next(err) }
}

export const getPagoById = async (req, res, next) => {
    try {
        const pago = await PagoService.findById(req.params.id)
        res.json(pago)
    } catch (err) { next(err) }
}

export const createPago = async (req, res, next) => {
    try {
        const pago = await PagoService.create(req.body)
        res.status(201).json(pago)
    } catch (err) { next(err) }
}

export const deletePago = async (req, res, next) => {
    try {
        const result = await PagoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const updatePago = async (req, res, next) => {
    try {
        const pago = await PagoService.update(req.params.id, req.body)
        res.json(pago)
    } catch (err) { next(err) }
}
