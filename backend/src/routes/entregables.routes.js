import pool from '../database.js' // Asegúrate de que esta ruta a tu conexión DB sea correcta
import fs from 'fs'

// Helper para asegurar que la carpeta existe (lo usas en tu router)
export const ensureUploadsDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

// OBTENER
export const getEntregables = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM entregables ORDER BY id_entregable DESC')
        
        // Transformamos los datos para el Frontend
        const entregables = result.rows.map(row => {
            // Separamos titulo | url
            const partes = row.descripcion ? row.descripcion.split(' | ') : ['Sin título']
            const tituloReal = partes[0]
            const archivoData = partes[1] || null

            let archivoObj = null
            let linkObj = null

            if (archivoData && archivoData.startsWith('http') && !archivoData.includes('localhost')) {
                linkObj = archivoData // Es un link externo
            } else if (archivoData) {
                archivoObj = { filename: 'Adjunto', url: archivoData } // Es archivo local
            }

            return {
                id: row.id_entregable,
                titulo: tituloReal,
                link: linkObj,
                archivo: archivoObj,
                fecha_entrega: row.fecha_entrega_estimada,
                id_estado_entregable: row.id_estado_entregable
            }
        })
        res.json(entregables)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// CREAR
export const createEntregable = async (req, res) => {
    const { titulo, link, fecha_entrega } = req.body
    
    // Generar URL o Link
    let dataExtra = ''
    if (req.file) {
        // Obtenemos el puerto del entorno o usamos 3000
        const PORT = process.env.PORT || 3000
        // Normalizamos los slash para windows/linux
        dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, "/")}`
    } else if (link) {
        dataExtra = link
    }

    // "Hack": Guardamos Titulo | URL en la descripción
    const descripcionCombinada = `${titulo} | ${dataExtra}`
    
    // ID Proyecto Hardcodeado a 1 (Requisito de tu BD)
    const idProyecto = 1 

    try {
        const query = `
            INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada) 
            VALUES ($1, $2, $3) RETURNING *`
        
        const result = await pool.query(query, [idProyecto, descripcionCombinada, fecha_entrega])
        res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Error. Verifica que exista el Proyecto ID 1 en la BD." })
    }
}

// EDITAR
export const updateEntregable = async (req, res) => {
    const { id } = req.params
    const { titulo, link, fecha_entrega } = req.body

    let dataExtra = ''
    if (req.file) {
        const PORT = process.env.PORT || 3000
        dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, "/")}`
    } else if (link) {
        dataExtra = link
    }
    // Nota: Si editan solo el nombre y no mandan archivo/link, 
    // idealmente deberíamos buscar el anterior, pero para simplificar, 
    // asumiremos que el form envía todo o se sobrescribe.
    
    const descripcionCombinada = `${titulo} | ${dataExtra}`

    try {
        await pool.query(
            'UPDATE entregables SET descripcion = $1, fecha_entrega_estimada = $2 WHERE id_entregable = $3',
            [descripcionCombinada, fecha_entrega, id]
        )
        res.json({ message: 'Actualizado' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ELIMINAR
export const deleteEntregable = async (req, res) => {
    const { id } = req.params
    try {
        await pool.query('DELETE FROM entregables WHERE id_entregable = $1', [id])
        res.json({ message: 'Entregable eliminado' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}