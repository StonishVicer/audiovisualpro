import { ProyectoModel } from '../models/proyecto.js'

export const getProyectoById = async (req, res) => {
    try {
        const result = await ProyectoModel.findById(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' })
        res.status(200).json(result.rows[0])
    } catch (err) {
        console.error('Error al obtener proyecto por ID:', err)
        res.status(500).json({ message: 'Error al obtener proyectos por ID' })
    }
}

export const getProyectos = async (req, res) => {
    try {
        const result = await ProyectoModel.findAll()
        if (result.rows.length === 0) return res.status(200).json([])
        res.status(200).json(result.rows)
    } catch (err) {
        console.error('Error al obtener proyectos:', err)
        res.status(500).json({ message: 'Error al obtener proyectos' })
    }
}

export const createProyecto = async (req, res) => {
    try {
        const result = await ProyectoModel.create(req.body)
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: 'Error al crear proyecto' })
    }
}

export const deleteProyecto = async (req, res) => {
    try {
        const result = await ProyectoModel.remove(req.params.id)
        if (result.rows.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' })
        res.json({ message: 'Proyecto eliminado correctamente' })
    } catch (err) {
        console.error('Error al eliminar proyecto:', err)
        res.status(500).json({ message: 'Error al eliminar proyectos' })
    }
}

export const asignarLocacion = async (req, res) => {
    try {
        const { id_proyecto, id_locacion } = req.body
        const { pool } = await import('../config/database.js')
        await pool.query('INSERT INTO proyecto_locaciones (id_proyecto, id_locacion) VALUES ($1, $2)', [id_proyecto, id_locacion])
        res.status(200).json({ message: 'Locacion asignada correctamente' })
    } catch (err) {
        res.status(500).json({ message: 'Error al asignar una locacion al proyecto' })
    }
}

export const desasignarLocacion = async (req, res) => {
    try {
        const { idProyecto, idLocacion } = req.params
        const { pool } = await import('../config/database.js')
        const result = await pool.query('DELETE FROM proyecto_locaciones WHERE id_proyecto=$1 AND id_locacion=$2 RETURNING *', [idProyecto, idLocacion])
        if (result.rows.length === 0) return res.status(404).json({ message: 'La asignacion de locacion no fue encontrada' })
        res.status(200).json({ message: 'Locacion desasignada del proyecto' })
    } catch (err) {
        console.error('Error en desasignar locacion:', err)
        res.status(500).json({ message: 'Error al desasignar una locacion del proyecto' })
    }
}

export const asignarRecurso = async (req, res) => {
    try {
        const { id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso } = req.body
        const { pool } = await import('../config/database.js')
        const result = await pool.query(
            'INSERT INTO uso_recurso (id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) VALUES ($1,$2,$3,$4) RETURNING *',
            [id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso]
        )
        res.status(201).json({ message: 'Recurso tecnico asignado a proyecto', asignacion: result.rows[0] })
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ message: 'El proyecto o recurso no existe.' })
        res.status(500).json({ message: 'Error al asignar un recurso tecnico' })
    }
}

export const desasignarRecurso = async (req, res) => {
    try {
        const { idProyecto, idRecurso } = req.params
        if (!idProyecto || !idRecurso) return res.status(400).json({ message: 'Faltan campos.' })
        const { pool } = await import('../config/database.js')
        const result = await pool.query('DELETE FROM uso_recurso WHERE id_proyecto=$1 AND id_recurso=$2 RETURNING id_uso', [idProyecto, idRecurso])
        if (result.rows.length === 0) return res.status(404).json({ message: 'Asignacion no encontrada' })
        res.status(200).json({ message: 'Recurso tecnico desasignado' })
    } catch (err) {
        console.error('Error al desasignar recurso:', err)
        res.status(500).json({ message: 'Error al desasignar un recurso tecnico' })
    }
}
