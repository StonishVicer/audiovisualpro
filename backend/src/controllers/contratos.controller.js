import { ContratoModel } from '../models/contrato.js'

export const getContratoById = async (req, res) => {
    try {
        const { rows } = await ContratoModel.findById(req.params.id)
        if (rows.length === 0) return res.status(404).json({ message: 'Contrato no encontrado' })
        res.json(rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al obtener el contrato' })
    }
}

export const getContratos = async (req, res) => {
    try {
        const { rows } = await ContratoModel.findAll()
        res.json(rows)
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener contratos' })
    }
}

export const createContrato = async (req, res) => {
    try {
        const { id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios } = req.body
        if (!id_proyecto || !id_cliente || !fecha_firma || !monto_contrato) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' })
        }
        const { rows } = await ContratoModel.create({ id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios })
        res.status(201).json(rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al crear contrato' })
    }
}

export const updateContrato = async (req, res) => {
    try {
        const { rows } = await ContratoModel.update(req.params.id, req.body)
        if (rows.length === 0) return res.status(404).json({ message: 'Contrato no encontrado' })
        res.json(rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al actualizar contrato' })
    }
}

export const deleteContrato = async (req, res) => {
    try {
        const { rows } = await ContratoModel.remove(req.params.id)
        if (rows.length === 0) return res.status(404).json({ message: 'Contrato no encontrado' })
        res.json({ message: 'Contrato eliminado correctamente' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al eliminar contrato' })
    }
}
