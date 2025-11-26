import { pool } from '../database/database.js'

// Obtener todas las asignaciones (con nombre de proyecto y nombre de personal)
export const getAsignacionesPersonal = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        a.id_asignacion,
        a.id_proyecto,
        a.id_personal,
        a.horas_trabajadas,
        a.fecha_registro,
        p.nombre_proyecto,
        per.nombre_personal
            FROM asignacion_personal a
            JOIN proyectos p ON a.id_proyecto = p.id_proyecto
            JOIN personal per ON a.id_personal = per.id_personal
            ORDER BY a.id_asignacion ASC`
        )

        return res.json(result.rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener las asignaciones' })
    }
}

// Obtener una asignación por ID
export const getAsignacionPersonalById = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            `SELECT 
        a.id_asignacion,
        a.id_proyecto,
        a.id_personal,
        a.horas_trabajadas,
        a.fecha_registro,
        p.nombre_proyecto,
        per.nombre_personal
            FROM asignacion_personal a
            JOIN proyectos p ON a.id_proyecto = p.id_proyecto
            JOIN personal per ON a.id_personal = per.id_personal
            WHERE a.id_asignacion = $1`,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' })
        }

        return res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener la asignación' })
    }
}

// Crear asignación
export const createAsignacionPersonal = async (req, res) => {
    try {
        const { id_proyecto, id_personal, horas_trabajadas } = req.body;

        const insertResult = await pool.query(
            `INSERT INTO asignacion_personal 
                (id_proyecto, id_personal, horas_trabajadas, fecha_registro)
             VALUES ($1, $2, $3, CURRENT_DATE)
             RETURNING id_asignacion`,
            [id_proyecto, id_personal, horas_trabajadas]
        );

        const id = insertResult.rows[0].id_asignacion;

        const result = await pool.query(
            `SELECT 
                a.id_asignacion,
                a.id_proyecto,
                a.id_personal,
                a.horas_trabajadas,
                a.fecha_registro,
                p.nombre_proyecto,
                per.nombre_personal
             FROM asignacion_personal a
             JOIN proyectos p ON a.id_proyecto = p.id_proyecto
             JOIN personal per ON a.id_personal = per.id_personal
             WHERE a.id_asignacion = $1`,
            [id]
        );

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al crear la asignación' });
    }
};


// Actualizar asignación
export const updateAsignacionPersonal = async (req, res) => {
    try {
        const { id } = req.params
        const { id_proyecto, id_personal, horas_trabajadas } = req.body

        const result = await pool.query(
            `UPDATE asignacion_personal
        SET id_proyecto = $1,
            id_personal = $2,
            horas_trabajadas = $3
        WHERE id_asignacion = $4
       RETURNING *`,
            [id_proyecto, id_personal, horas_trabajadas, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' })
        }

        const updated = await pool.query(
            `SELECT 
        a.id_asignacion,
        a.id_proyecto,
        a.id_personal,
        a.horas_trabajadas,
        a.fecha_registro,
        p.nombre_proyecto,
        per.nombre_personal
            FROM asignacion_personal a
            JOIN proyectos p ON a.id_proyecto = p.id_proyecto
            JOIN personal per ON a.id_personal = per.id_personal
            WHERE a.id_asignacion = $1`,
            [id]
        )

        return res.json(updated.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al actualizar la asignación' })
    }
}

// Eliminar asignación
export const deleteAsignacionPersonal = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            'DELETE FROM asignacion_personal WHERE id_asignacion = $1 RETURNING *',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' })
        }

        return res.json({ message: 'Asignación eliminada correctamente' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al eliminar la asignación' })
    }
}

// Obtener todas las asignaciones de un proyecto específico
export const getAsignacionesPorProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params

        const result = await pool.query(
            `SELECT 
        a.id_asignacion,
        a.id_proyecto,
        a.id_personal,
        a.horas_trabajadas,
        a.fecha_registro,
        p.nombre_proyecto,
        per.nombre_personal
            FROM asignacion_personal a
            JOIN proyectos p ON a.id_proyecto = p.id_proyecto
            JOIN personal per ON a.id_personal = per.id_personal
            WHERE a.id_proyecto = $1
            ORDER BY a.id_asignacion ASC`,
            [idProyecto]
        )

        return res.json(result.rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: 'Error al obtener las asignaciones del proyecto'
        })
    }
}
