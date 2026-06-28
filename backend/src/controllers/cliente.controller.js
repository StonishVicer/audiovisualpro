import { ClienteService } from '../services/clienteService.js'

export const getClienteById = async (req, res, next) => {
    try {
        const cliente = await ClienteService.findById(req.params.id)
        res.json(cliente)
    } catch (err) {
        next(err)
    }
}

export const getClientes = async (req, res, next) => {
    try {
        const clientes = await ClienteService.findAll()
        res.json(clientes)
    } catch (err) {
        next(err)
    }
}

export const createCliente = async (req, res, next) => {
    try {
        const cliente = await ClienteService.create(req.body)
        res.status(201).json(cliente)
    } catch (err) {
        next(err)
    }
}

export const deleteCliente = async (req, res, next) => {
    try {
        const result = await ClienteService.remove(req.params.id)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const updateCliente = async (req, res, next) => {
    try {
        const cliente = await ClienteService.update(req.params.id, req.body)
        res.json(cliente)
    } catch (err) {
        next(err)
    }
}
