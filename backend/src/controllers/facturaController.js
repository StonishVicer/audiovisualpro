import { FacturaService } from '../services/facturaService.js'

export const getFacturas = async (req, res, next) => {
    try {
        const facturas = await FacturaService.getAll()
        res.json(facturas)
    } catch (err) {
        next(err)
    }
}

export const createFactura = async (req, res, next) => {
    try {
        const factura = await FacturaService.create(req.body)
        res.status(201).json(factura)
    } catch (err) {
        next(err)
    }
}

export const updateFactura = async (req, res, next) => {
    try {
        const factura = await FacturaService.update(req.params.id, req.body)
        res.json({ message: 'Actualizado', factura })
    } catch (err) {
        next(err)
    }
}

export const deleteFactura = async (req, res, next) => {
    try {
        const result = await FacturaService.delete(req.params.id)
        res.json(result)
    } catch (err) {
        next(err)
    }
}
