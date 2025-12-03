import { pool } from '../database/index.js'
import fs from 'fs'
import path from 'path'

// Helper para crear carpeta uploads si no existe
export const ensureUploadsDir = (uploadsPath) => {
  try {
    if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })
  } catch (err) {
    console.error('Error creando uploads dir', err)
  }
}

// --- OBTENER (SELECT) ---
export const getEntregables = async (req, res) => {
  try {
    // 1. Consultamos la BD real
    const result = await pool.query('SELECT * FROM entregables ORDER BY id_entregable DESC')

    // 2. "Desempaquetamos" la columna descripcion para sacar titulo y archivo
    const entregables = result.rows.map(row => {
      // La descripcion en BD es: "Titulo del archivo | URL"
      // Usamos " | " como separador
      const partes = row.descripcion ? row.descripcion.split(' | ') : ['Sin título']
      
      const tituloReal = partes[0]
      const archivoData = partes[1] || null

      let archivoObj = null
      let linkObj = null

      // Detectamos si lo que guardamos fue un Link HTTP o una ruta de archivo local
      if (archivoData && archivoData.startsWith('http') && !archivoData.includes('localhost')) {
        linkObj = archivoData // Es un link externo (Youtube, Drive, etc)
      } else if (archivoData) {
        // Es un archivo subido a nuestro server
        archivoObj = { 
          filename: 'Archivo Adjunto', 
          url: archivoData 
        }
      }

      // 3. Devolvemos el formato que espera tu Frontend (Vue)
      return {
        id: row.id_entregable, // Tu front usa .id
        titulo: tituloReal,
        link: linkObj,
        archivo: archivoObj,
        fecha_entrega: row.fecha_entrega_estimada,
        // Enviamos el estado por si acaso
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
    const { titulo, link, fecha_entrega } = req.body

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

    // 3. EL TRUCO: Empaquetar "Titulo | URL" en la columna descripcion
    // (Ya que no podemos crear columnas nuevas en la BD)
    const descripcionCombinada = `${titulo} | ${dataExtra}`

    // 4. ID Proyecto Hardcodeado a 1
    // Tu BD obliga a tener un id_proyecto. Como el form no lo pide, ponemos 1.
    // ASEGURATE DE TENER UN PROYECTO CON ID 1 EN TU BD.
    const idProyecto = 1 

    // 5. Insertar en PostgreSQL
    const query = `
      INSERT INTO entregables (id_proyecto, descripcion, fecha_entrega_estimada) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `
    const values = [idProyecto, descripcionCombinada, fecha_entrega || null]
    
    const result = await pool.query(query, values)
    const row = result.rows[0]

    // 6. Responder al frontend con el objeto creado
    const nuevoEntregable = {
      id: row.id_entregable,
      titulo: titulo,
      link: link || null,
      archivo: req.file ? { url: dataExtra, filename: req.file.filename } : null,
      fecha_entrega: row.fecha_entrega_estimada
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
    const { titulo, link, fecha_entrega } = req.body

    // 1. Lógica para determinar la nueva URL
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

    // 2. Re-empaquetar descripcion
    const descripcionCombinada = `${titulo} | ${dataExtra}`

    // 3. Actualizar en BD
    const query = `
        UPDATE entregables 
        SET descripcion = $1, fecha_entrega_estimada = $2 
        WHERE id_entregable = $3
        RETURNING *
    `
    const result = await pool.query(query, [descripcionCombinada, fecha_entrega || null, id])

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