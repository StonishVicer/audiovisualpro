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
                tp.nombre_tipo,
                ep.nombre_estado,
                pr.fecha_inicio,
                pr.fecha_fin_estimada,
                pr.presupuesto,
                COALESCE(
                    JSON_AGG(l.nombre_locacion) FILTER (WHERE l.nombre_locacion IS NOT NULL),
                    '[]'
                ) as lista_locaciones
            FROM proyectos pr
            LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
            LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto
            LEFT JOIN proyecto_locaciones pl ON pr.id_proyecto = pl.id_proyecto
            LEFT JOIN locaciones l ON pl.id_locacion = l.id_locacion

            GROUP BY
                pr.id_proyecto,
                pr.nombre_proyecto,
                tp.id_tipo_proyecto,
                ep.id_estado_proyecto,
                tp.nombre_tipo,
                ep.nombre_estado,
                pr.fecha_inicio,
                pr.fecha_fin_estimada,
                pr.presupuesto

            ORDER BY pr.id_proyecto DESC -- Puse DESC para que el nuevo salga primero
            `
        )

        if (result.rows.length === 0) {
             return res.status(200).json([])
        }

        res.status(200).json(result.rows)
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

export const asignarLocacion = async (req, res) => {
    try {
        const { id_proyecto, id_locacion } = req.body

        await pool.query(
            'INSERT INTO proyecto_locaciones (id_proyecto, id_locacion) VALUES ($1, $2)',
            [id_proyecto, id_locacion]
        )

        res.status(200).json({ message: 'Locacion asignada correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al asignar una locacion al proyecto' })
    }
}
