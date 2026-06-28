import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockPool = { query: jest.fn() };
const mockBcrypt = { compare: jest.fn() };
const mockJwt = { sign: jest.fn() };

jest.unstable_mockModule('../config/database.js', () => ({ pool: mockPool }));
jest.unstable_mockModule('../config/env.js', () => ({ config: { jwt: { secret: 'test-secret' } } }));
jest.unstable_mockModule('bcryptjs', () => ({ default: { compare: mockBcrypt.compare }, compare: mockBcrypt.compare }));
jest.unstable_mockModule('jsonwebtoken', () => ({ default: { sign: mockJwt.sign }, sign: mockJwt.sign }));

const { login } = await import('../controllers/auth.controller.js');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { usuario_gestor: 'admin', pass_gestor: 'admin123' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        jest.clearAllMocks();
    });

    it('debe retornar 404 si el usuario no existe', async () => {
        mockPool.query.mockResolvedValue({ rows: [] });
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe retornar 401 si la contraseña es incorrecta', async () => {
        mockPool.query.mockResolvedValue({ rows: [{ id_gestor: 1, pass_gestor: 'hash' }] });
        mockBcrypt.compare.mockResolvedValue(false);
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debe retornar token si las credenciales son válidas', async () => {
        mockPool.query.mockResolvedValue({ rows: [{ id_gestor: 1, usuario_gestor: 'admin', nombre_gestor: 'Admin', pass_gestor: 'hash' }] });
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('fake-jwt-token');
        await login(req, res);
        expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
    });

    it('debe retornar 500 si hay error', async () => {
        mockPool.query.mockRejectedValue(new Error('DB Error'));
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
