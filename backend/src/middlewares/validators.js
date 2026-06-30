import { body, param, query, validationResult } from 'express-validator'
import { ValidationError } from '../utils/errors.js'

const handleValidation = (req, _res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new ValidationError('Error de validación')
        err.errors = errors.array()
        throw err
    }
    next()
}

export const validateProyecto = [
    body('nombre_proyecto').notEmpty().withMessage('Nombre del proyecto requerido'),
    body('id_tipo_proyecto').isInt({ min: 1 }).withMessage('Tipo de proyecto inválido'),
    body('id_estado_proyecto').isInt({ min: 1 }).withMessage('Estado de proyecto inválido'),
    body('presupuesto').optional().isFloat({ min: 0 }).withMessage('Presupuesto debe ser >= 0'),
    body('fecha_inicio').optional().isISO8601().toDate(),
    body('fecha_fin_estimada').optional().isISO8601().toDate(),
    handleValidation
]

export const validateCliente = [
    body('rif_cliente').notEmpty().withMessage('Identificación requerida'),
    body('nombre_cliente').notEmpty().withMessage('Nombre del cliente requerido'),
    body('email_cliente').optional().isEmail().withMessage('Email inválido'),
    body('telefono_cliente').optional().isString(),
    handleValidation
]

export const validatePersonal = [
    body('nombre_personal').notEmpty().withMessage('Nombre del personal requerido'),
    body('cedula_personal').optional().isString(),
    body('id_rol').optional().isInt({ min: 1 }).withMessage('Rol inválido'),
    body('salario').optional().isFloat({ min: 0 }).withMessage('Salario debe ser >= 0'),
    body('email_personal').optional().isEmail().withMessage('Email inválido'),
    handleValidation
]

export const validateLocacion = [
    body('nombre_locacion').notEmpty().withMessage('Nombre de locación requerido'),
    body('direccion').optional().isString(),
    body('descripcion_locacion').optional().isString(),
    handleValidation
]

export const validateRecursoTecnico = [
    body('nombre_equipo').notEmpty().withMessage('Nombre del equipo requerido'),
    body('id_tipo_recurso').isInt({ min: 1 }).withMessage('Tipo de recurso inválido'),
    handleValidation
]

export const validateContrato = [
    body('id_proyecto').isInt({ min: 1 }).withMessage('ID de proyecto requerido'),
    body('id_cliente').isInt({ min: 1 }).withMessage('ID de cliente requerido'),
    body('fecha_firma').isISO8601().toDate().withMessage('Fecha de firma inválida'),
    body('monto_contrato').isFloat({ min: 0 }).withMessage('Monto de contrato debe ser >= 0'),
    body('descripcion_servicios').optional().isString(),
    handleValidation
]

export const validateFactura = [
    body('numero_factura').notEmpty().withMessage('Número de factura requerido'),
    body('fecha_factura').isISO8601().toDate().withMessage('Fecha de factura inválida'),
    body('cliente_id').isInt({ min: 1 }).withMessage('ID de cliente requerido'),
    body('id_contrato').optional({ values: 'null' }).isInt({ min: 1 }),
    body('subtotal').optional().isFloat({ min: 0 }),
    body('total').optional().isFloat({ min: 0 }),
    body('estado').optional().isString(),
    body('items').optional().isArray(),
    handleValidation
]

export const validateGasto = [
    body('monto_gasto').isFloat({ min: 0 }).withMessage('Monto debe ser >= 0'),
    body('descripcion_gasto').optional().isString(),
    body('id_categoria_gasto').optional().isInt({ min: 1 }),
    body('id_proyecto').optional().isInt({ min: 1 }),
    body('fecha_gasto').optional().isISO8601().toDate(),
    handleValidation
]

export const validatePago = [
    body('id_personal').isInt({ min: 1 }).withMessage('ID de personal requerido'),
    body('id_proyecto').optional().isInt({ min: 1 }),
    body('monto_pagado').isFloat({ min: 0 }).withMessage('Monto debe ser >= 0'),
    body('fecha_pago').optional().isISO8601().toDate(),
    body('sueldo').optional().isFloat({ min: 0 }),
    body('extra').optional().isFloat({ min: 0 }),
    handleValidation
]

export const validateEntregable = [
    body('id_proyecto').isInt({ min: 1 }).withMessage('ID de proyecto requerido'),
    body('descripcion').optional().isString(),
    body('fecha_entrega_estimada').optional().isISO8601().toDate(),
    body('id_estado_entregable').optional().isInt({ min: 1 }),
    handleValidation
]

export const validateAsignacionPersonal = [
    body('id_proyecto').isInt({ min: 1 }).withMessage('ID de proyecto requerido'),
    body('id_personal').isInt({ min: 1 }).withMessage('ID de personal requerido'),
    body('horas_trabajadas').optional().isFloat({ min: 0 }),
    handleValidation
]

export const validateLogin = [
    body('usuario_gestor').notEmpty().withMessage('Usuario requerido'),
    body('pass_gestor').notEmpty().withMessage('Contraseña requerida'),
    handleValidation
]

export const validateIdParam = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    handleValidation
]

export const validateTipoNombre = [
    body('nombre_tipo').notEmpty().withMessage('Nombre del tipo requerido'),
    handleValidation
]

export const validateEstadoNombre = [
    body('nombre_estado').notEmpty().withMessage('Nombre del estado requerido'),
    handleValidation
]

export const validateRolNombre = [
    body('nombre_rol').notEmpty().withMessage('Nombre del rol requerido'),
    handleValidation
]

export const validateCategoriaNombre = [
    body('nombre_categoria').notEmpty().withMessage('Nombre de categoría requerido'),
    handleValidation
]

export const validateTipoRecursoNombre = [
    body('nombre_tipo').notEmpty().withMessage('Nombre del tipo requerido'),
    handleValidation
]
