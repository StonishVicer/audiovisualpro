import { pool } from '../database/database.js'

export const getCategoriaGastoByID = async (req, res) => {
    try {
        const { id } = req.params

        const result = pool.query('SELECT * FROM categorias_gasto WHERE id_categoria_gasto = $1', [id])

        if(result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar la categoria de gasto por ID' || err.message })
    }
}

export const getCategoriaGasto = async (req, res) => {
    try {
        const result = pool.query('SELECT * FROM categorias_gasto ORDER BY id_categoria_gasto ASC')

        if(result.rows.length === 0) {
            return res.status(404).json({ message: 'No se pudieron encontrar categorias de gastos' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar las categorias de gastos' || err.message })
    }
}

export const createCategoriaGasto = async (req, res) => {
    try {
        const { nombre_categoria } = req.body

        if (!nombre_categoria) {
            return res.status(400).json({ message: 'Falta un campo obligatorio' })
        }

        const result = await pool.query(
            'INSERT INTO categorias_gasto (nombre_categoria) VALUES ($1) RETURNING *',
            [nombre_categoria]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al crear la categoria de gasto' || err.message })
    }
}

export const deleteCategoriaGasto = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query('DELETE FROM categorias_gasto WHERE id_categoria_gasto = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        }

        res.json({ message: 'Categoria de gasto eliminada con exito' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar las categorias de gastos' || err.message })
    }
}

export const editCategoriaGasto = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre_categoria } = req.body
        
        const checkResult = await pool.query('SELECT COUNT(*) FROM gastos WHERE id_categoria_gasto = $1', [id])

        const count = parseInt(checkResult.rows[0].count)

        if (count > 0) {
            return res.status(409).json({ message: 'No se puede eliminar la categoria de gasto porque esta vinculada con un gasto' })
        }

        const result = await pool.query('UPDATE categorias_gasto SET nombre_categoria = $1 WHERE id_categoria_gasto = $2 RETURNING *', [nombre_categoria, id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoria de gasto no encontrada' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar la categoria de gasto' || err.message })
    }
}