import { createRouter, createWebHistory } from 'vue-router'

// Auth
import MainView from '../modules/auth/Login.vue'
import LandingPage from '../modules/auth/Landing.vue'

// Dashboard
import SystemView from '../modules/dashboard/SystemLayout.vue'
import Dashboard from '../modules/dashboard/Dashboard.vue'

// Clients & Contracts
import ClientList from '../modules/clients/ClientList.vue'
import ContractList from '../modules/clients/ContractList.vue'

// Projects
import ProjectList from '../modules/projects/ProjectList.vue'
import ProjectTypes from '../modules/projects/ProjectTypes.vue'
import ProjectStates from '../modules/projects/ProjectStates.vue'

// Resources & Locations
import LocationList from '../modules/resources/LocationList.vue'
import ResourceList from '../modules/resources/ResourceList.vue'
import ResourceTypes from '../modules/resources/ResourceTypes.vue'

// Personnel
import StaffList from '../modules/personnel/StaffList.vue'
import StaffAssignment from '../modules/personnel/StaffAssignment.vue'
import StaffRoles from '../modules/personnel/StaffRoles.vue'

// Deliverables
import DeliverableByProject from '../modules/deliverables/DeliverableByProject.vue'
import DeliverableStates from '../modules/deliverables/DeliverableStates.vue'

// Finances
import InvoiceList from '../modules/finances/InvoiceList.vue'
import ExpenseList from '../modules/finances/ExpenseList.vue'
import ExpenseCategories from '../modules/finances/ExpenseCategories.vue'
import StaffPayments from '../modules/finances/StaffPayments.vue'
import FinancialReports from '../modules/finances/FinancialReports.vue'

// Chat
import AdminChat from '../modules/chat/AdminChat.vue'
import ClientChat from '../modules/chat/ClientChat.vue'

import NotFound from '../views/NotFound.vue'

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
        path: '/:pathMatch(.*)*',
        name: 'Not Found',
        component: NotFound
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
            { path: '/system/tiposproyectos', name: 'Tipos', component: ProjectTypes },
            { path: '/system/estadosproyectos', name: 'Estados', component: ProjectStates },
            { path: '/system/locaciones', name: 'Locaciones', component: LocationList },
            { path: '/system/recursos', name: 'Recursos', component: ResourceList },
            { path: '/system/tiposrecursos', name: 'Tipos Recursos', component: ResourceTypes },
            { path: '/system/personal', name: 'Personal', component: StaffList },
            { path: '/system/asignacionpersonal', name: 'Asignacion', component: StaffAssignment },
            { path: '/system/rolespersonal', name: 'Roles', component: StaffRoles },
            { path: '/system/proyectoentregable', name: 'Proyecto Entregable', component: DeliverableByProject },
            { path: '/system/estadoentregables', name: 'Estado Entregables', component: DeliverableStates },
            { path: '/system/facturas', name: 'Facturas', component: InvoiceList },
            { path: '/system/gastos', name: 'Gastos', component: ExpenseList },
            { path: '/system/categoriasgasto', name: 'Categorias de Gasto', component: ExpenseCategories },
            { path: '/system/pagospersonal', name: 'Pagos Personal', component: StaffPayments },
            { path: '/system/reportesfinancieros', name: 'Reportes Financieros', component: FinancialReports },
            { path: '/system/chat', name: 'Admin Chat', component: AdminChat }
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
