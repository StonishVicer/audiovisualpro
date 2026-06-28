import { createRouter, createWebHistory } from 'vue-router'

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

import AdminChat from '../modules/chat/AdminChat.vue'
import ClientChat from '../modules/chat/ClientChat.vue'

import SettingsView from '../modules/settings/SettingsView.vue'

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
        path: '/client/chat',
        name: 'Client Chat',
        component: ClientChat
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
            { path: '/system/chat', name: 'Admin Chat', component: AdminChat },
            { path: '/system/configuracion', name: 'Configuracion', component: SettingsView },
            // Redirecciones de rutas antiguas a Configuracion
            { path: '/system/tiposproyectos', redirect: '/system/configuracion' },
            { path: '/system/estadosproyectos', redirect: '/system/configuracion' },
            { path: '/system/rolespersonal', redirect: '/system/configuracion' },
            { path: '/system/tiposrecursos', redirect: '/system/configuracion' },
            { path: '/system/categoriasgasto', redirect: '/system/configuracion' },
            // Ruta para Finanzas (sidebar item)
            { path: '/system/finanzas', name: 'Finanzas', component: InvoiceList }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/')
    } else if (to.meta.requiresGuest && token) {
        next('/system')
    } else {
        next()
    }
})

export default router
