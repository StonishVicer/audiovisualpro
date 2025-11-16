import { pool } from "../database/database.js";

export const getTipoRecursoById = async (req, res) => {

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
            'INSERTO INTO tipos_recurso (nombre_tipo) VALUES ($1) RETURNING 8',
            [nombre_tipo]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear tipo de recurso' })
    }
}

export const deleteTipoRecurso = async (req, res) => {

}
