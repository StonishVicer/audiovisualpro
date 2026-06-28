import { pool } from '../config/database.js'

export const EntregableModel = {
    findAll() {
        return pool.query('SELECT * FROM entregables ORDER BY id_entregable DESC')
    },
    findById(id) {
        return pool.query('SELECT * FROM entregables WHERE id_entregable = $1', [id])
    },
    create({ id_proyecto, descripcion, fecha_entrega_estimada, id_estado_entregable, link_entrega }) {
        return pool.query(
            `INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada, id_estado_entregable, link_entrega)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_proyecto, descripcion, fecha_entrega_estimada || null, id_estado_entregable || null, link_entrega || null]
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE entregables SET ${setClauses.join(', ')} WHERE id_entregable = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM entregables WHERE id_entregable = $1 RETURNING *', [id])
    }
}

export const EstadoEntregableModel = {
    findAll() {
        return pool.query('SELECT * FROM estados_entregable ORDER BY id_estado_entregable ASC')
    },
    findById(id) {
        return pool.query('SELECT * FROM estados_entregable WHERE id_estado_entregable = $1', [id])
    },
    create(fields) {
        const keys = Object.keys(fields)
        const placeholders = keys.map((_, i) => `$${i + 1}`)
        const values = keys.map(k => fields[k])
        return pool.query(
            `INSERT INTO estados_entregable (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE estados_entregable SET ${setClauses.join(', ')} WHERE id_estado_entregable = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM estados_entregable WHERE id_estado_entregable = $1 RETURNING *', [id])
    }
}
