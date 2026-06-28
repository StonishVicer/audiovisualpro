import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const SECRET = process.env.JWT_SECRET

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' })
    }
}
