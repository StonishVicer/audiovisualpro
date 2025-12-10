import { pool } from "../database/database.js";

// Obtener todos los gastos (con nombres de proyecto y categoría)
export const getGastos = async (req, res) => {
    try {
        const query = `
            SELECT g.*,
                   p.nombre_proyecto,
                   cg.nombre_categoria,
                   c.nombre_cliente
            FROM gastos g
            LEFT JOIN contratos cont ON g.id_contrato = cont.id_contrato
            LEFT JOIN proyectos p ON cont.id_proyecto = p.id_proyecto
            LEFT JOIN clientes c ON cont.id_cliente = c.id_cliente
            LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
            ORDER BY g.fecha_gasto DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener gastos" });
    }
};

// Obtener solo las categorías (para el select del frontend)
export const getCategoriasGasto = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categorias_gasto ORDER BY nombre_categoria ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener categorías" });
    }
};

// Crear Gasto
export const createGasto = async (req, res) => {
    try {
        const { id_contrato, id_categoria_gasto, descripcion_gasto, monto_gasto, fecha_gasto } = req.body;

        const query = `
            INSERT INTO gastos
            (id_contrato, id_categoria_gasto, descripcion_gasto, monto_gasto, fecha_gasto)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *
            `;
        const values = [id_contrato, id_categoria_gasto, descripcion_gasto, monto_gasto, fecha_gasto];

        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar el gasto" });
    }
};

// Actualizar Gasto
export const updateGasto = async (req, res) => {
    const { id } = req.params;
    const { id_contrato, id_categoria_gasto, descripcion_gasto, monto_gasto, fecha_gasto } = req.body;

    try {
        const query = `
            UPDATE gastos SET
        id_contrato = $1,
            id_categoria_gasto = $2,
            descripcion_gasto = $3,
            monto_gasto = $4,
            fecha_gasto = $5
            WHERE id_gasto = $6
        RETURNING *
            `;
        const values = [id_contrato, id_categoria_gasto, descripcion_gasto, monto_gasto, fecha_gasto, id];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) return res.status(404).json({ message: "Gasto no encontrado" });

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar gasto" });
    }
};

// Eliminar Gasto
export const deleteGasto = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM gastos WHERE id_gasto = $1', [id]);

        if (rowCount === 0) return res.status(404).json({ message: "Gasto no encontrado" });

        res.json({ message: "Gasto eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar gasto" });
    }
};