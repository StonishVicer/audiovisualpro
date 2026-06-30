import { pool } from '../config/database.js'

export const ContratoModel = {
    findAll() {
        return pool.query(`
            SELECT c.*, cli.nombre_cliente, cli.rif_cliente, pro.nombre_proyecto
            FROM contratos c
            LEFT JOIN clientes cli ON c.id_cliente = cli.id_cliente
            LEFT JOIN proyectos pro ON c.id_proyecto = pro.id_proyecto
            ORDER BY c.id_contrato DESC
        `)
    },

    findById(id) {
        return pool.query('SELECT * FROM contratos WHERE id_contrato = $1', [id])
    },

    create({ id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios }) {
        return pool.query(
            `INSERT INTO contratos (id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios]
        )
    },

    update(id, { id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios }) {
        return pool.query(
            `UPDATE contratos SET id_proyecto=$1, id_cliente=$2, fecha_firma=$3,
             monto_contrato=$4, descripcion_servicios=$5 WHERE id_contrato=$6 RETURNING *`,
            [id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios, id]
        )
    },

    remove(id) {
        return pool.query('DELETE FROM contratos WHERE id_contrato = $1 RETURNING *', [id])
    }
}
