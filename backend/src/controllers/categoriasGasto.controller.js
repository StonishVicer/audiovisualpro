import { CategoriaGastoService } from '../services/gastoService.js'

export const getCategoriaGastoByID = async (req, res, next) => {
    try {
        const categoria = await CategoriaGastoService.findById(req.params.id)
        res.json(categoria)
    } catch (err) { next(err) }
}

export const getCategoriaGasto = async (req, res, next) => {
    try {
        const categorias = await CategoriaGastoService.findAll()
        res.json(categorias)
    } catch (err) { next(err) }
}

export const createCategoriaGasto = async (req, res, next) => {
    try {
        const categoria = await CategoriaGastoService.create(req.body.nombre_categoria)
        res.status(201).json(categoria)
    } catch (err) { next(err) }
}

export const deleteCategoriaGasto = async (req, res, next) => {
    try {
        const result = await CategoriaGastoService.remove(req.params.id)
        res.json(result)
    } catch (err) { next(err) }
}

export const editCategoriaGasto = async (req, res, next) => {
    try {
        const categoria = await CategoriaGastoService.update(req.params.id, req.body.nombre_categoria)
        res.json(categoria)
    } catch (err) { next(err) }
}
