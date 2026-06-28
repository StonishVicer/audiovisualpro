
import { pool } from '../src/database/database.js';

async function run() {
    try {
        console.log("Inserting categories...");
        const cats = ['Transporte', 'Comida', 'Reservaciones', 'Materiales', 'Equipos'];

        for (const c of cats) {
            // Check if exists
            const res = await pool.query("SELECT * FROM categorias_gasto WHERE nombre_categoria = $1", [c]);
            if (res.rows.length === 0) {
                await pool.query("INSERT INTO categorias_gasto (nombre_categoria) VALUES ($1)", [c]);
                console.log(`Inserted: ${c}`);
            } else {
                console.log(`Skipped (exists): ${c}`);
            }
        }
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
