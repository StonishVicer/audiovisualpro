import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { getEntregables, createEntregable, updateEntregable, deleteEntregable } from '../controllers/entregables.controller.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsPath = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    cb(allowed.includes(file.mimetype) ? null : new Error('Tipo de archivo no permitido'), allowed.includes(file.mimetype))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()
router.get('/', getEntregables)
router.post('/', upload.single('archivo'), createEntregable)
router.put('/:id', upload.single('archivo'), updateEntregable)
router.delete('/:id', deleteEntregable)

export default router
