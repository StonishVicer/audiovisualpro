import express from 'express'
import multer from 'multer'
import path from 'path'
import { createEntregable, getEntregables, ensureUploadsDir, updateEntregable, deleteEntregable } from '../controllers/entregables.controller.js'

const router = express.Router()

const uploadsDir = path.resolve('uploads')
ensureUploadsDir(uploadsDir)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + '-' + file.originalname)
  }
})

const upload = multer({ storage })

router.get('/', getEntregables)
router.post('/', upload.single('archivo'), createEntregable)
router.put('/:id', upload.single('archivo'), updateEntregable)
router.delete('/:id', deleteEntregable)

export default router
