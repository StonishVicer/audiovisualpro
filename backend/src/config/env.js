import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '..', '..', '.env')

dotenv.config({ path: envPath })

const JWT_SECRET = process.env.JWT_SECRET

if (process.env.NODE_ENV !== 'production') {
    console.log(`[env] JWT_SECRET: ${JWT_SECRET ? '✅ Cargado correctamente' : '❌ NO definido'}`)
    console.log(`[env] .env path: ${envPath}`)
}

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET no está definido en producción')
    }
    console.warn('[env] ⚠️  JWT_SECRET no definido. Usando fallback (solo desarrollo). Define JWT_SECRET en .env')
}

export const config = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'audiovisualpro_db',
        port: parseInt(process.env.DB_PORT || '5432')
    },
    jwt: {
        secret: JWT_SECRET || 'fallback_secret'
    },
    port: parseInt(process.env.PORT || '3000')
}
