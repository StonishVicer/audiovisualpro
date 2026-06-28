import { pool } from '../config/database.js'

export const FacturaService = {
    async getAll() {
        const result = await pool.query(`
            SELECT f.*, c.nombre_cliente, p.nombre_proyecto
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id_cliente
            LEFT JOIN contratos cont ON f.id_contrato = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            ORDER BY f.fecha_factura DESC
        `)
        const facturas = result.rows
        for (const fact of facturas) {
            const itemsRes = await pool.query('SELECT * FROM factura_items WHERE factura_id = $1', [fact.id_factura])
            fact.items = itemsRes.rows
        }
        return facturas
    },

    async create(facturaData) {
        const client = await pool.connect()
        try {
            const { numero_factura, fecha_factura, contrato_id, items, subtotal, total, estado, notas } = facturaData
            const clienteId = parseInt(facturaData.cliente_id)
            const contratoId = contrato_id ? parseInt(contrato_id) : null
            const subtotalF = parseFloat(subtotal) || 0
            const totalF = parseFloat(total) || 0

            await client.query('BEGIN')

            const resFact = await client.query(`
                INSERT INTO facturas (numero_factura, fecha_factura, cliente_id, id_contrato, subtotal, total, estado, notas)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
            `, [numero_factura, fecha_factura, clienteId, contratoId, subtotalF, totalF, estado, notas])

            const newFactura = resFact.rows[0]

            if (items && items.length > 0) {
                for (const item of items) {
                    await client.query(
                        'INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
                        [newFactura.id_factura, item.descripcion, item.cantidad || 1, item.precio_unitario]
                    )
                }
            }

            await client.query('COMMIT')
            return { ...newFactura, items }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    },

    async update(id, facturaData) {
        const client = await pool.connect()
        try {
            const { numero_factura, fecha_factura, contrato_id, items, subtotal, total, estado, notas } = facturaData
            const clienteId = parseInt(facturaData.cliente_id)
            const contratoId = contrato_id ? parseInt(contrato_id) : null
            const subtotalF = parseFloat(subtotal) || 0
            const totalF = parseFloat(total) || 0

            await client.query('BEGIN')

            const result = await client.query(`
                UPDATE facturas SET numero_factura=$1, fecha_factura=$2, cliente_id=$3, id_contrato=$4,
                subtotal=$5, total=$6, estado=$7, notas=$8 WHERE id_factura=$9 RETURNING *
            `, [numero_factura, fecha_factura, clienteId, contratoId, subtotalF, totalF, estado, notas, id])

            if (result.rows.length === 0) {
                await client.query('ROLLBACK')
                return null
            }

            await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id])

            if (items && items.length > 0) {
                for (const item of items) {
                    await client.query(
                        'INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
                        [id, item.descripcion, item.cantidad || 1, item.precio_unitario]
                    )
                }
            }

            await client.query('COMMIT')
            return result.rows[0]
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    },

    async delete(id) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id])
            const result = await client.query('DELETE FROM facturas WHERE id_factura = $1 RETURNING *', [id])
            if (result.rows.length === 0) {
                await client.query('ROLLBACK')
                return false
            }
            await client.query('COMMIT')
            return true
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}
