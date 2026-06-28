import { pool } from '../config/database.js'

export const FacturaModel = {
    findAll() {
        return pool.query(`
            SELECT f.*, c.nombre_cliente, p.nombre_proyecto
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id_cliente
            LEFT JOIN contratos cont ON f.id_contrato = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            ORDER BY f.fecha_factura DESC
        `)
    },

    findById(id) {
        return pool.query('SELECT * FROM facturas WHERE id_factura = $1', [id])
    },

    findItems(facturaId) {
        return pool.query('SELECT * FROM factura_items WHERE factura_id = $1', [facturaId])
    },

    createWithItems(client, factura, items) {
        return client.query(`
            INSERT INTO facturas (numero_factura, fecha_factura, cliente_id, id_contrato, subtotal, total, estado, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `, [factura.numero_factura, factura.fecha_factura, factura.cliente_id, factura.id_contrato,
            factura.subtotal || 0, factura.total || 0, factura.estado, factura.notas])
    },

    createItem(client, facturaId, item) {
        return client.query(
            'INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
            [facturaId, item.descripcion, item.cantidad || 1, item.precio_unitario]
        )
    },

    update(client, id, fields) {
        return client.query(`
            UPDATE facturas SET numero_factura=$1, fecha_factura=$2, cliente_id=$3, id_contrato=$4,
            subtotal=$5, total=$6, estado=$7, notas=$8 WHERE id_factura=$9 RETURNING *
        `, [fields.numero_factura, fields.fecha_factura, fields.cliente_id, fields.id_contrato,
            fields.subtotal, fields.total, fields.estado, fields.notas, id])
    },

    clearItems(client, facturaId) {
        return client.query('DELETE FROM factura_items WHERE factura_id = $1', [facturaId])
    },

    remove(client, id) {
        return client.query('DELETE FROM facturas WHERE id_factura = $1 RETURNING *', [id])
    }
}
