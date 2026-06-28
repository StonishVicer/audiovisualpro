import { AuthService } from '../services/authService.js'

export const login = async (req, res, next) => {
    try {
        const { usuario_gestor, pass_gestor } = req.body
        const result = await AuthService.login(usuario_gestor, pass_gestor)
        res.json(result)
    } catch (err) {
        next(err)
    }
}
