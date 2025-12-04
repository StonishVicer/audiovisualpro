import { pool } from '../database/database.js'

export const getEstados = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estados_entregable')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const createEstado = async (req, res) => {
    const { nombre_estado } = req.body
    try {
        const result = await pool.query(
            'INSERT INTO estados_entregable (nombre_estado) VALUES ($1) RETURNING *',
            [nombre_estado]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteEstado = async (req, res) => {
    const { id } = req.params
    try {
        await pool.query('DELETE FROM estados_entregable WHERE id_estado_entregable = $1', [id])
        res.json({ message: 'Eliminado' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}