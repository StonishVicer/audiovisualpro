import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import api from '../services/api.js';

vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn(() => ({
                get: vi.fn(),
                post: vi.fn(),
                put: vi.fn(),
                delete: vi.fn(),
                interceptors: {
                    request: { use: vi.fn() },
                    response: { use: vi.fn() }
                }
            }))
        }
    };
});

describe('API Service', () => {
    it('debe crear instancia de axios con baseURL correcta', () => {
        expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:3000'
        });
    });

    it('debe tener método get disponible', () => {
        expect(api.get).toBeDefined();
        expect(typeof api.get).toBe('function');
    });

    it('debe tener método post disponible', () => {
        expect(api.post).toBeDefined();
        expect(typeof api.post).toBe('function');
    });

    it('debe tener método put disponible', () => {
        expect(api.put).toBeDefined();
        expect(typeof api.put).toBe('function');
    });

    it('debe tener método delete disponible', () => {
        expect(api.delete).toBeDefined();
        expect(typeof api.delete).toBe('function');
    });
});
