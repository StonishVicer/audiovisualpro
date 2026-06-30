import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { logger } from '../config/logger.js'

const SECRET = config.jwt.secret

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        logger.debug('Token ausente en la petición', { url: req.originalUrl })
        return res.status(401).json({ message: 'No autorizado' })
    }

    if (!authHeader.startsWith('Bearer ')) {
        logger.debug('Formato de token inválido', { authHeader: authHeader.substring(0, 20) + '...' })
        return res.status(401).json({ message: 'Formato de token inválido. Use Bearer <token>' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch (err) {
        logger.warn('Token JWT inválido o expirado', { error: err.message, url: req.originalUrl })
        return res.status(401).json({ message: 'Token inválido o expirado' })
    }
}
