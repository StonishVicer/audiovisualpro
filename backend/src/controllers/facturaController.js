import { pool } from "../database/database.js";

// GET ALL
export const getFacturas = async (req, res) => {
    try {
        const query = `
            SELECT f.*, 
                   c.nombre_cliente, 
                   cont.descripcion_servicios as contrato_desc,
                   p.nombre_proyecto
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id_cliente
            LEFT JOIN contratos cont ON f.id_contrato = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            ORDER BY f.fecha_factura DESC
        `;
        const result = await pool.query(query);
        const facturas = result.rows;

        // Cargar items de cada factura
        for (let fact of facturas) {
            const itemsRes = await pool.query('SELECT * FROM factura_items WHERE factura_id = $1', [fact.id_factura]);
            fact.items = itemsRes.rows;
        }


        res.json(facturas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener las facturas" });
    }
}

// CREATE (Blindado)
export const createFactura = async (req, res) => {
    const client = await pool.connect();

    try {
        const { numero_factura, fecha_factura, cliente_id, contrato_id, items, subtotal, total, estado, notas } = req.body;

        // BLINDAJE DE TIPOS (Evita errores de sintaxis SQL)
        const clienteIdFinal = parseInt(cliente_id);
        const contratoIdFinal = (contrato_id) ? parseInt(contrato_id) : null;
        const subtotalFinal = parseFloat(subtotal) || 0;
        const totalFinal = parseFloat(total) || 0;

        await client.query('BEGIN');

        // Insertar Factura
        const resFact = await client.query(`
            INSERT INTO facturas 
            (numero_factura, fecha_factura, cliente_id, id_contrato, subtotal, total, estado, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [numero_factura, fecha_factura, clienteIdFinal, contratoIdFinal, subtotalFinal, totalFinal, estado, notas]);

        const newFactura = resFact.rows[0];

        // Insertar Items
        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(`
                    INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `, [newFactura.id_factura, item.descripcion, item.cantidad || 1, item.precio_unitario]);
            }
        }

        await client.query('COMMIT');

        // Devolvemos la factura creada + los items para el front
        res.status(201).json({ ...newFactura, items });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error Create Factura:", err);
        res.status(500).json({ message: "Error al crear la factura", error: err.message });
    } finally {
        client.release();
    }
}

// UPDATE (Blindado)
export const updateFactura = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { numero_factura, fecha_factura, cliente_id, contrato_id, items, subtotal, total, estado, notas } = req.body;

        // BLINDAJE DE TIPOS
        const clienteIdFinal = parseInt(cliente_id);
        const contratoIdFinal = (contrato_id) ? parseInt(contrato_id) : null;
        const subtotalFinal = parseFloat(subtotal) || 0;
        const totalFinal = parseFloat(total) || 0;

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE facturas SET 
                numero_factura = $1, 
                fecha_factura = $2, 
                cliente_id = $3, 
                id_contrato = $4,
                subtotal = $5, 
                total = $6, 
                estado = $7, 
                notas = $8
            WHERE id_factura = $9
            RETURNING *
        `, [numero_factura, fecha_factura, clienteIdFinal, contratoIdFinal, subtotalFinal, totalFinal, estado, notas, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        // Reemplazar items (Borrar y crear)
        await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id]);

        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(`
                    INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `, [id, item.descripcion, item.cantidad || 1, item.precio_unitario]);
            }
        }

        await client.query('COMMIT');
        res.json({ message: "Actualizado", factura: result.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error Update Factura:", err);
        res.status(500).json({ message: "Error al actualizar", error: err.message });
    } finally {
        client.release();
    }
}

// DELETE
export const deleteFactura = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id]);
        const resDel = await client.query('DELETE FROM facturas WHERE id_factura = $1 RETURNING *', [id]);

        if (resDel.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        await client.query('COMMIT');
        res.json({ message: "Eliminada correctamente" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: "Error al eliminar" });
    } finally {
        client.release();
    }
}