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
    const { nombre_estado, descripcion_estado, color_estado } = req.body
    try {
        console.log('POST /api/estadosentregable body:', req.body)
        if (!nombre_estado || !nombre_estado.toString().trim()) {
            return res.status(400).json({ message: 'El nombre del estado es obligatorio' })
        }
        try {
            const result = await pool.query(
                'INSERT INTO estados_entregable (nombre_estado, descripcion_estado, color_estado) VALUES ($1, $2, $3) RETURNING *',
                [nombre_estado, descripcion_estado || null, color_estado || null]
            )
            return res.status(201).json(result.rows[0])
        } catch (innerErr) {
            console.warn('Insert con 3 columnas falló, intentando solo nombre_estado:', innerErr.message)
            const result = await pool.query(
                'INSERT INTO estados_entregable (nombre_estado) VALUES ($1) RETURNING *',
                [nombre_estado]
            )
            return res.status(201).json(result.rows[0])
        }
    } catch (err) {
        console.error('Error creando estado entregable:', err)
        return res.status(500).json({ message: err.message })
    }
}

export const updateEstado = async (req, res) => {
    const { id } = req.params
    const { nombre_estado, descripcion_estado, color_estado } = req.body
    try {
        try {
            const result = await pool.query(
                'UPDATE estados_entregable SET nombre_estado = $1, descripcion_estado = $2, color_estado = $3 WHERE id_estado_entregable = $4 RETURNING *',
                [nombre_estado, descripcion_estado || null, color_estado || null, id]
            )
            if (result.rows.length === 0) return res.status(404).json({ message: 'Estado no encontrado' })
            return res.json(result.rows[0])
        } catch (innerErr) {
            console.warn('Update con 3 columnas falló, intentando solo nombre_estado:', innerErr.message)
            const result = await pool.query(
                'UPDATE estados_entregable SET nombre_estado = $1 WHERE id_estado_entregable = $2 RETURNING *',
                [nombre_estado, id]
            )
            if (result.rows.length === 0) return res.status(404).json({ message: 'Estado no encontrado' })
            return res.json(result.rows[0])
        }
    } catch (err) {
        console.error('Error actualizando estado entregable:', err)
        return res.status(500).json({ message: err.message })
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