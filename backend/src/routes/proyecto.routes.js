import { Router } from "express";
import { getProyectoById, getProyectos, createProyecto, updateProyecto, deleteProyecto, asignarLocacion, desasignarLocacion, asignarRecurso, desasignarRecurso, getAsignacionesProyecto } from "../controllers/proyecto.controller.js";
import { validateProyecto, validateIdParam } from '../middlewares/validators.js'

const router = Router()

/**
 * @openapi
 * /api/proyectos:
 *   get:
 *     tags: [Proyectos]
 *     summary: Listar todos los proyectos
 *     responses: { 200: { description: Lista de proyectos } }
 *   post:
 *     tags: [Proyectos]
 *     summary: Crear un proyecto
 *     responses: { 201: { description: Proyecto creado } }
 */
router.get('/', getProyectos)
router.post('/', validateProyecto, createProyecto)

/**
 * @openapi
 * /api/proyectos/{id}:
 *   get:
 *     tags: [Proyectos]
 *     summary: Obtener proyecto por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Proyecto } }
 *   put:
 *     tags: [Proyectos]
 *     summary: Actualizar proyecto
 *     responses: { 200: { description: Proyecto actualizado } }
 *   delete:
 *     tags: [Proyectos]
 *     summary: Eliminar proyecto
 *     responses: { 200: { description: Proyecto eliminado } }
 */
router.get('/:id/asignaciones', validateIdParam, getAsignacionesProyecto)
router.get('/:id', validateIdParam, getProyectoById)
router.put('/:id', validateIdParam, updateProyecto)
router.delete('/:id', validateIdParam, deleteProyecto)

router.post('/asignarlocacion', asignarLocacion)
router.delete('/desasignarlocacion/:idProyecto/:idLocacion', desasignarLocacion)
router.post('/asignarrecurso', asignarRecurso)
router.delete('/desasignarrecurso/:idProyecto/:idRecurso', desasignarRecurso)

export default router
