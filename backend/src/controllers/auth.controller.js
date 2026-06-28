import { AuthService } from '../services/authService.js'

export const login = async (req, res) => {
    try {
        const { usuario_gestor, pass_gestor } = req.body
        const result = await AuthService.login(usuario_gestor, pass_gestor)
        res.status(result.status).json(result.body)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
