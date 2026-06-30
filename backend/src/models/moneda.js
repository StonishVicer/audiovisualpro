/**
 * 📌 JUSTIFICACIÓN DE ARQUITECTURA
 * ================================
 * Modelos de acceso a datos para el sistema bimonetario.
 *
 * 🎯 PROBLEMA RESUELTO:
 * - Abstracción de consultas SQL para monedas y tipos de cambio.
 * - Separación de responsabilidades: el modelo solo accede a datos, no tiene lógica de negocio.
 *
 * 🔗 PATRONES APLICADOS:
 * - Repository Pattern: Aislamiento de consultas SQL.
 */

import { pool } from '../config/database.js'

export const MonedaModel = {
    findAll() {
        return pool.query('SELECT * FROM monedas ORDER BY id_moneda ASC')
    },

    findById(id) {
        return pool.query('SELECT * FROM monedas WHERE id_moneda = $1', [id])
    },

    findByCodigo(codigo) {
        return pool.query('SELECT * FROM monedas WHERE codigo = $1', [codigo])
    }
}

export const TipoCambioModel = {
    findByFecha(fecha) {
        return pool.query(
            `SELECT tc.*, mb.codigo AS codigo_base, md.codigo AS codigo_destino
             FROM tipos_cambio tc
             JOIN monedas mb ON tc.id_moneda_base = mb.id_moneda
             JOIN monedas md ON tc.id_moneda_destino = md.id_moneda
             WHERE tc.fecha = $1
             ORDER BY tc.created_at DESC
             LIMIT 1`,
            [fecha]
        )
    },

    upsert(fecha, idMonedaBase, idMonedaDestino, valor, fuente = 'Manual') {
        return pool.query(
            `INSERT INTO tipos_cambio (fecha, id_moneda_base, id_moneda_destino, valor, fuente)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (fecha, id_moneda_base, id_moneda_destino)
             DO UPDATE SET valor = $4, fuente = $5, created_at = NOW()
             RETURNING *`,
            [fecha, idMonedaBase, idMonedaDestino, valor, fuente]
        )
    },

    setTasaHoy(valor, fuente = 'Manual') {
        const hoy = new Date().toISOString().split('T')[0]
        return pool.query(
            `INSERT INTO tipos_cambio (fecha, id_moneda_base, id_moneda_destino, valor, fuente)
             VALUES ($1, 1, 2, $2, $3)
             ON CONFLICT (fecha, id_moneda_base, id_moneda_destino)
             DO UPDATE SET valor = $2, fuente = $3, created_at = NOW()
             RETURNING *`,
            [hoy, valor, fuente]
        )
    }
}
