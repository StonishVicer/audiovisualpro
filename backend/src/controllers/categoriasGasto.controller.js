import { CategoriaGastoModel } from '../models/gasto.js'

export const getCategoriaGastoByID = async (req, res) => {
    try {
        const result = await CategoriaGastoModel.findById(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar la categoria de gasto por ID: ' + err.message })
    }
}

export const getCategoriaGasto = async (req, res) => {
    try {
        const result = await CategoriaGastoModel.findAll()
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar las categorias de gastos: ' + err.message })
    }
}

export const createCategoriaGasto = async (req, res) => {
    try {
        if (!req.body.nombre_categoria) return res.status(400).json({ message: 'Falta un campo obligatorio' })
        const result = await CategoriaGastoModel.create(req.body.nombre_categoria)
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al crear la categoria de gasto: ' + err.message })
    }
}

export const deleteCategoriaGasto = async (req, res) => {
    try {
        const result = await CategoriaGastoModel.remove(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        res.json({ message: 'Categoria de gasto eliminada con exito' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar las categorias de gastos: ' + err.message })
    }
}

export const editCategoriaGasto = async (req, res) => {
    try {
        const { id } = req.params
        const checkResult = await CategoriaGastoModel.hasGastos(id)
        if (parseInt(checkResult.rows[0].count) > 0) {
            return res.status(409).json({ message: 'No se puede eliminar la categoria de gasto porque esta vinculada con un gasto' })
        }
        const result = await CategoriaGastoModel.update(id, req.body.nombre_categoria)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar la categoria de gasto: ' + err.message })
    }
}
