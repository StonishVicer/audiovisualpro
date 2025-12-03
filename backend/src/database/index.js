import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Creamos el pool usando las variables de entorno
export const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
})

// Log para confirmar que cargó (opcional)
console.log('Configuración de BD cargada para:', process.env.DB_NAME)