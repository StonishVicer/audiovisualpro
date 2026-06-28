import winston from 'winston'

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format

const devFormat = printf(({ level, message, timestamp, stack }) => {
    if (stack) return `${timestamp} [${level}]: ${message}\n${stack}`
    return `${timestamp} [${level}]: ${message}`
})

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            dirname: 'logs',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: 'combined.log',
            dirname: 'logs',
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            timestamp({ format: 'HH:mm:ss' }),
            colorize(),
            devFormat
        )
    }))
}
