import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '..', '..', '.env')

dotenv.config({ path: envPath })

export const config = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'audiovisualpro_db',
        port: parseInt(process.env.DB_PORT || '5432')
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret'
    },
    port: parseInt(process.env.PORT || '3000')
}
