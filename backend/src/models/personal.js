import { pool } from '../config/database.js'

export const PersonalModel = {
    findAll() {
        return pool.query(`
            SELECT p.*, rp.nombre_rol FROM personal p
            LEFT JOIN roles_personal rp ON p.id_rol = rp.id_rol
            ORDER BY p.id_personal ASC
        `)
    },
    findById(id) {
        return pool.query('SELECT * FROM personal WHERE id_personal = $1', [id])
    },
    create(fields) {
        const keys = Object.keys(fields)
        const placeholders = keys.map((_, i) => `$${i + 1}`)
        const values = keys.map(k => fields[k])
        return pool.query(
            `INSERT INTO personal (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE personal SET ${setClauses.join(', ')} WHERE id_personal = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM personal WHERE id_personal = $1 RETURNING *', [id])
    }
}

export const AsignacionModel = {
    findAll() {
        return pool.query('SELECT * FROM asignacion_personal ORDER BY id_asignacion DESC')
    },
    findById(id) {
        return pool.query('SELECT * FROM asignacion_personal WHERE id_asignacion = $1', [id])
    },
    findByProyecto(idProyecto) {
        return pool.query('SELECT * FROM asignacion_personal WHERE id_proyecto = $1', [idProyecto])
    },
    create({ id_proyecto, id_personal, horas_trabajadas, fecha_registro }) {
        return pool.query(
            'INSERT INTO asignacion_personal (id_proyecto, id_personal, horas_trabajadas, fecha_registro) VALUES ($1,$2,$3,$4) RETURNING *',
            [id_proyecto, id_personal, horas_trabajadas, fecha_registro || new Date().toISOString().slice(0, 10)]
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE asignacion_personal SET ${setClauses.join(', ')} WHERE id_asignacion = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM asignacion_personal WHERE id_asignacion = $1 RETURNING *', [id])
    }
}
