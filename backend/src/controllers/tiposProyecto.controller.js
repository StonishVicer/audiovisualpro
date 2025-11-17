import { pool } from '../database/database.js'

export const getTipoProyectoById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM tipos_proyecto WHERE id_tipo_proyecto = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de proyecto no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el tipo de proyecto por ID'})
    }
}

export const getTiposProyecto = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_proyecto ORDER BY id_tipo_proyecto ASC')

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron tipos de proyecto' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los tipos de proyecto' })
    }
}

export const createTipoProyecto = async (req, res) => {
    try {
        const { nombre_tipo } = req.body

        const result = await pool.query(
            'INSERT INTO tipos_proyecto (nombre_tipo) VALUES ($1) RETURNING *',
            [nombre_tipo]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear el tipo de proyecto' })
    }
}

export const deleteTipoProyecto = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM tipos_proyecto WHERE id_tipo_proyecto = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Tipo de proyecto no encontrado' })
        }

        res.json({ message: 'Tipo de proyecto eliminado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el tipo de proyecto' })
    }
}