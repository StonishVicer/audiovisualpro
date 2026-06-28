import { pool } from '../config/database.js'

export const ProyectoModel = {
    findAll() {
        return pool.query(`
            SELECT pr.*, tp.nombre_tipo, ep.nombre_estado
            FROM proyectos pr
            LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
            LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto
            ORDER BY pr.id_proyecto DESC
        `)
    },

    findById(id) {
        return pool.query(`
            SELECT pr.*, tp.nombre_tipo, ep.nombre_estado
            FROM proyectos pr
            LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
            LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto
            WHERE pr.id_proyecto = $1
        `, [id])
    },

    create({ nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto }) {
        return pool.query(
            `INSERT INTO proyectos (nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto]
        )
    },

    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE proyectos SET ${setClauses.join(', ')} WHERE id_proyecto = $${values.length} RETURNING *`,
            values
        )
    },

    remove(id) {
        return pool.query('DELETE FROM proyectos WHERE id_proyecto = $1 RETURNING *', [id])
    }
}
