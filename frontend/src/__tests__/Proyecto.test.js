import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

vi.mock('../services/api.js', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] })),
        post: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
        put: vi.fn(() => Promise.resolve({ data: {} })),
        delete: vi.fn(() => Promise.resolve({ data: {} }))
    }
}));

describe('Proyecto Component', () => {
    let Proyecto;

    beforeEach(async () => {
        const mod = await import('../components/Proyecto.vue');
        Proyecto = mod.default;
    });

    it('debe montarse correctamente', () => {
        const router = createRouter({
            history: createWebHistory(),
            routes: []
        });

        const wrapper = mount(Proyecto, {
            props: {
                nombreProyecto: 'Proyecto de Prueba',
                tipoProyecto: 'Audiovisual',
                estadoProyecto: 'En Progreso',
                fechaInicio: '2026-01-01',
                fechaFinEstimada: '2026-06-01',
                presupuesto: 5000
            },
            global: {
                plugins: [router]
            }
        });

        expect(wrapper.exists()).toBe(true);
    });
});
