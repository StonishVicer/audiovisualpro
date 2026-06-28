import { FacturaService } from '../services/facturaService.js'

export const getFacturas = async (req, res) => {
    try {
        const facturas = await FacturaService.getAll()
        res.json(facturas)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al obtener las facturas' })
    }
}

export const createFactura = async (req, res) => {
    try {
        const factura = await FacturaService.create(req.body)
        res.status(201).json(factura)
    } catch (err) {
        console.error('Error Create Factura:', err)
        res.status(500).json({ message: 'Error al crear la factura', error: err.message })
    }
}

export const updateFactura = async (req, res) => {
    try {
        const result = await FacturaService.update(req.params.id, req.body)
        if (!result) return res.status(404).json({ message: 'Factura no encontrada' })
        res.json({ message: 'Actualizado', factura: result })
    } catch (err) {
        console.error('Error Update Factura:', err)
        res.status(500).json({ message: 'Error al actualizar', error: err.message })
    }
}

export const deleteFactura = async (req, res) => {
    try {
        const success = await FacturaService.delete(req.params.id)
        if (!success) return res.status(404).json({ message: 'Factura no encontrada' })
        res.json({ message: 'Eliminada correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar' })
    }
}
