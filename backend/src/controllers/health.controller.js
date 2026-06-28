import { pool } from '../config/database.js'
import { logger } from '../config/logger.js'

export const healthcheck = async (req, res) => {
    let dbStatus = 'disconnected'
    try {
        const result = await pool.query('SELECT 1')
        dbStatus = result ? 'connected' : 'disconnected'
    } catch (err) {
        logger.error('Healthcheck DB fallida', { error: err.message })
    }

    const status = dbStatus === 'connected' ? 'ok' : 'degraded'
    const statusCode = status === 'ok' ? 200 : 503

    res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        memory: {
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
    })
}
