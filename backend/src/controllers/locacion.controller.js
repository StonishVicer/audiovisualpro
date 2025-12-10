import { pool } from "../database/database.js";

export const getLocacionById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM locaciones WHERE id_locacion = $1', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Locacion no encontrada" })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: "Error al obtener la locacion por ID" })
    }
}

export const getLocaciones = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM locaciones ORDER BY id_locacion ASC')
        if(result.rows.length === 0){
            res.status(404).json({ message: 'No se encontraron locaciones' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: "Error al obtener las locaciones" })
    }
}

export const createLocacion = async (req, res) => {
    try{
        const { nombre_locacion, direccion, descripcion_locacion } = req.body

        const result = await pool.query(
            'INSERT INTO locaciones (nombre_locacion, direccion, descripcion_locacion) VALUES ($1, $2, $3) RETURNING *', [nombre_locacion, direccion, descripcion_locacion]
        )

        res.status(201).json(result.rows[0])
    } catch(err){
        res.status(500).json({ message: "Error al crear una locación" })
    }
}

export const deleteLocacion = async (req, res) => {
    const { id } = req.params;

    try {
        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM proyecto_locaciones WHERE id_locacion = $1',
            [id]
        );

        const count = parseInt(checkResult.rows[0].count);

        if (count > 0) {
            return res.status(409).json({
                message: `No se puede eliminar la locación. Está asignada a ${count} proyecto(s).`
            });
        }

        const result = await pool.query(
            'DELETE FROM locaciones WHERE id_locacion = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Locacion no encontrada" });
        }

        res.json({ message: "Locacion eliminada con exito" });

    } catch(err) {
        console.error("Error al eliminar locación:", err);
        res.status(500).json({ message: "Error al eliminar locacion" });
    }
}

export const updateLocacion = async (req, res) => {
    const { id } = req.params;
    const { nombre_locacion, direccion, descripcion_locacion } = req.body;

    try {
        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM proyecto_locaciones WHERE id_locacion = $1',
            [id]
        );

        const count = parseInt(checkResult.rows[0].count);

        if (count > 0) {
            return res.status(409).json({
                message: `No se puede editar la locación. Está asignada a ${count} proyecto(s).`
            });
        }

        const result = await pool.query(
            'UPDATE locaciones SET nombre_locacion = $1, direccion = $2, descripcion_locacion = $3 WHERE id_locacion = $4 RETURNING *',
            [nombre_locacion, direccion, descripcion_locacion, id]
        );
        
        if (result.rows.length === 0) {
             return res.status(404).json({ message: "Locacion no encontrada" });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        console.error('Error al editar la locacion: ', err);
        res.status(500).json({ message: 'Error al editar la locacion' });
    }
}