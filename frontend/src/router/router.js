import { createRouter, createWebHistory } from 'vue-router'

//MAIN VIEWS
import MainView from '../views/MainView.vue'

//SYSTEM VIEWS
import SystemView from '../views/systemviews/SystemView.vue'
    /*DASHBOARD*/ import Dashboard from '../views/systemviews/Dashboard.vue'
    /*GESTION CLENTES*/ import GestionClientes from '../views/systemviews/clientes_contratos/GestionClientes.vue'
    /*GESTION CONTRATOS */ import GestionContratos from '../views/systemviews/clientes_contratos/GestionContratos.vue'
    /*GESTION PROYECTOS*/ import GestionProyectos from '../views/systemviews/proyectos/GestionProyectos.vue'
    /*GESTION TIPOS*/ import GestionTipos from '../views/systemviews/proyectos/GestionTipos.vue'
    /*GESTION ESTADOS*/ import GestionEstados from '../views/systemviews/proyectos/GestionEstados.vue'
    /*GESTION LOCACIONES*/ import GestionLocaciones from '../views/systemviews/locaciones_recursos/GestionLocaciones.vue'
    /*GESTION RECURSOS*/ import GestionRecursos from '../views/systemviews/locaciones_recursos/GestionRecursos.vue'
    /*GESTION PERSONAL*/ import GestionPersonal from '../views/systemviews/personal/GestionPersonal.vue'
    /*ASIGNACION PERSONAL*/ import AsignacionPersonal from '../views/systemviews/personal/AsignacionPersonal.vue'
    /*GESTION ROLES PERSONAL*/ import GestionRoles from '../views/systemviews/personal/GestionRoles.vue'
    /*PROYECTOS ENTREGABLES*/ import ProyectoEntregable from '../views/systemviews/entregables/ProyectoEntregable.vue'
    /*ESTADO ENTREGABLES*/ import EstadoEntregables from '../views/systemviews/entregables/EstadoEntregables.vue'
    /*GESTION FACTURAS*/ import GestionFacturas from '../views/systemviews/finanzas/GestionFacturas.vue'
    /*GESTION GASTOS*/ import GestionGastos from '../views/systemviews/finanzas/GestionGastos.vue'
    /*PAGOS PERSONAL*/ import PagosPersonal from '../views/systemviews/finanzas/PagosPersonal.vue'
    /*REPORTES FINANCIEROS*/ import ReportesFinancieros from '../views/systemviews/finanzas/ReportesFinancieros.vue'
    /*CHAT */ import AdminChat from '../views/systemviews/chat/AdminChat.vue'

//CLIENT VIEWS
import ClientChat from '../views/clientviews/ClientChat.vue'
import { compile } from 'vue'

const routes = [
    {
        path: '/',
        name: 'Main View',
        component: MainView,
        meta: { requiresGuest: true}
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
            {
                path: '',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: '/system/clientes',
                name: 'Clientes',
                component: GestionClientes
            },
            {
                path: '/system/contratos',
                name: 'Contratos',
                component: GestionContratos
            },
            {
                path: '/system/proyectos',
                name: 'Proyectos',
                component: GestionProyectos
            },
            {
                path: '/system/tiposproyectos',
                name: 'Tipos',
                component: GestionTipos
            },
            {
                path: '/system/estadosproyectos',
                name: 'Estados',
                component: GestionEstados
            },
            {
                path: '/system/locaciones',
                name: 'Locaciones',
                component: GestionLocaciones
            },
            {
                path: '/system/recursos',
                name: 'Recursos',
                component: GestionRecursos
            },
            {
                path: '/system/personal',
                name: 'Personal',
                component: GestionPersonal
            },
            {
                path: '/system/asignacionpersonal',
                name: 'Asignacion',
                component: AsignacionPersonal
            },
            {
                path: '/system/rolespersonal',
                name: 'Roles',
                component: GestionRoles
            },
            {
                path: '/system/proyectoentregable',
                name: 'Proyecto Entregable',
                component: ProyectoEntregable
            },
            {
                path: '/system/estadoentregables',
                name: 'Estado Entregables',
                component: EstadoEntregables
            },
            {
                path: '/system/facturas',
                name: 'Facturas',
                component: GestionFacturas
            },
            {
                path: '/system/gastos',
                name: 'Gastos',
                component: GestionGastos
            },
            {
                path: '/system/pagospersonal',
                name: 'Pagos Personal',
                component: PagosPersonal
            },
            {
                path: '/system/reportesfinancieros',
                name: 'Reportes Financieros',
                component: ReportesFinancieros
            },
            {
                path: '/system/chat',
                name: 'Admin Chat',
                component: AdminChat
            }
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