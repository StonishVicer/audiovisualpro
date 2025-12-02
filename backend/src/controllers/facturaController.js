import { pool } from "../database/database.js";

// --- OBTENER LISTA DE FACTURAS (Tu código) ---
export const getFacturas = async (req, res) => {
    try {
        const query = `
            SELECT f.*, 
                   c.nombre_cliente, 
                   c.rif_cliente,
                   cont.descripcion_servicios as contrato_desc,
                   p.nombre_proyecto
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id_cliente
            LEFT JOIN contratos cont ON f.contrato_id = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            ORDER BY f.fecha_factura DESC
        `;
        
        const result = await pool.query(query);

        if (result.rows.length === 0) return res.json([]);

        const facturas = result.rows;

        for (let fact of facturas) {
            const itemsResult = await pool.query(
                'SELECT * FROM factura_items WHERE factura_id = $1', 
                [fact.id_factura]
            );
            fact.items = itemsResult.rows;
        }

        res.json(facturas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener las facturas" });
    }
}

// --- OBTENER FACTURA POR ID (Actualizado con JOINs) ---
export const getFacturaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT f.*, 
                   c.nombre_cliente, 
                   c.rif_cliente,
                   cont.descripcion_servicios as contrato_desc,
                   p.nombre_proyecto
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id_cliente
            LEFT JOIN contratos cont ON f.contrato_id = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            WHERE f.id_factura = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        const factura = result.rows[0];

        // Obtener items
        const itemsResult = await pool.query('SELECT * FROM factura_items WHERE factura_id = $1', [id]);
        factura.items = itemsResult.rows;

        res.json(factura);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener la factura por ID" });
    }
}

// --- CREAR FACTURA (Tu código) ---
export const createFactura = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { numero_factura, fecha_factura, cliente_id, contrato_id, items, impuesto_porcentaje, subtotal, total, estado, notas } = req.body;

        await client.query('BEGIN');

        const resultFactura = await client.query(`
            INSERT INTO facturas 
            (numero_factura, fecha_factura, cliente_id, contrato_id, impuesto_porcentaje, subtotal, total, estado, notas)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [numero_factura, fecha_factura, cliente_id, contrato_id, impuesto_porcentaje, subtotal, total, estado, notas]);

        const facturaCreada = resultFactura.rows[0];

        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(`
                    INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `, [facturaCreada.id_factura, item.descripcion, item.cantidad, item.precio_unitario]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ ...facturaCreada, items });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: "Error al crear la factura" });
    } finally {
        client.release();
    }
}

// --- ACTUALIZAR FACTURA (Actualizado para incluir contrato_id) ---
export const updateFactura = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        // Agregamos contrato_id al destructuring
        const { numero_factura, fecha_factura, cliente_id, contrato_id, items, impuesto_porcentaje, subtotal, total, estado, notas } = req.body;

        await client.query('BEGIN');

        // Actualizamos incluyendo contrato_id
        const result = await client.query(`
            UPDATE facturas SET 
                numero_factura = $1, 
                fecha_factura = $2, 
                cliente_id = $3, 
                contrato_id = $4,
                impuesto_porcentaje = $5, 
                subtotal = $6, 
                total = $7, 
                estado = $8, 
                notas = $9
            WHERE id_factura = $10
            RETURNING *
        `, [numero_factura, fecha_factura, cliente_id, contrato_id, impuesto_porcentaje, subtotal, total, estado, notas, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Factura no encontrada para actualizar" });
        }

        // Reemplazar items
        await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id]);

        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(`
                    INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `, [id, item.descripcion, item.cantidad, item.precio_unitario]);
            }
        }

        await client.query('COMMIT');
        res.json({ message: "Factura actualizada exitosamente", factura: result.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: "Error al actualizar la factura" });
    } finally {
        client.release();
    }
}

// --- ELIMINAR FACTURA (Se mantiene igual) ---
export const deleteFactura = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM factura_items WHERE factura_id = $1', [id]);
        
        const result = await client.query('DELETE FROM facturas WHERE id_factura = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        await client.query('COMMIT');
        res.json({ message: "Factura eliminada con éxito" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al eliminar factura:", err);
        res.status(500).json({ message: "Error al eliminar la factura" });
    } finally {
        client.release();
    }
}

// Nota: updateFactura y deleteFactura quedan igual, 
// solo agrega contrato_id al UPDATE si deseas permitir cambiar de contrato al editar.