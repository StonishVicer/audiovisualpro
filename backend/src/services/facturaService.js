import { pool } from '../config/database.js'
import { FacturaModel } from '../models/factura.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'
import { MonedaService } from './monedaService.js'

export const FacturaService = {
    async getAll() {
        const facturasResult = await FacturaModel.findAll()
        const facturas = facturasResult.rows
        for (const fact of facturas) {
            const itemsRes = await FacturaModel.findItems(fact.id_factura)
            fact.items = itemsRes.rows
        }
        return facturas
    },

    async create(facturaData) {
        const { numero_factura, fecha_factura, contrato_id, items, subtotal, total, estado, notas, id_moneda, moneda } = facturaData
        const clienteId = parseInt(facturaData.cliente_id)
        const contratoId = contrato_id ? parseInt(contrato_id) : null
        const subtotalF = parseFloat(subtotal) || 0
        const totalF = parseFloat(total) || 0

        if (!numero_factura || !fecha_factura || !clienteId) {
            throw new ValidationError('Faltan campos obligatorios de la factura')
        }

        const monedaCode = moneda || 'USD'
        const monedaId = id_moneda ? parseInt(id_moneda) : await MonedaService.getIdMonedaPorCodigo(monedaCode)
        const { monto_usd, monto_ves } = await MonedaService.guardarConAmbasMonedas(totalF, monedaCode, fecha_factura)

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const resFact = await FacturaModel.createWithItems(client, {
                numero_factura, fecha_factura, cliente_id: clienteId,
                id_contrato: contratoId, subtotal: subtotalF, total: totalF, estado, notas,
                id_moneda: monedaId, monto_usd, monto_ves
            })

            const newFactura = resFact.rows[0]

            if (items && items.length > 0) {
                for (const item of items) {
                    await FacturaModel.createItem(client, newFactura.id_factura, item)
                }
            }

            await client.query('COMMIT')
            return { ...newFactura, items }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    },

    async update(id, facturaData) {
        const { numero_factura, fecha_factura, contrato_id, items, subtotal, total, estado, notas, id_moneda, moneda } = facturaData
        const clienteId = parseInt(facturaData.cliente_id)
        const contratoId = contrato_id ? parseInt(contrato_id) : null
        const subtotalF = parseFloat(subtotal) || 0
        const totalF = parseFloat(total) || 0

        const monedaCode = moneda || 'USD'
        const monedaId = id_moneda ? parseInt(id_moneda) : await MonedaService.getIdMonedaPorCodigo(monedaCode)
        const { monto_usd, monto_ves } = await MonedaService.guardarConAmbasMonedas(totalF, monedaCode, fecha_factura)

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const result = await FacturaModel.update(client, id, {
                numero_factura, fecha_factura, cliente_id: clienteId,
                id_contrato: contratoId, subtotal: subtotalF, total: totalF, estado, notas,
                id_moneda: monedaId, monto_usd, monto_ves
            })

            if (result.rows.length === 0) {
                await client.query('ROLLBACK')
                throw new NotFoundError('Factura no encontrada')
            }

            await FacturaModel.clearItems(client, id)

            if (items && items.length > 0) {
                for (const item of items) {
                    await FacturaModel.createItem(client, id, item)
                }
            }

            await client.query('COMMIT')
            return result.rows[0]
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    },

    async delete(id) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            await FacturaModel.clearItems(client, id)
            const result = await FacturaModel.remove(client, id)
            if (result.rows.length === 0) {
                await client.query('ROLLBACK')
                throw new NotFoundError('Factura no encontrada')
            }
            await client.query('COMMIT')
            return { message: 'Factura eliminada correctamente' }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}
