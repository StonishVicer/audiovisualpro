import { ClienteModel } from '../models/cliente.js'

export const getClienteById = async (req, res) => {
    try {
        const result = await ClienteModel.findById(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' })
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el cliente por ID' })
    }
}

export const getClientes = async (req, res) => {
    try {
        const result = await ClienteModel.findAll()
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener todos los clientes' })
    }
}

export const createCliente = async (req, res) => {
    try {
        const result = await ClienteModel.create(req.body)
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error al crear el cliente' })
    }
}

export const deleteCliente = async (req, res) => {
    try {
        const result = await ClienteModel.remove(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' })
        res.json({ message: 'Cliente eliminado correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el cliente' })
    }
}

export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params
        const countResult = await ClienteModel.hasContratos(id)
        if (parseInt(countResult.rows[0].count) > 0) {
            return res.status(409).json({ message: 'No se puede editar al cliente, esta vinculado con un contrato.' })
        }
        const result = await ClienteModel.update(id, req.body)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' })
        res.json(result.rows[0])
    } catch (err) {
        console.error('Error al editar al cliente:', err)
        res.status(500).json({ message: 'Error al editar al cliente' })
    }
}
