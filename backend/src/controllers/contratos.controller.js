import { ContratoService } from '../services/contratoService.js'

export const getContratoById = async (req, res, next) => {
    try {
        const contrato = await ContratoService.findById(req.params.id)
        res.json(contrato)
    } catch (err) { next(err) }
}

export const getContratos = async (req, res, next) => {
    try {
        const contratos = await ContratoService.findAll()
        res.json(contratos)
    } catch (err) { next(err) }
}

export const createContrato = async (req, res, next) => {
    try {
        const contrato = await ContratoService.create(req.body)
        res.status(201).json(contrato)
    } catch (err) { next(err) }
}

export const updateContrato = async (req, res, next) => {
    try {
        const contrato = await ContratoService.update(req.params.id, req.body)
        res.json(contrato)
    } catch (err) { next(err) }
}

export const deleteContrato = async (req, res, next) => {
    try {
        const result = await ContratoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}
