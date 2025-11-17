import { pool } from '../database/database.js'

export const getEstadoProyectoById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM estados_proyecto WHERE id_estado_proyecto = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estado de proyecto no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el estado de proyecto por ID' })
    }
}

export const getEstadosProyecto = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estados_proyecto ORDER BY id_estado_proyecto ASC')
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron estados de proyecto' })
        }
        
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los estados de proyecto' })
    }
}

export const createEstadoProyecto = async (req, res) => {
    try {
        const { nombre_estado } = req.body

        const result = await pool.query(
            'INSERT INTO estados_proyecto (nombre_estado) VALUES ($1) RETURNING *',
            [nombre_estado]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear el estado de proyecto' })
    }
}

export const deleteEstadoProyecto = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM estados_proyecto WHERE id_estado_proyecto = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Estado de proyecto no encontrado' })
        }

        res.json({ message: 'Estado de proyecto eliminado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el estado de proyecto' })
    }
}