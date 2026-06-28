import { pool } from '../config/database.js'

export const ClienteModel = {
    findAll() {
        return pool.query('SELECT * FROM clientes ORDER BY id_cliente ASC')
    },

    findById(id) {
        return pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id])
    },

    create({ rif_cliente, nombre_cliente, email_cliente, telefono_cliente }) {
        return pool.query(
            'INSERT INTO clientes (rif_cliente, nombre_cliente, email_cliente, telefono_cliente) VALUES ($1, $2, $3, $4) RETURNING *',
            [rif_cliente, nombre_cliente, email_cliente, telefono_cliente]
        )
    },

    update(id, fields) {
        const keys = Object.keys(fields)
        const setClauses = keys.map((k, i) => `${k} = $${i + 1}`)
        const values = keys.map(k => fields[k])
        values.push(id)
        return pool.query(
            `UPDATE clientes SET ${setClauses.join(', ')} WHERE id_cliente = $${values.length} RETURNING *`,
            values
        )
    },

    remove(id) {
        return pool.query('DELETE FROM clientes WHERE id_cliente = $1 RETURNING *', [id])
    },

    hasContratos(id) {
        return pool.query('SELECT COUNT(*) FROM contratos WHERE id_cliente = $1', [id])
    }
}
