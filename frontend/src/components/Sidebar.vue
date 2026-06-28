<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const isOpen = ref(true)
const router = useRouter()

const menus = [
    {
        name: 'Dashboard',
        icon: 'material-symbols:dashboard',
        route: '/system'
    },
    {
        name: 'Proyectos',
        icon: 'ix:project',
        route: '/system/proyectos'
    },
    {
        name: 'Clientes',
        icon: 'mdi:account-group',
        route: '/system/clientes'
    },
    {
        name: 'Finanzas',
        icon: 'material-symbols:paid',
        route: '/system/finanzas'
    },
    {
        name: 'Chat',
        icon: 'material-symbols:chat',
        route: '/system/chat'
    },
    {
        name: 'Configuracion',
        icon: 'material-symbols:settings',
        route: '/system/configuracion'
    }
]

const toggleSidebar = () => {
    isOpen.value = !isOpen.value
}

const logout = () => {
    const confirmacion = confirm('Esta seguro/a que desea cerrar sesion?')
    if (confirmacion) {
        localStorage.removeItem('token')
        router.push('/login')
    }
}
</script>

<template>
    <div
        :class="[
            'bg-white rounded-2xl p-4 shadow-xl border border-green-100 flex flex-col transition-all duration-300 flex-shrink-0',
            isOpen ? 'w-64' : 'w-18'
        ]"
    >
        <div class="flex flex-col h-full">
            <div class="flex items-center justify-between mb-8">
                <h2 v-if="isOpen" class="text-xl font-extrabold text-green-600 flex-1 tracking-tight">
                    AVP<span class="text-gray-400 text-sm font-normal">ro</span>
                </h2>
                <button
                    @click="toggleSidebar"
                    class="text-green-500 font-bold text-lg hover:bg-green-500 hover:text-white transition p-1.5 rounded-lg cursor-pointer flex-shrink-0"
                >
                    <Icon :icon="isOpen ? 'mdi:chevron-left' : 'mdi:chevron-right'" width="22" height="22" />
                </button>
            </div>

            <nav class="flex-1 space-y-1">
                <RouterLink
                    v-for="menu in menus" :key="menu.name"
                    :to="menu.route"
                    :class="[
                        'flex items-center gap-3.5 p-3 rounded-xl transition-all group',
                        $route.path === menu.route || (menu.route !== '/system' && $route.path.startsWith(menu.route))
                            ? 'bg-green-500 text-white shadow-md shadow-green-200'
                            : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    ]"
                >
                    <Icon :icon="menu.icon" width="24" height="24" class="flex-shrink-0" />
                    <span v-if="isOpen" class="font-semibold text-[15px] whitespace-nowrap">{{ menu.name }}</span>
                </RouterLink>
            </nav>

            <div class="border-t border-gray-100 pt-3 mt-auto">
                <button
                    @click="logout"
                    :class="[
                        'cursor-pointer flex items-center gap-3.5 p-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition w-full',
                        isOpen ? '' : 'justify-center'
                    ]"
                >
                    <Icon icon="majesticons:logout-line" width="24" height="24" />
                    <span v-if="isOpen" class="font-semibold text-[15px]">Cerrar Sesion</span>
                </button>
            </div>
        </div>
    </div>
</template>
