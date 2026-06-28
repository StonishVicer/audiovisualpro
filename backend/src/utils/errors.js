export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational
        Error.captureStackTrace(this, this.constructor)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404)
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Datos inválidos') {
        super(message, 400)
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto con datos existentes') {
        super(message, 409)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401)
    }
}
