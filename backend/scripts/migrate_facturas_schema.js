
import { pool } from '../src/database/database.js';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migración...');
        await client.query('BEGIN');

        // 1. Agregar columnas faltantes a facturas
        console.log('Modificando tabla facturas...');
        
        // Verificamos si las columnas existen antes de agregarlas para evitar errores si se corre 2 veces
        // Pero para ser directo y dado que sabemos que falla, usaremos ADD IF NOT EXISTS o bloques try/catch implicitos en lógica
        // Postgres 9.6+ soporta IF NOT EXISTS en ALTER TABLE ... ADD COLUMN
        
        // numero_factura
        await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(50);`);
        
        // cliente_id
        await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS cliente_id INTEGER;`);
        
        // subtotal
        await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14,2) DEFAULT 0;`);
        
        // total (ya existe monto_total, vamos a renombrarlo o agregar el nuevo. El codigo usa 'total')
        // Vamos a renombrar monto_total a total si existe
        // Chequeamos si existe monto_total
        const checkMonto = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='facturas' AND column_name='monto_total';
        `);
        
        if (checkMonto.rows.length > 0) {
            await client.query(`ALTER TABLE facturas RENAME COLUMN monto_total TO total;`);
        } else {
             await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS total NUMERIC(14,2) DEFAULT 0;`);
        }

        // Renombrar fecha_emision a fecha_factura
        const checkFecha = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='facturas' AND column_name='fecha_emision';
        `);
         if (checkFecha.rows.length > 0) {
            await client.query(`ALTER TABLE facturas RENAME COLUMN fecha_emision TO fecha_factura;`);
        } else {
             await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS fecha_factura DATE;`);
        }

        // notas
        await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS notas TEXT;`);
        
        // estado (ya existe id_estado_pago, el codigo usa 'estado' string)
        // Ojo: Si el codigo espera un string 'PENDIENTE'/'PAGADA' y la DB tiene FK integer, hay conflicto.
        // El controller usa: estado = $8. DB dump dice: id_estado_pago integer NOT NULL
        // Vamos a agregar la columna 'estado' VARCHAR y hacer nullable id_estado_pago si es necesario
        await client.query(`ALTER TABLE facturas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'PENDIENTE';`);
        await client.query(`ALTER TABLE facturas ALTER COLUMN id_estado_pago DROP NOT NULL;`);


        // 2. Crear tabla factura_items
        console.log('Creando tabla factura_items...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS factura_items (
                id_item SERIAL PRIMARY KEY,
                factura_id INTEGER REFERENCES facturas(id_factura) ON DELETE CASCADE,
                descripcion VARCHAR(255),
                cantidad NUMERIC(10,2),
                precio_unitario NUMERIC(14,2)
            );
        `);

        await client.query('COMMIT');
        console.log('Migración completada con éxito.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en migración:', err);
    } finally {
        client.release();
        pool.end(); // Cerrar pool para terminar script
    }
}

migrate();
