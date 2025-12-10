import { pool } from "../database/database.js";

export const getTipoRecursoById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM tipos_recurso WHERE id_tipo_recurso = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de recurso no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el tipo de recurso por ID'})
    }
}

export const getTiposRecurso = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_recurso ORDER BY id_tipo_recurso ASC')

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron tipos de recursos' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los tipos de recursos' })
    }
}

export const createTipoRecurso = async (req, res) => {
    try {
        const { nombre_tipo } = req.body

        const result = await pool.query(
            'INSERT INTO tipos_recurso (nombre_tipo) VALUES ($1) RETURNING *',
            [nombre_tipo]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear tipo de recurso' })
    }
}

export const deleteTipoRecurso = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM tipos_recurso WHERE id_tipo_recurso = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Tipo de recurso no encontrado' })
        }

        res.json({ message: 'Tipo de recurso eliminado correctamente' })
    } catch (err) {
        if (err.code === '23503') {
            console.error('Intento fallido al eliminar el tipo de recurso con dependencias:', err.detail)
            res.status(409).json({ message: 'No se puede eliminar el tipo de recurso. Existen recursos tecnicos que dependen de el.' })
        }
        res.status(500).json({ message: 'Error al eliminar el tipo de recurso' })
    }
}

export const updateTipoRecurso = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre_tipo } = req.body

        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM recurso_tecnico WHERE id_tipo_recurso = $1',
            [id]
        )

        const count = parseInt(checkResult.rows[0].count)

        if (count > 0) {
            return res.status(409).json({ message: `No se puede editar el tipo de recurso. Está asignada a ${count} recurso(s).` })
        }

        const result = await pool.query(
            'UPDATE tipos_recurso SET nombre_tipo = $1 WHERE id_tipo_recurso = $2 RETURNING *',
            [nombre_tipo, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message : 'No se pudo encontrar el tipo de recurso' })
        }

        return res.json(result.rows[0])
    } catch (err) {
        console.error('Error al editar el tipo de recurso')
        res.status(500).json({ message: 'Error al editar el tipo de recurso tecnico' })
    }
}