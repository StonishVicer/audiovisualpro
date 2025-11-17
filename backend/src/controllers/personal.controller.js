import { pool } from '../database/database.js'

// Lista completa de personal (con nombre del rol)
export const getPersonal = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        p.id_personal,
        p.nombre_personal,
        p.cedula_personal,
        p.id_rol,
        p.salario,
        p.email_personal,
        p.telefono,
        r.nombre_rol
            FROM personal p
            LEFT JOIN roles_personal r ON p.id_rol = r.id_rol
            ORDER BY p.id_personal ASC`
        )

        return res.json(result.rows)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener el personal' })
    }
}

// Obtener una persona por ID
export const getPersonalById = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            `SELECT 
        p.id_personal,
        p.nombre_personal,
        p.cedula_personal,
        p.id_rol,
        p.salario,
        p.email_personal,
        p.telefono,
        r.nombre_rol
            FROM personal p
            LEFT JOIN roles_personal r ON p.id_rol = r.id_rol
            WHERE p.id_personal = $1`,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Personal no encontrado' })
        }

        return res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al obtener el personal por ID' })
    }
}

// Crear registro de personal
export const createPersonal = async (req, res) => {
    try {
        const {
            nombre_personal,
            cedula_personal,
            id_rol,
            salario,
            email_personal,
            telefono
        } = req.body

        const insertResult = await pool.query(
            `INSERT INTO personal (
        nombre_personal,
        cedula_personal,
        id_rol,
        salario,
        email_personal,
        telefono
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_personal`,
            [nombre_personal, cedula_personal, id_rol, salario, email_personal, telefono]
        )

        const id = insertResult.rows[0].id_personal

        const result = await pool.query(
            `SELECT 
        p.id_personal,
        p.nombre_personal,
        p.cedula_personal,
        p.id_rol,
        p.salario,
        p.email_personal,
        p.telefono,
        r.nombre_rol
            FROM personal p
            LEFT JOIN roles_personal r ON p.id_rol = r.id_rol
            WHERE p.id_personal = $1`,
            [id]
        )

        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al crear el registro de personal' })
    }
}

// Actualizar registro de personal
export const updatePersonal = async (req, res) => {
    try {
        const { id } = req.params
        const {
            nombre_personal,
            cedula_personal,
            id_rol,
            salario,
            email_personal,
            telefono
        } = req.body

        const result = await pool.query(
            `UPDATE personal
            SET nombre_personal = $1,
                cedula_personal = $2,
                id_rol = $3,
                salario = $4,
                email_personal = $5,
                telefono = $6
            WHERE id_personal = $7
            RETURNING *`,
            [nombre_personal, cedula_personal, id_rol, salario, email_personal, telefono, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Personal no encontrado' })
        }

        const updated = await pool.query(
            `SELECT 
        p.id_personal,
        p.nombre_personal,
        p.cedula_personal,
        p.id_rol,
        p.salario,
        p.email_personal,
        p.telefono,
        r.nombre_rol
            FROM personal p
            LEFT JOIN roles_personal r ON p.id_rol = r.id_rol
            WHERE p.id_personal = $1`,
            [id]
        )

        return res.json(updated.rows[0])
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al actualizar el registro de personal' })
    }
}

// Eliminar registro de personal
export const deletePersonal = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            'DELETE FROM personal WHERE id_personal = $1 RETURNING *',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Personal no encontrado' })
        }

        return res.json({ message: 'Personal eliminado correctamente' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error al eliminar el registro de personal' })
    }
}
