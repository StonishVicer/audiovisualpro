import { pool } from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

export const AuthModel = {
    findByUsername(usuario_gestor) {
        return pool.query('SELECT * FROM gestor WHERE usuario_gestor = $1', [usuario_gestor])
    },

    async comparePassword(plain, hash) {
        return bcrypt.compare(plain, hash)
    },

    generateToken(user) {
        return jwt.sign(
            { id_gestor: user.id_gestor, usuario_gestor: user.usuario_gestor, nombre_gestor: user.nombre_gestor },
            config.jwt.secret,
            { expiresIn: '2h' }
        )
    }
}
