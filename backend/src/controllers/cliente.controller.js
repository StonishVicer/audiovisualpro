import { pool } from '../database/database.js'

export const getClienteById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el cliente por ID'})
    }
}

export const getClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id_cliente ASC')

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron clientes' })
        }

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los clientes' })
    }
}

export const createCliente = async (req, res) => {
    try {
        const { rif_cliente, nombre_cliente, email_cliente, telefono_cliente } = req.body

        const result = await pool.query(
            'INSERT INTO clientes (rif_cliente, nombre_cliente, email_cliente, telefono_cliente) VALUES ($1, $2, $3, $4) RETURNING *',
            [rif_cliente, nombre_cliente, email_cliente, telefono_cliente]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear el cliente' })
    }
}

export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM clientes WHERE id_cliente = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Cliente no encontrado' })
        }

        res.json({ message: 'Cliente eliminado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el cliente' })
    }
}

export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params
        const { rif_cliente, nombre_cliente, email_cliente, telefono_cliente } = req.body

        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM contratos WHERE id_cliente = $1',
            [id]
        )

        const count = parseInt(checkResult.rows[0].count)

        if (count > 0) {
            return res.status(409).json({ message: 'No se puede editar al cliente, esta vinculado con un contrato.' })
        }

        const result = await pool.query(
            'UPDATE clientes SET rif_cliente = $1, nombre_cliente = $2, email_cliente = $3, telefono_cliente = $4 WHERE id_cliente = $5 RETURNING *',
            [rif_cliente, nombre_cliente, email_cliente, telefono_cliente, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' })
        }

        res.json(result.rows[0])
    } catch (err) {
        console.error('Error al editar al cliente: ', err)
        res.status(500).json({ message: 'Error al editar al cliente' })
    }
}