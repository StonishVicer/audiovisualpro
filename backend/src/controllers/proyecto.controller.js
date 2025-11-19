import { pool } from '../database/database.js'

export const getProyectoById = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ message: 'Error al obtener proyectos por ID' })
    }
}

export const getProyectos = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
            pr.id_proyecto,
            pr.nombre_proyecto,
            tp.id_tipo_proyecto,
            ep.id_estado_proyecto,
            pr.fecha_inicio,
            pr.fecha_fin_estimada,
            pr.presupuesto
            FROM proyectos pr
            LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
            LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto
            ORDER BY pr.id_proyecto ASC
            `
        )

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No hay proyectos creados' })
        }

        res.status(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener proyectos' })
    }
}

export const createProyecto = async (req, res) => {
    try {
        const { nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto } = req.body

        const result = await pool.query(
            `INSERT INTO proyectos (nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al crear proyecto' })
    }
}

export const deleteProyecto = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar proyectos' })
    }
}