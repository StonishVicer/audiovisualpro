import { pool } from '../config/database.js'

export const LocacionModel = {
    findAll() {
        return pool.query('SELECT * FROM locaciones ORDER BY id_locacion ASC')
    },
    findById(id) {
        return pool.query('SELECT * FROM locaciones WHERE id_locacion = $1', [id])
    },
    create(fields) {
        const keys = Object.keys(fields)
        const placeholders = keys.map((_, i) => `$${i + 1}`)
        const values = keys.map(k => fields[k])
        return pool.query(
            `INSERT INTO locaciones (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE locaciones SET ${setClauses.join(', ')} WHERE id_locacion = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM locaciones WHERE id_locacion = $1 RETURNING *', [id])
    }
}

export const RecursoTecnicoModel = {
    findAll() {
        return pool.query(`
            SELECT rt.id_recurso, rt.nombre_equipo, tr.nombre_tipo
            FROM recurso_tecnico rt
            JOIN tipos_recurso tr ON rt.id_tipo_recurso = tr.id_tipo_recurso
            ORDER BY rt.id_recurso ASC
        `)
    },
    findById(id) {
        return pool.query(`
            SELECT rt.id_recurso, rt.nombre_equipo, tr.nombre_tipo
            FROM recurso_tecnico rt
            JOIN tipos_recurso tr ON rt.id_tipo_recurso = tr.id_tipo_recurso
            WHERE rt.id_recurso = $1
        `, [id])
    },
    create({ nombre_equipo, id_tipo_recurso }) {
        return pool.query(
            'INSERT INTO recurso_tecnico (nombre_equipo, id_tipo_recurso) VALUES ($1, $2) RETURNING *',
            [nombre_equipo, id_tipo_recurso]
        )
    },
    update(id, { nombre_equipo, id_tipo_recurso }) {
        return pool.query(
            'UPDATE recurso_tecnico SET nombre_equipo=$1, id_tipo_recurso=$2 WHERE id_recurso=$3 RETURNING *',
            [nombre_equipo, id_tipo_recurso, id]
        )
    },
    remove(id) {
        return pool.query('DELETE FROM recurso_tecnico WHERE id_recurso = $1 RETURNING *', [id])
    },
    hasUsos(id) {
        return pool.query('SELECT COUNT(*) FROM uso_recurso WHERE id_recurso = $1', [id])
    }
}

export const TipoRecursoModel = {
    findAll() { return pool.query('SELECT * FROM tipos_recurso ORDER BY id_tipo_recurso ASC') },
    findById(id) { return pool.query('SELECT * FROM tipos_recurso WHERE id_tipo_recurso = $1', [id]) },
    create(nombre_tipo) { return pool.query('INSERT INTO tipos_recurso (nombre_tipo) VALUES ($1) RETURNING *', [nombre_tipo]) },
    update(id, nombre_tipo) { return pool.query('UPDATE tipos_recurso SET nombre_tipo=$1 WHERE id_tipo_recurso=$2 RETURNING *', [nombre_tipo, id]) },
    remove(id) { return pool.query('DELETE FROM tipos_recurso WHERE id_tipo_recurso = $1 RETURNING *', [id]) }
}
