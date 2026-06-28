import { ProyectoService } from '../services/proyectoService.js'

export const createProyectoCompleto = async (req, res, next) => {
    try {
        const result = await ProyectoService.createProyectoCompleto(req.body)
        res.status(201).json(result)
    } catch (err) {
        next(err)
    }
}

export const updateProyectoCompleto = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await ProyectoService.updateProyectoCompleto(id, req.body)
        res.json(result)
    } catch (err) {
        next(err)
    }
}
