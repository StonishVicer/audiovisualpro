<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const hoverMenu = ref(null)
const isOpen = ref(true)

const router = useRouter()

const menus = [
    {
        name: 'Dashboard',
        icon: 'material-symbols:dashboard',
        route: '/system'
    },
    {
        name: 'Chat',
        icon: 'material-symbols:chat',
        route: '/system/chat'
    },
    {
        name: 'Clientes y Contratos',
        icon: 'mdi:account-file',
        submenu: [
            { name: 'Clientes', icon: 'mdi:account', route: '/system/clientes' },
            { name: 'Contratos', icon: 'lets-icons:paper-fill', route: '/system/contratos' }
        ]
    },
    {
        name: 'Proyectos',
        icon: 'ix:project',
        submenu: [
            { name: 'Proyectos', icon: 'ix:project', route: '/system/proyectos' },
            { name: 'Tipos', icon: 'pajamas:status-neutral', route: '/system/tiposproyectos' },
            { name: 'Estados', icon: 'f7:status', route: '/system/estadosproyectos' }
        ]
    },
    {
        name: 'Locaciones y Recursos',
        icon: 'material-symbols:camera',
        submenu: [
            { name: 'Locaciones', icon: 'mdi:location', route: '/system/locaciones' },
            { name: 'Recursos', icon: 'mdi:camera', route: '/system/recursos' }
        ]
    },
    {
        name: 'Personal',
        icon: 'streamline-plump:office-worker-solid',
        submenu: [
            { name: 'Personal', icon: 'mdi:worker', route: '/system/personal' },
            { name: 'Asignacion', icon: 'material-symbols:work', route: '/system/asignacionpersonal' },
            { name: 'Roles', icon: 'eos-icons:role-binding', route: '/system/rolespersonal' }
        ]
    },
    {
        name: 'Entregables',
        icon: 'solar:delivery-bold',
        submenu: [
            { name: 'Entregables por Proyecto', icon: 'ix:project-scenarios', route: '/system/proyectoentregable' },
            { name: 'Estados de Entregables', icon: 'ix:project-scenarios', route: '/system/estadoentregables' }
        ]
    },
    {
        name: 'Finanzas',
        icon: 'material-symbols:paid',
        submenu: [
            { name: 'Facturas', icon: 'uil:bill', route: '/system/facturas' },
            { name: 'Gastos', icon: 'lsicon:list-filled', route: '/system/gastos' },
            { name: 'Pagos a Personal', icon: 'mdi:account-payment', route: '/system/pagospersonal' },
            { name: 'Reportes Financieros', icon: 'stash:billing-info-solid', route: '/system/reportesfinancieros' }
        ]
    }
]

const toggleSidebar = () => {
    isOpen.value = !isOpen.value
}

const logout = () => {
    const confirmacion = confirm('Esta seguro/a que desea cerrar sesion?')
    if (confirmacion) {
        localStorage.removeItem('token')
        router.push('/')
    }
}
</script>

<template>
    <div
        :class="[
            'bg-white rounded-xl p-4 shadow-lg border border-green-100 flex flex-col transition-all duration-300',
            isOpen ? 'w-70' : 'w-20'
        ]"
    >
        <div>
            <div class="flex items-center justify-center mb-6">
                <h2 v-if="isOpen" class="text-xl font-bold text-green-500 text-center flex-1">
                    AudiovisualPro
                </h2>
                <button
                    @click="toggleSidebar"
                    class="text-green-500 font-bold text-lg hover:bg-green-500 hover:text-white transition p-1 rounded"
                >
                    <Icon :icon="isOpen ? 'bxs:left-arrow' : 'bxs:right-arrow'" width="25" height="25" />
                </button>
            </div>

            <nav class="flex-1 space-y-2 relative">
                <template v-for="menu in menus" :key="menu.name">
                    <div
                        @mouseenter="hoverMenu = menu.name"
                        @mouseleave="hoverMenu = null"
                        class="relative group"
                    >
                        <RouterLink
                            v-if="!menu.subname"
                            :to="menu.route"
                            class="flex items-center gap-3 p-2 rounded-lg hover:bg-green-500 hover:text-white transition"
                        >
                            <Icon :icon="menu.icon" width="25" />
                            <span v-if="isOpen" class="font-semibold">{{ menu.name }}</span>
                        </RouterLink>

                        <div
                            v-else
                            class="flex items-center justify-between p-2 rounded-lg hover:bg-green-500 transition cursor-pointer"
                        >
                            <div class="flex items-center gap-3">
                                <Icon :icon="menu.icon" class="w-5 h-5 text-green-600" />
                                <span>{{ menu.name }}</span>
                            </div>
                        </div>

                        <div
                            v-if="menu.submenu && hoverMenu === menu.name"
                            class="absolute left-full top-0 ml-2 w-60 bg-white border border-green-100 rounded-lg shadow-lg p-2 z-50"
                        >
                            <template v-for="sub in menu.submenu" :key="sub.name">
                                <RouterLink
                                    :to="sub.route"
                                    class="flex items-center font-semibold p-2 rounded-lg hover:bg-green-500 hover:text-white transition"
                                >
                                    <Icon :icon="sub.icon" width="20" class="mr-2" />
                                    {{ sub.name }}
                                </RouterLink>
                            </template>
                        </div>
                    </div>
                </template>
                <div class="border-t border-gray-200">
                    <button
                        @click="logout"
                        :class="[
                            'cursor-pointer mt-2 flex items-center font-semibold p-2 rounded-lg hover:bg-red-500 hover:text-white transition',
                            isOpen ? 'w-full' : ''
                        ]"
                    >
                        <Icon icon="majesticons:logout-line" width="25" height="25" class="mr-2" />
                        <span v-if="isOpen">Cerrar Sesion</span>
                    </button>
                </div>
            </nav>
        </div>
    </div>
</template>