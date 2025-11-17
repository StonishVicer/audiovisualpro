import { pool } from '../database/database.js'

// Obtener todos los roles
export const getRolesPersonal = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM roles_personal ORDER BY id_rol ASC'
        )

        return res.json(result.rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener los roles de personal' })
    }
}

// Obtener un rol por ID
export const getRolPersonalById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'SELECT * FROM roles_personal WHERE id_rol = $1',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' })
        }

        return res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener el rol' })
    }
}

// Crear un rol nuevo
export const createRolPersonal = async (req, res) => {
    try {
        const { nombre_rol } = req.body

        if (!nombre_rol || !nombre_rol.trim()) {
            return res.status(400).json({ message: 'El nombre del rol es obligatorio' })
        }

        const result = await pool.query(
            'INSERT INTO roles_personal (nombre_rol) VALUES ($1) RETURNING *',
            [nombre_rol.trim()]
        )

        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al crear el rol' })
    }
}

// Actualizar un rol
export const updateRolPersonal = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre_rol } = req.body

        const result = await pool.query(
            'UPDATE roles_personal SET nombre_rol = $1 WHERE id_rol = $2 RETURNING *',
            [nombre_rol, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' })
        }

        return res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al actualizar el rol' })
    }
}

// Eliminar un rol
export const deleteRolPersonal = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            'DELETE FROM roles_personal WHERE id_rol = $1 RETURNING *',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' })
        }

        return res.json({ message: 'Rol eliminado correctamente' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al eliminar el rol' })
    }
}
