import { Router } from "express";
import { getLocacionById, getLocaciones, createLocacion, deleteLocacion, updateLocacion } from "../controllers/locacion.controller.js";
import { validateLocacion, validateIdParam } from '../middlewares/validators.js'
import { upload } from '../middlewares/multerConfig.js'

const router = Router()

router.post("/", upload.single('imagen'), validateLocacion, createLocacion)
router.get("/", getLocaciones)
router.get("/:id", validateIdParam, getLocacionById)
router.delete("/:id", validateIdParam, deleteLocacion)
router.put('/:id', upload.single('imagen'), validateIdParam, updateLocacion)

export default router
