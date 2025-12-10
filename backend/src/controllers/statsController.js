import { pool } from "../database/database.js";

// Obtener estadísticas financieras
export const getFinanceStats = async (req, res) => {
    try {
        // 1. Total Ingresos (Facturas)
        // NOTA: Se podría filtrar por estado de pago si existiera, o fecha. 
        // Asumiremos total facturado histórico por ser un dashboard general.
        const ingresosRes = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total_ingresos FROM facturas
        `);
        const totalIngresos = parseFloat(ingresosRes.rows[0].total_ingresos);

        // 2. Total Gastos
        const gastosRes = await pool.query(`
            SELECT COALESCE(SUM(monto_gasto), 0) as total_gastos FROM gastos
        `);
        const totalGastos = parseFloat(gastosRes.rows[0].total_gastos);

        // 3. Gastos por Categoría
        const catRes = await pool.query(`
            SELECT cg.nombre_categoria, COALESCE(SUM(g.monto_gasto), 0) as total
            FROM gastos g
            JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
            GROUP BY cg.nombre_categoria
            ORDER BY total DESC
        `);

        // 4. Ingresos vs Gastos últimos 6 meses (para gráfico de barras)
        // Esto es un poco más complejo en SQL puro, haremos una aproximación simple
        // O lo podemos hacer en JS si no son muchos datos.
        // Haremos consulta por mes para el año actual.

        const currentYear = new Date().getFullYear();

        const monthlyIncomeRes = await pool.query(`
            SELECT EXTRACT(MONTH FROM fecha_factura) as mes, SUM(total) as total
            FROM facturas
            WHERE EXTRACT(YEAR FROM fecha_factura) = $1
            GROUP BY mes
            ORDER BY mes
        `, [currentYear]);

        const monthlyExpenseRes = await pool.query(`
             SELECT EXTRACT(MONTH FROM fecha_gasto) as mes, SUM(monto_gasto) as total
             FROM gastos
             WHERE EXTRACT(YEAR FROM fecha_gasto) = $1
             GROUP BY mes
             ORDER BY mes
        `, [currentYear]);

        res.json({
            totals: {
                income: totalIngresos,
                expenses: totalGastos,
                profit: totalIngresos - totalGastos
            },
            expensesByCategory: catRes.rows,
            monthlyStats: {
                income: monthlyIncomeRes.rows,
                expenses: monthlyExpenseRes.rows
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener estadísticas" });
    }
};
