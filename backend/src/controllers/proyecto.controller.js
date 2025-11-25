import { pool } from '../database/database.js'

export const getProyectoById = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ message: 'Error al obtener proyectos por ID' })
    }
}

// PROYECTO.CONTROLLER.JS

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

                -- Agregación de Locaciones (YA EXISTENTE)
                COALESCE(
                    JSON_AGG(DISTINCT l.nombre_locacion) FILTER (WHERE l.nombre_locacion IS NOT NULL),
                    '[]'
                ) as lista_locaciones,

                -- Agregación de RECURSOS ASIGNADOS (NUEVO)
                COALESCE(
                    JSON_AGG(
                        DISTINCT jsonb_build_object(
                            'id_recurso', rt.id_recurso,
                            'nombre_recurso', rt.nombre_equipo,       -- USANDO NOMBRE_EQUIPO (estricto)
                            'fecha_inicio_uso', ur.fecha_inicio_uso,  -- Campo de uso_recurso
                            'fecha_fin_uso', ur.fecha_fin_uso         -- Campo de uso_recurso
                        )
                    ) FILTER (WHERE ur.id_recurso IS NOT NULL),
                    '[]'
                ) AS recursos_asignados

            FROM proyectos pr

            -- JOINs de Tipos y Estados (YA EXISTENTES)
            LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
            LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto

            -- JOINs de Locaciones (YA EXISTENTES)
            LEFT JOIN proyecto_locaciones pl ON pr.id_proyecto = pl.id_proyecto
            LEFT JOIN locaciones l ON pl.id_locacion = l.id_locacion

            -- NUEVOS JOINs para Recursos Técnicos
            LEFT JOIN uso_recurso ur ON pr.id_proyecto = ur.id_proyecto
            LEFT JOIN recurso_tecnico rt ON ur.id_recurso = rt.id_recurso

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

            ORDER BY pr.id_proyecto DESC
            `
        )

        if (result.rows.length === 0) {
             return res.status(200).json([])
        }

        res.status(200).json(result.rows)
    } catch (err) {
        console.error('Error al obtener proyectos con recursos:', err);
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

export const desasignarLocacion = async (req, res) => {
    try {
        const { idProyecto, idLocacion } = req.params

        const result = await pool.query(
            'DELETE FROM proyecto_locaciones WHERE id_proyecto = $1 AND id_locacion = $2 RETURNING *',
            [idProyecto, idLocacion]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'La asignacion de locacion no fue encontrada' })
        }

        res.status(200).json({ message: 'Locacion desasignada del proyecto' })
    } catch (err) {
        console.error("Error en desasignar locacion:", err);
        res.status(500).json({ message: 'Error al desasignar una locacion del proyecto' })
    }
}

export const asignarRecurso = async (req, res) => {
    try {
        const { id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso } = req.body
        const values = [id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso]

        const result = await pool.query(
            'INSERT INTO uso_recurso (id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) VALUES ($1, $2, $3, $4) RETURNING *',
            values
        )

        res.status(201).json({
            message: 'Recurso tecnico asignado a proyecto',
            asignacion: result.rows[0]
        })
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ message: 'El proyecto o el recurso técnico no existe en la base de datos.' })
        }

        console.error('Error al asignar recurso tecnico');
        res.status(500).json({ message: 'Error al asignar un recurso tecnico a un proyecto' })
    }
}

export const desasignarRecurso = async (req, res) => {
    try {
        const { idProyecto, idRecurso } = req.params

        if (!idProyecto || !idRecurso) {
            return res.status(400).json({ message: 'Faltan campos.' })
        }

        const result = await pool.query(
            'DELETE FROM uso_recurso WHERE id_proyecto = $1 AND id_recurso = $2 RETURNING id_uso',
            [idProyecto, idRecurso]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignacion de recurso tecnico no encontrado' })
        }

        res.status(200).json({ message: 'Recurso tecnico desasignado de un proyecto' })
    } catch (err) {
        console.error('Error al desasignar recurso tecnico');
        res.status(500).json({ message: 'Error al desasignar un recurso tecnico de un proyecto' })
    }
}
