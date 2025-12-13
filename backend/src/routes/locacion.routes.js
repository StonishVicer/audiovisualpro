import { Router } from "express";
import { getLocacionById, getLocaciones, createLocacion, deleteLocacion, updateLocacion } from "../controllers/locacion.controller.js";
import { upload } from '../middlewares/multerConfig.js'

const router = Router()
router.post("/", upload.single('imagen'), createLocacion)
router.get("/", getLocaciones)
router.get("/:id", getLocacionById)
router.delete("/:id", deleteLocacion)
router.put('/:id', upload.single('imagen'), updateLocacion)

export default router