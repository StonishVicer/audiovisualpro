import { logger } from '../config/logger.js'

export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500
    const message = statusCode === 500 && !err.isOperational
        ? 'Error interno del servidor'
        : err.message

    if (statusCode === 500) {
        logger.error('Error no controlado', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        })
    } else {
        logger.warn('Error operacional', {
            statusCode,
            message: err.message,
            path: req.path,
            method: req.method
        })
    }

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            ...(err.errors && { errors: err.errors })
        })
    })
}
