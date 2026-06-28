import { AuthModel } from '../models/auth.js'

export const AuthService = {
    async login(usuario_gestor, pass_gestor) {
        const result = await AuthModel.findByUsername(usuario_gestor)
        if (result.rows.length === 0) {
            return { status: 404, body: { message: 'Usuario no encontrado.' } }
        }

        const gestor = result.rows[0]
        const valid = await AuthModel.comparePassword(pass_gestor, gestor.pass_gestor)
        if (!valid) {
            return { status: 401, body: { message: 'Contraseña incorrecta.' } }
        }

        const token = AuthModel.generateToken(gestor)
        return { status: 200, body: { token } }
    }
}
