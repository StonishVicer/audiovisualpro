import { pool } from '../database/database.js'

export const getPagos = async (req, res) => {
    try {
        // YA NO HACEMOS JOIN CON ASIGNACIONES
        const query = `
            SELECT 
                pp.id_pago, 
                pp.id_personal,
                pp.categoria_pg,  
                pp.monto_pagado, 
                pp.fecha_pago, 
                pp.motivo_pago,
                p.nombre_personal,
                p.apellido_personal
            FROM pagos_personal pp
            LEFT JOIN personal p ON pp.id_personal = p.id_personal
            ORDER BY pp.fecha_pago DESC
        `
        const { rows } = await pool.query(query)
        res.json(rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al obtener pagos' })
    }
}

export const getPagoById = async (req, res) => {
    try {
        const { id } = req.params
        const query = `
            SELECT 
                pp.*,
                p.nombre_personal,
                p.apellido_personal
            FROM pagos_personal pp
            LEFT JOIN personal p ON pp.id_personal = p.id_personal
            WHERE pp.id_pago = $1
        `
        const { rows } = await pool.query(query, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' })
        }
        res.json(rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al obtener el pago' })
    }
}

export const createPago = async (req, res) => {
    try {
        const { 
            id_personal, 
            categoria_pg, // CAMBIO: Recibimos texto
            monto_pagado, 
            fecha_pago, 
            motivo_pago 
        } = req.body

        if (!id_personal || !categoria_pg || !monto_pagado || !fecha_pago) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' })
        }

        const query = `
            INSERT INTO pagos_personal 
            (id_personal, categoria_pg, monto_pagado, fecha_pago, motivo_pago) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `
        const values = [id_personal, categoria_pg, monto_pagado, fecha_pago, motivo_pago]
        
        const { rows } = await pool.query(query, values)
        res.status(201).json(rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al crear el pago' })
    }
}

export const updatePago = async (req, res) => {
    try {
        const { id } = req.params
        const { 
            id_personal, 
            categoria_pg, // CAMBIO
            monto_pagado, 
            fecha_pago, 
            motivo_pago 
        } = req.body

        const query = `
            UPDATE pagos_personal 
            SET id_personal = $1, 
                categoria_pg = $2, 
                monto_pagado = $3, 
                fecha_pago = $4, 
                motivo_pago = $5
            WHERE id_pago = $6
            RETURNING *
        `
        const values = [id_personal, categoria_pg, monto_pagado, fecha_pago, motivo_pago, id]
        
        const { rows } = await pool.query(query, values)

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' })
        }
        res.json(rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al actualizar el pago' })
    }
}

export const deletePago = async (req, res) => {
    try {
        const { id } = req.params
        const query = 'DELETE FROM pagos_personal WHERE id_pago = $1 RETURNING *'
        const { rows } = await pool.query(query, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' })
        }
        res.json({ message: 'Pago eliminado correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al eliminar el pago' })
    }
}