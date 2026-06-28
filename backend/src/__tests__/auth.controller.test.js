import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockLogin = jest.fn()

jest.unstable_mockModule('../services/authService.js', () => ({
    AuthService: { login: mockLogin }
}))

const { login } = await import('../controllers/auth.controller.js')

import { NotFoundError, UnauthorizedError } from '../utils/errors.js'

describe('Auth Controller', () => {
    let req, res, next

    beforeEach(() => {
        jest.clearAllMocks()
        req = { body: { usuario_gestor: 'admin', pass_gestor: 'admin123' } }
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() }
        next = jest.fn()
    })

    it('debe retornar token si las credenciales son válidas', async () => {
        mockLogin.mockResolvedValue({ token: 'fake-token' })
        await login(req, res, next)
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-token' })
    })

    it('debe llamar next con NotFoundError si el usuario no existe', async () => {
        mockLogin.mockRejectedValue(new NotFoundError('Usuario no encontrado'))
        await login(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
    })

    it('debe llamar next con UnauthorizedError si la contraseña es incorrecta', async () => {
        mockLogin.mockRejectedValue(new UnauthorizedError('Contraseña incorrecta'))
        await login(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
    })

    it('debe llamar next en error de BD', async () => {
        mockLogin.mockRejectedValue(new Error('DB error'))
        await login(req, res, next)
        expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
})
