import { pool } from '../database/database.js'

export const getContratoById = async (req, res) => {
    try {
        const { id } = req.params
        const query = 'SELECT * FROM contratos WHERE id_contrato = $1'
        const { rows } = await pool.query(query, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Contrato no encontrado' })
        }

        res.json(rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al obtener el contrato' })
    }
}

export const getContratos = async (req, res) => {
	try {
        const query = `
            SELECT 
                c.id_contrato,
                c.fecha_firma,
                c.monto_contrato,
                c.descripcion_servicios,
                c.id_cliente,
                c.id_proyecto,
                cli.nombre_cliente,
                cli.rif_cliente,
                pro.nombre_proyecto
            FROM contratos c
            INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
            INNER JOIN proyectos pro ON c.id_proyecto = pro.id_proyecto
            ORDER BY c.id_contrato DESC
        `
        const { rows } = await pool.query(query)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener contratos' })
    }
}

export const createContrato = async (req, res) => {
    try {
        const { 
            id_proyecto, 
            id_cliente, 
            fecha_firma, 
            monto_contrato, 
            descripcion_servicios 
        } = req.body

        if (!id_proyecto || !id_cliente || !fecha_firma || !monto_contrato) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' })
        }

        const query = `
            INSERT INTO contratos 
            (id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `
        const values = [id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios]
        
        const { rows } = await pool.query(query, values)
        
        res.status(201).json(rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al crear contrato' })
    }
}