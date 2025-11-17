import { Router } from "express";
import { getLocacionById, getLocaciones, createLocacion, deleteLocacion } from "../controllers/locacion.controller.js";

const router = Router()
router.post("/", createLocacion)
router.get("/", getLocaciones)
router.get("/:id", getLocacionById)
router.delete("/:id", deleteLocacion)

export default router