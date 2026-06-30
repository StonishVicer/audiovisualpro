import { createRouter, createWebHistory } from 'vue-router'
import api from '../services/api.js'

import MainView from '../modules/auth/Login.vue'
import LandingPage from '../modules/auth/Landing.vue'

import SystemView from '../modules/dashboard/SystemLayout.vue'
import Dashboard from '../modules/dashboard/Dashboard.vue'

import ClientList from '../modules/clients/ClientList.vue'
import ContractList from '../modules/clients/ContractList.vue'

import ProjectList from '../modules/projects/ProjectList.vue'

import LocationList from '../modules/resources/LocationList.vue'
import ResourceList from '../modules/resources/ResourceList.vue'

import StaffList from '../modules/personnel/StaffList.vue'
import StaffAssignment from '../modules/personnel/StaffAssignment.vue'

import DeliverableByProject from '../modules/deliverables/DeliverableByProject.vue'
import DeliverableStates from '../modules/deliverables/DeliverableStates.vue'

import InvoiceList from '../modules/finances/InvoiceList.vue'
import ExpenseList from '../modules/finances/ExpenseList.vue'
import StaffPayments from '../modules/finances/StaffPayments.vue'
import FinancialReports from '../modules/finances/FinancialReports.vue'


const routes = [
    {
        path: '/',
        name: 'Landing Page',
        component: LandingPage,
        meta: { requiresGuest: true }
    },
    {
        path: '/login',
        name: 'Main View',
        component: MainView,
        meta: { requiresGuest: true }
    },
    {
        path: '/system',
        component: SystemView,
        meta: { requiresAuth: true },
        children: [
            { path: '', name: 'Dashboard', component: Dashboard },
            { path: '/system/clientes', name: 'Clientes', component: ClientList },
            { path: '/system/contratos', name: 'Contratos', component: ContractList },
            { path: '/system/proyectos', name: 'Proyectos', component: ProjectList },
            { path: '/system/locaciones', name: 'Locaciones', component: LocationList },
            { path: '/system/recursos', name: 'Recursos', component: ResourceList },
            { path: '/system/personal', name: 'Personal', component: StaffList },
            { path: '/system/asignacionpersonal', name: 'Asignacion', component: StaffAssignment },
            { path: '/system/proyectoentregable', name: 'Proyecto Entregable', component: DeliverableByProject },
            { path: '/system/estadoentregables', name: 'Estado Entregables', component: DeliverableStates },
            { path: '/system/facturas', name: 'Facturas', component: InvoiceList },
            { path: '/system/gastos', name: 'Gastos', component: ExpenseList },
            { path: '/system/pagospersonal', name: 'Pagos Personal', component: StaffPayments },
            { path: '/system/reportesfinancieros', name: 'Reportes Financieros', component: FinancialReports },
            { path: '/system/finanzas', name: 'Finanzas', component: InvoiceList }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

let tokenVerified = false
let verifyPromise = null

router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth) {
        if (!token) {
            tokenVerified = false
            return next('/')
        }
        if (tokenVerified) {
            return next()
        }
        if (verifyPromise) {
            try {
                await verifyPromise
                return next()
            } catch {
                return next('/login')
            }
        }
        verifyPromise = api.get('/api/auth/verify')
        try {
            await verifyPromise
            tokenVerified = true
            verifyPromise = null
            return next()
        } catch (error) {
            localStorage.removeItem('token')
            tokenVerified = false
            verifyPromise = null
            return next('/login')
        }
    }

    if (to.meta.requiresGuest) {
        if (!token) {
            tokenVerified = false
            return next()
        }
        if (tokenVerified) {
            return next('/system')
        }
        if (!verifyPromise) {
            verifyPromise = api.get('/api/auth/verify')
        }
        try {
            await verifyPromise
            tokenVerified = true
            verifyPromise = null
            return next('/system')
        } catch (error) {
            localStorage.removeItem('token')
            tokenVerified = false
            verifyPromise = null
            return next()
        }
    }

    next()
})

export default router
