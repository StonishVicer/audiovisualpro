import { pool } from '../database/database.js'
import fs from 'fs'
import path from 'path'

// Crea la carpeta de uploads si no existe
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
    // Compatibilidad con registros antiguos: si `link_entrega` es null, parseamos `descripcion` en formato "Titulo | URL".
    const entregables = result.rows.map(row => {
      let tituloReal = row.descripcion || 'Sin título'
      let linkObj = null
      let archivoObj = null

      // Preferimos `link_entrega` (columna nueva)
      if (row.link_entrega) {
        // Si el link parece una URL externa o una ruta absoluta, lo dejamos
        linkObj = row.link_entrega
        // Detectar si es URL local (subida) para presentar como archivo
        if (row.link_entrega.includes('/uploads/') || row.link_entrega.includes('http://localhost')) {
          archivoObj = { filename: 'Archivo Adjunto', url: row.link_entrega }
          // Si es archivo, ocultamos el link directo y lo mostramos en `archivo`
          linkObj = null
        }
      } else if (row.descripcion && row.descripcion.includes(' | ')) {
        // Fallback para datos antiguos: "Titulo | URL"
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
        id_proyecto: row.id_proyecto,
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

export const createEntregable = async (req, res) => {
  try {
    console.log('POST /api/entregables body:', req.body)
    const { titulo, link, fecha_entrega, id_estado_entregable } = req.body

    if (!titulo) {
      return res.status(400).json({ message: 'El título es obligatorio' })
    }

    let dataExtra = ''
    if (req.file) {
      const PORT = process.env.PORT || 3000
      dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, "/")}`
      console.log('Archivo recibido:', req.file.originalname)
    } else if (link) {
      dataExtra = link
    }

    let descripcionToStore = titulo
    if (!descripcionToStore) descripcionToStore = 'Sin título'
    if (descripcionToStore.length > 255) {
      console.warn(`Descripcion demasiado larga (${descripcionToStore.length} chars). Se truncará a 255.`)
      descripcionToStore = descripcionToStore.slice(0, 252) + '...'
    }

    // Usar id_proyecto enviado por el front; fallback a 1
    const idProyecto = req.body.id_proyecto ? Number(req.body.id_proyecto) : 1

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
      console.warn('Insert con columnas nuevas falló, intentando fallback:', innerErr.message)
      const query = `
        INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada)
        VALUES ($1, $2, $3)
        RETURNING *
      `
      const values = [idProyecto, descripcionToStore, fecha_entrega || null]
      result = await pool.query(query, values)
    }
    const row = result.rows[0]

    const nuevoEntregable = {
      id: row.id_entregable,
      id_proyecto: row.id_proyecto,
      titulo: row.descripcion || titulo,
      link: row.link_entrega || (link || null),
      archivo: req.file ? { url: dataExtra, filename: req.file.filename } : null,
      fecha_entrega: row.fecha_entrega_estimada,
      id_estado_entregable: row.id_estado_entregable || id_estado_entregable || null
    }

    return res.status(201).json(nuevoEntregable)
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(500).json({ message: "Error de BD: Asegúrate de crear primero un Proyecto con ID 1 en la base de datos." })
    }
    return res.status(500).json({ message: err.message })
  }
}

export const updateEntregable = async (req, res) => {
  try {
    const id = req.params.id
    const { titulo, link, fecha_entrega, id_estado_entregable, id_proyecto } = req.body

    // Obtener estado actual del entregable para conservar valores no modificados
    const existingRes = await pool.query('SELECT * FROM entregables WHERE id_entregable = $1', [id])
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Entregable no encontrado' })
    }
    const existing = existingRes.rows[0]

    // Determinar nueva URL (si suben archivo, prevalece)
    let dataExtra
    if (req.file) {
      const PORT = process.env.PORT || 3000
      dataExtra = `http://localhost:${PORT}/${req.file.path.replace(/\\/g, '/')}`
      console.log('Archivo recibido en update:', req.file.originalname)
    } else if (typeof link !== 'undefined') {
      // Si el front envía link: si es cadena vacía => limpiar, si no => usar el valor
      dataExtra = link && link.trim() ? link : null
    } else {
      // No se proporcionó campo `link` en la petición -> mantener el existente
      dataExtra = existing.link_entrega || null
    }

    // Determinar nuevo título/descripcion
    let descripcionToStore = (typeof titulo !== 'undefined' && titulo !== null && titulo.toString().trim() !== '') ? titulo.toString() : (existing.descripcion || 'Sin título')
    if (descripcionToStore.length > 255) {
      console.warn(`Descripcion demasiado larga (${descripcionToStore.length} chars). Se truncará a 255.`)
      descripcionToStore = descripcionToStore.slice(0, 252) + '...'
    }

    // Fecha, estado y proyecto: si vienen en el body y no están vacíos, usarlos; si no, conservar existentes
    const nuevaFecha = (typeof fecha_entrega !== 'undefined' && fecha_entrega !== '') ? fecha_entrega : existing.fecha_entrega_estimada
    const nuevoEstado = (typeof id_estado_entregable !== 'undefined' && id_estado_entregable !== '') ? id_estado_entregable : existing.id_estado_entregable
    const nuevoProyecto = (typeof id_proyecto !== 'undefined' && id_proyecto !== '') ? Number(id_proyecto) : existing.id_proyecto

    // Actualizar en BD: intentamos con todas las columnas nuevas
    let result
    try {
      const query = `
        UPDATE entregables
        SET descripcion = $1,
            fecha_entrega_estimada = $2,
            id_estado_entregable = $3,
            link_entrega = $4,
            id_proyecto = $5
        WHERE id_entregable = $6
        RETURNING *
      `
      const values = [descripcionToStore, nuevaFecha || null, nuevoEstado || null, dataExtra || null, nuevoProyecto || null, id]
      result = await pool.query(query, values)
    } catch (innerErr) {
      console.warn('Update entregable con columnas nuevas falló, intentando fallback sin columnas nuevas:', innerErr.message)
      const query = `
        UPDATE entregables
        SET descripcion = $1, fecha_entrega_estimada = $2
        WHERE id_entregable = $3
        RETURNING *
      `
      const values = [descripcionToStore, nuevaFecha || null, id]
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

export const deleteEntregable = async (req, res) => {
  try {
    const id = req.params.id
    
    // Borrar de la BD
    const result = await pool.query('DELETE FROM entregables WHERE id_entregable = $1', [id])

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entregable no encontrado' })
    }

    // (Opcional) Aquí podrías agregar lógica para borrar el archivo físico usando fs.unlink si lo deseas.

    return res.json({ message: 'Eliminado correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}