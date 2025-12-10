import { pool } from '../database/database.js'
import fs from 'fs'
import path from 'path'

export const ensureUploadsDir = (uploadsPath) => {
  try {
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })
  } catch (err) {
    console.error('Error creando uploads dir', err)
  }
}

export const getEntregables = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entregables ORDER BY id_entregable DESC')

    const entregables = result.rows.map(row => {
      let tituloReal = row.descripcion || 'Sin título'
      let linkObj = null
      let archivoObj = null

      if (row.link_entrega) {
        linkObj = row.link_entrega
        if (row.link_entrega.includes('/uploads/') || row.link_entrega.includes('http://localhost')) {
          archivoObj = { filename: 'Archivo Adjunto', url: row.link_entrega }
          linkObj = null
        }
      } else if (row.descripcion && row.descripcion.includes(' | ')) {
        const partes = row.descripcion.split(' | ')
        tituloReal = partes[0] || tituloReal
        const archivoData = partes[1] || null
        if (archivoData) {
          if (archivoData.startsWith('http') && !archivoData.includes('localhost')) {
            linkObj = archivoData
          } else {
            archivoObj = { filename: 'Archivo Adjunto', url: archivoData }
          }
        }
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

    return res.json(entregables)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// --- CREAR (INSERT) ---
export const createEntregable = async (req, res) => {
  try {
    console.log('POST /api/entregables body:', req.body)
    const { titulo, link, fecha_entrega, id_estado_entregable } = req.body

    // 1. Validaciones básicas
    if (!titulo) {
      return res.status(400).json({ message: 'El título es obligatorio' })
    }

    // 2. Procesar Archivo o Link
    let dataExtra = ''
    
    if (req.file) {
      // Si subieron archivo, creamos la URL local
      const PORT = process.env.PORT || 3000
      // Normalizamos las barras para que funcione en Windows y Linux
      dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, "/")}`
      
      console.log('Archivo recibido:', req.file.originalname)
    } else if (link) {
      dataExtra = link
    }

    // Guardamos `titulo` en `descripcion` (esta columna pasa a ser el título)
    let descripcionToStore = titulo
    if (!descripcionToStore) descripcionToStore = 'Sin título'
    if (descripcionToStore.length > 255) {
      console.warn(`Descripcion demasiado larga (${descripcionToStore.length} chars). Se truncará a 255.`)
      descripcionToStore = descripcionToStore.slice(0, 252) + '...'
    }

    // Guardamos `dataExtra` (link o URL del archivo subido) en la columna `link_entrega`

    // 4. ID Proyecto Hardcodeado a 1
    // Tu BD obliga a tener un id_proyecto. Como el form no lo pide, ponemos 1.
    // ASEGURATE DE TENER UN PROYECTO CON ID 1 EN TU BD.
    const idProyecto = 1 

    // 5. Insertar en PostgreSQL: usamos la columna `link_entrega` y `id_estado_entregable`
    // Construimos la consulta y valores
    let result
    try {
      const query = `
        INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada, id_estado_entregable, link_entrega)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      const values = [idProyecto, descripcionToStore, fecha_entrega || null, id_estado_entregable || null, dataExtra || null]
      result = await pool.query(query, values)
    } catch (innerErr) {
      console.warn('Insert entregable con columnas nuevas falló, intentando fallback sin id_estado_entregable/link_entrega:', innerErr.message)
      // Fallback: intentar insertar sin las columnas nuevas (compatibilidad)
      const query = `
        INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada)
        VALUES ($1, $2, $3)
        RETURNING *
      `
      const values = [idProyecto, descripcionToStore, fecha_entrega || null]
      result = await pool.query(query, values)
    }
    const row = result.rows[0]

    // 6. Responder al frontend con el objeto creado
    const nuevoEntregable = {
      id: row.id_entregable,
      titulo: row.descripcion || titulo,
      link: row.link_entrega || (link || null),
      archivo: req.file ? { url: dataExtra, filename: req.file.filename } : null,
      fecha_entrega: row.fecha_entrega_estimada,
      id_estado_entregable: row.id_estado_entregable || id_estado_entregable || null
    }

    return res.status(201).json(nuevoEntregable)

  } catch (err) {
    console.error(err)
    // Error común: No existe el proyecto 1
    if (err.code === '23503') {
        return res.status(500).json({ message: "Error de BD: Asegúrate de crear primero un Proyecto con ID 1 en la base de datos." })
    }
    return res.status(500).json({ message: err.message })
  }
}

// --- EDITAR (UPDATE) ---
export const updateEntregable = async (req, res) => {
  try {
    const id = req.params.id
    const { titulo, link, fecha_entrega, id_estado_entregable } = req.body

    // 1. Lógica para determinar la nueva URL (link_entrega)
    let dataExtra = ''

    if (req.file) {
        // Si suben archivo nuevo, esa es la nueva data
        const PORT = process.env.PORT || 3000
        dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, "/")}`
    } else if (link) {
        dataExtra = link
    } else {
        // Si no mandan nada nuevo, tendríamos que buscar el anterior.
        // Por simplicidad, si editan y no mandan archivo, asumimos que se mantiene vacio o el front manda el link viejo.
        // Si necesitas mantener el viejo sin que el front lo mande, habría que hacer un SELECT primero.
        dataExtra = '' 
    }

    // 2. Guardar titulo en `descripcion` y dataExtra en `link_entrega`
    let descripcionToStore = titulo || ''
    if (descripcionToStore.length > 255) {
      console.warn(`Descripcion demasiado larga (${descripcionToStore.length} chars). Se truncará a 255.`)
      descripcionToStore = descripcionToStore.slice(0, 252) + '...'
    }

    // 3. Actualizar en BD: escribir descripcion (titulo), link_entrega y id_estado_entregable
    let result
    try {
      const query = `
        UPDATE entregables
        SET descripcion = $1, fecha_entrega_estimada = $2, id_estado_entregable = $3, link_entrega = $4
        WHERE id_entregable = $5
        RETURNING *
      `
      const values = [descripcionToStore, fecha_entrega || null, id_estado_entregable || null, dataExtra || null, id]
      result = await pool.query(query, values)
    } catch (innerErr) {
      console.warn('Update entregable con columnas nuevas falló, intentando fallback sin id_estado_entregable/link_entrega:', innerErr.message)
      const query = `
        UPDATE entregables
        SET descripcion = $1, fecha_entrega_estimada = $2
        WHERE id_entregable = $3
        RETURNING *
      `
      const values = [descripcionToStore, fecha_entrega || null, id]
      result = await pool.query(query, values)
    }

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entregable no encontrado' })
    }

    return res.json({ message: 'Actualizado correctamente', entregable: result.rows[0] })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// --- ELIMINAR (DELETE) ---
export const deleteEntregable = async (req, res) => {
  try {
    const id = req.params.id
    
    // 1. Borrar de la BD
    const result = await pool.query('DELETE FROM entregables WHERE id_entregable = $1', [id])

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entregable no encontrado' })
    }

    // (Opcional) Aquí podrías agregar lógica para borrar el archivo físico usando fs.unlink
    // pero requeriría hacer un SELECT primero para obtener la ruta.

    return res.json({ message: 'Eliminado correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}