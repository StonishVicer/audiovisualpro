import { AuthModel } from '../models/auth.js'
import { NotFoundError, UnauthorizedError } from '../utils/errors.js'

export const AuthService = {
    async login(usuario_gestor, pass_gestor) {
        const result = await AuthModel.findByUsername(usuario_gestor)
        if (result.rows.length === 0) {
            throw new NotFoundError('Usuario no encontrado')
        }

        const gestor = result.rows[0]
        const valid = await AuthModel.comparePassword(pass_gestor, gestor.pass_gestor)
        if (!valid) {
            throw new UnauthorizedError('Contraseña incorrecta')
        }

        const token = AuthModel.generateToken(gestor)
        return { token }
    }
}
