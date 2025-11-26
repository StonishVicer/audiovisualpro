import path from 'path'
import fs from 'fs'

const entregables = []
let nextId = 1

export const createEntregable = (req, res) => {
  try {
    const { titulo, link } = req.body || {}
    let archivoInfo = null

    // Log request for debugging
    console.log('POST /api/entregables body:', req.body)
    console.log('POST /api/entregables file:', req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null)

    if (req.file) {
      archivoInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path
      }
    }

    if (!titulo || (!link && !archivoInfo)) {
      return res.status(400).json({ message: 'Falta título o link/archivo' })
    }

    const nuevo = {
      id: nextId++,
      titulo,
      link: link || null,
      archivo: archivoInfo,
      createdAt: new Date().toISOString()
    }
    entregables.push(nuevo)
    return res.status(201).json(nuevo)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export const getEntregables = (req, res) => {
  return res.json(entregables)
}

export const updateEntregable = (req, res) => {
  try {
    const id = Number(req.params.id)
    const idx = entregables.findIndex((t) => t.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Entregable no encontrado' })

    const { titulo, link } = req.body || {}
    let archivoInfo = entregables[idx].archivo || null

    if (req.file) {
      // borrar archivo previo si existe
      if (archivoInfo && archivoInfo.path) {
        try { fs.unlinkSync(archivoInfo.path) } catch (e) { /* ignore */ }
      }
      archivoInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path
      }
    }

    entregables[idx] = {
      ...entregables[idx],
      titulo: titulo || entregables[idx].titulo,
      link: link || null,
      archivo: archivoInfo,
      updatedAt: new Date().toISOString()
    }

    return res.json(entregables[idx])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export const deleteEntregable = (req, res) => {
  try {
    const id = Number(req.params.id)
    const idx = entregables.findIndex((t) => t.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Entregable no encontrado' })

    const removed = entregables.splice(idx, 1)[0]
    if (removed && removed.archivo && removed.archivo.path) {
      try { fs.unlinkSync(removed.archivo.path) } catch (e) { /* ignore */ }
    }

    return res.json({ message: 'Eliminado' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// helper: ensure uploads dir exists
export const ensureUploadsDir = (uploadsPath) => {
  try {
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })
  } catch (err) {
    console.error('Error creando uploads dir', err)
  }
}
