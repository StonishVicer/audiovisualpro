export const errorHandler = (err, req, res, _next) => {
    console.error('Error no controlado:', err.message || err)

    const statusCode = err.statusCode || 500
    const message = err.message || 'Error interno del servidor'

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}
