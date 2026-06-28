import { pool } from '../config/database.js'

export const GastoModel = {
    findAll() {
        return pool.query(`
            SELECT g.*, cg.nombre_categoria FROM gastos g
            LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
            ORDER BY g.id_gasto DESC
        `)
    },
    findById(id) {
        return pool.query('SELECT * FROM gastos WHERE id_gasto = $1', [id])
    },
    create(fields) {
        const keys = Object.keys(fields)
        const placeholders = keys.map((_, i) => `$${i + 1}`)
        const values = keys.map(k => fields[k])
        return pool.query(
            `INSERT INTO gastos (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE gastos SET ${setClauses.join(', ')} WHERE id_gasto = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM gastos WHERE id_gasto = $1 RETURNING *', [id])
    }
}

export const CategoriaGastoModel = {
    findAll() {
        return pool.query('SELECT * FROM categorias_gasto ORDER BY id_categoria_gasto ASC')
    },
    findById(id) {
        return pool.query('SELECT * FROM categorias_gasto WHERE id_categoria_gasto = $1', [id])
    },
    create(nombre_categoria) {
        return pool.query('INSERT INTO categorias_gasto (nombre_categoria) VALUES ($1) RETURNING *', [nombre_categoria])
    },
    update(id, nombre_categoria) {
        return pool.query('UPDATE categorias_gasto SET nombre_categoria=$1 WHERE id_categoria_gasto=$2 RETURNING *', [nombre_categoria, id])
    },
    remove(id) {
        return pool.query('DELETE FROM categorias_gasto WHERE id_categoria_gasto = $1 RETURNING *', [id])
    },
    hasGastos(id) {
        return pool.query('SELECT COUNT(*) FROM gastos WHERE id_categoria_gasto = $1', [id])
    }
}

export const PagoModel = {
    findAll() {
        return pool.query('SELECT * FROM pagos_personal ORDER BY id_pago DESC')
    },
    findById(id) {
        return pool.query('SELECT * FROM pagos_personal WHERE id_pago = $1', [id])
    },
    create(fields) {
        const keys = Object.keys(fields)
        const placeholders = keys.map((_, i) => `$${i + 1}`)
        const values = keys.map(k => fields[k])
        return pool.query(
            `INSERT INTO pagos_personal (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        )
    },
    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE pagos_personal SET ${setClauses.join(', ')} WHERE id_pago = $${values.length} RETURNING *`,
            values
        )
    },
    remove(id) {
        return pool.query('DELETE FROM pagos_personal WHERE id_pago = $1 RETURNING *', [id])
    }
}
