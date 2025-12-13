import { pool } from "../database/database.js";
import fs from "fs/promises"
import path from 'path'

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
    const file = req.file

    try{
        const { nombre_locacion, direccion, descripcion_locacion } = req.body

        let url_imagen = null

        if(file) { 
            const domain = 'http://localhost:3000'
            url_imagen = `${domain}/uploads/${file.filename}`
        }

        const result = await pool.query(
            'INSERT INTO locaciones (nombre_locacion, direccion, descripcion_locacion, url_imagen) VALUES ($1, $2, $3, $4) RETURNING *', [nombre_locacion, direccion, descripcion_locacion, url_imagen]
        )

        res.status(201).json(result.rows[0])
    } catch(err){
        if(file) {
            try {
                await fs.unlink(file.path)
                console.log(`Archivo ${file.filename} eliminado debido a un error inesperado`)
            } catch (unlinkError) {
                console.error('Error al eliminar el archivo subido')
            }
        }
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
    const file = req.file; 
    const { nombre_locacion, direccion, descripcion_locacion } = req.body;

    let new_url_imagen = null;
    let old_url_imagen = null;

    try {
        const proyectosVinculados = await pool.query(
            'SELECT COUNT(*) FROM proyecto_locaciones WHERE id_locacion = $1', 
            [id]
        );
        
        const count = parseInt(proyectosVinculados.rows[0].count, 10);

        if (count > 0) {
            return res.status(409).json({ 
                message: "No se puede editar esta locación porque está vinculada a " + count + " proyecto(s)." 
            });
        }

        const oldLocacionRes = await pool.query('SELECT url_imagen FROM locaciones WHERE id_locacion = $1', [id]);
        
        if (oldLocacionRes.rows.length === 0) {
            return res.status(404).json({ message: "Locación no encontrada." });
        }
        
        old_url_imagen = oldLocacionRes.rows[0].url_imagen;
        
        if (file) {
            const domain = process.env.PUBLIC_DOMAIN || 'http://localhost:3000';
            new_url_imagen = `${domain}/uploads/${file.filename}`;
        } else {
            new_url_imagen = old_url_imagen;
        }

        const result = await pool.query(
            'UPDATE locaciones SET nombre_locacion = $1, direccion = $2, descripcion_locacion = $3, url_imagen = $4 WHERE id_locacion = $5 RETURNING *',
            [nombre_locacion, direccion, descripcion_locacion, new_url_imagen, id]
        );

        if (file && old_url_imagen) {
            const oldFileName = path.basename(old_url_imagen);
            const oldFilePath = path.join(process.cwd(), 'uploads', oldFileName);
            
            try {
                if (oldFileName) { 
                    await fs.unlink(oldFilePath);
                }
            } catch (unlinkError) {
                console.warn(`No se pudo eliminar el archivo antiguo: ${oldFileName}`, unlinkError.message);
            }
        }
        
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error("Error al actualizar la locación: ", err)
        if (file) {
            try {
                await fs.unlink(file.path);
            } catch (unlinkError) {
                console.error("Error al eliminar el archivo subido nuevo después de fallo de DB: ", unlinkError);
            }
        }
        
        if (err.code === '23505') {
            return res.status(409).json({ 
                message: `El nombre de locación '${nombre_locacion}' ya está en uso.` 
            });
        }
        
        res.status(500).json({ message: "Error interno del servidor al actualizar la locación." });
    }
};