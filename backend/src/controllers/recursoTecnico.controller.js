import { pool } from "../database/database.js";

export const getRecursoTecnicoById = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query("SELECT rt.id_recurso, rt.nombre_equipo, tr.nombre_tipo FROM recurso tecnico rt JOIN tipos_recurso tr ON rt.id_tipo_recurso = tr.id_tipo_recurso WHERE rt.id_recurso = $1", [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Recurso tecnico no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el recurso tecnico por ID' })
    }
}

export const getRecursosTecnicos = async (req, res) => {
    try {
        const query = `
            SELECT rt.id_recurso, rt.nombre_equipo, tr.nombre_tipo FROM recurso_tecnico rt JOIN tipos_recurso tr ON rt.id_tipo_recurso = tr.id_tipo_recurso ORDER BY rt.id_recurso ASC
        `

        const result = await pool.query(query)

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron recursos tecnicos' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los recursos tecnicos' })
    }
}

export const createRecursoTecnico = async (req, res) => {
    try {
        const { nombre_equipo, id_tipo_recurso } = req.body

        const result = await pool.query(
            'INSERT INTO recurso_tecnico (nombre_equipo, id_tipo_recurso) VALUES ($1, $2) RETURNING *',
            [nombre_equipo, id_tipo_recurso]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear recurso tecnico' })
    }
}

export const deleteRecursoTecnico = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query('DELETE FROM recurso_tecnico WHERE id_recurso = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Recurso tecnico no encontrado' })
        }

        res.json({ message: 'Recurso tecnico eliminado con exito' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el recurso tecnico' })
    }
}

export const updateRecursoTecnico = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_equipo, id_tipo_recurso } = req.body;

        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM uso_recurso WHERE id_recurso = $1',
            [id]
        )

        const count = parseInt(checkResult.rows[0].count)

        if (count > 0) {
            return res.status(409).json({ message: 'No se puede editar el recurso tecnico, esta vinculado a un proyecto.' })
        }

        const result = await pool.query(
            'UPDATE recurso_tecnico SET nombre_equipo = $1, id_tipo_recurso = $2 WHERE id_recurso = $3 RETURNING *',
            [nombre_equipo, id_tipo_recurso, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Recurso técnico no encontrado para actualizar' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar recurso técnico:', err);
        return res.status(500).json({ message: 'Error al actualizar el recurso técnico' });
    }
}