import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { getEntregables, createEntregable, updateEntregable, deleteEntregable, ensureUploadsDir } from '../controllers/entregables.controller.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Aseguramos carpeta uploads
const uploadsPath = path.join(__dirname, '../../uploads')
ensureUploadsDir(uploadsPath)

// Config multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsPath)
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, unique + '-' + file.originalname)
	}
})
const upload = multer({ storage })

const router = Router()
router.get('/', getEntregables)
router.post('/', upload.single('archivo'), createEntregable)
router.put('/:id', upload.single('archivo'), updateEntregable)
router.delete('/:id', deleteEntregable)

export default router