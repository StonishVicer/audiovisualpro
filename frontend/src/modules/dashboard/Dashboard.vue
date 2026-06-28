<script setup>
import { ref, onMounted, computed } from "vue"
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import api from "../../services/api.js"
import DoughnutChart from '../../components/DoughnutChart.vue'
import BarChart from '../../components/BarChart.vue'
import WizardProyecto from '../../components/WizardProyecto.vue'

const showWizard = ref(false)

const proyectos = ref([])
const personal = ref([])
const roles = ref([])
const financeStats = ref(null)
const asignacionesPersonal = ref([])

const summaryCards = ref({
    proyectosActivos: 0,
    clientes: 0,
    gastosMes: 0,
    ingresosMes: 0
})

const fetchData = async () => {
    try {
        const [proyRes, persRes, rolesRes, asigRes, finRes, clientesRes] = await Promise.all([
            api.get('/api/proyectos'),
            api.get('/api/personal'),
            api.get('/api/roles_personal'),
            api.get('/api/asignaciones'),
            api.get('/api/stats/finance'),
            api.get('/api/clientes')
        ])
        proyectos.value = proyRes.data
        personal.value = persRes.data
        roles.value = rolesRes.data
        asignacionesPersonal.value = asigRes.data
        financeStats.value = finRes.data

        summaryCards.value.clientes = clientesRes.data.length
        summaryCards.value.proyectosActivos = proyRes.data.filter(p => p.id_estado_proyecto && p.nombre_estado !== 'Finalizado' && p.nombre_estado !== 'Cancelado').length

        if (finRes.data) {
            const monthly = finRes.data.monthlyStats
            if (monthly) {
                const today = new Date()
                const mesActual = today.getMonth() + 1
                const ingresoMes = (monthly.income || []).find(i => i.mes == mesActual)
                const gastoMes = (monthly.expenses || []).find(e => e.mes == mesActual)
                summaryCards.value.ingresosMes = ingresoMes ? ingresoMes.total : 0
                summaryCards.value.gastosMes = gastoMes ? gastoMes.total : 0
            }
        }
    } catch (err) {
        console.error('Error al cargar dashboard:', err)
    }
}

const processChartData = (counts, defaultColors, otherColor = '#BDBDBD') => {
    const items = Object.entries(counts)
    items.sort(([, a], [, b]) => b - a)
    const topItems = items.slice(0, 5)
    const otherItems = items.slice(5)
    let labels = topItems.map(([label]) => label)
    let data = topItems.map(([, value]) => value)
    let backgroundColors = defaultColors.slice(0, topItems.length)
    if (otherItems.length > 0) {
        labels.push('Otros')
        data.push(otherItems.reduce((sum, [, value]) => sum + value, 0))
        backgroundColors.push(otherColor)
    }
    if (data.length === 0 || data.every(d => d === 0)) {
        return { labels: ['Sin datos'], data: [1], backgroundColors: ['#E0E0E0'] }
    }
    return { labels, data, backgroundColors }
}

const optionsGeneral = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                generateLabels: (chart) => {
                    return chart.data.labels.map((label, i) => ({
                        text: label,
                        fillStyle: chart.data.datasets[0].backgroundColor[i],
                        hidden: false,
                        index: i
                    }))
                }
            }
        }
    }
}

const chartProyectosPorTipo = computed(() => {
    const tipoCounts = {}
    proyectos.value.forEach(p => {
        const tipo = p.nombre_tipo || 'Desconocido'
        tipoCounts[tipo] = (tipoCounts[tipo] || 0) + 1
    })
    const cd = processChartData(tipoCounts, ['#83f288', '#54c45a', '#23ad2a', '#0a9411', '#007306'], '#757575')
    return { labels: cd.labels, datasets: [{ backgroundColor: cd.backgroundColors, data: cd.data }] }
})

const chartPersonalAsignado = computed(() => {
    if (!personal.value.length) return { labels: ['Sin datos'], datasets: [{ backgroundColor: ['#E0E0E0'], data: [1] }] }
    const assignedIds = new Set(asignacionesPersonal.value.map(a => a.id_personal))
    let assigned = 0, unassigned = 0
    personal.value.forEach(p => assignedIds.has(p.id_personal) ? assigned++ : unassigned++)
    return {
        labels: [`Asignados ${assigned}`, `No Asignados ${unassigned}`],
        datasets: [{ backgroundColor: ['#23ad2a', '#757575'], data: [assigned, unassigned] }]
    }
})

const chartGastosCategoria = computed(() => {
    if (!financeStats.value?.expensesByCategory) return { labels: [], datasets: [] }
    const cats = financeStats.value.expensesByCategory
    return {
        labels: cats.map(c => c.nombre_categoria),
        datasets: [{ backgroundColor: ['#ff443d', '#ffc53d', '#57ff3d', '#3da8ff', '#8e3dff'], data: cats.map(c => c.total) }]
    }
})

const chartIngresosGastos = computed(() => {
    if (!financeStats.value?.monthlyStats) return { labels: [], datasets: [] }
    const incomeStats = financeStats.value.monthlyStats.income || []
    const expenseStats = financeStats.value.monthlyStats.expenses || []
    const months = new Set([...incomeStats.map(i => i.mes), ...expenseStats.map(e => e.mes)])
    const sorted = Array.from(months).sort((a, b) => a - b)
    const labels = sorted.map(m => {
        const d = new Date(); d.setMonth(m - 1)
        return d.toLocaleString('es-ES', { month: 'short' })
    })
    return {
        labels,
        datasets: [
            { label: 'Ingresos', backgroundColor: '#23ad2a', data: sorted.map(m => incomeStats.find(i => i.mes == m)?.total || 0) },
            { label: 'Gastos', backgroundColor: '#ff443d', data: sorted.map(m => expenseStats.find(e => e.mes == m)?.total || 0) }
        ]
    }
})

const onWizardCreated = () => {
    showWizard.value = false
    fetchData()
}

const formatoBs = (val) => {
    return parseFloat(val || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
}

onMounted(fetchData)
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h3 class="font-bold text-lg">Dashboard</h3>
            <div class="flex gap-2">
                <button @click="showWizard = true"
                    class="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-sm cursor-pointer">
                    <Icon icon="ix:project-new" width="18" height="18" />
                    Nuevo Proyecto
                </button>
                <RouterLink to="/system/clientes"
                    class="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-sm cursor-pointer">
                    <Icon icon="mdi:account-plus" width="18" height="18" />
                    Nuevo Cliente
                </RouterLink>
                <RouterLink to="/system/finanzas"
                    class="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-sm cursor-pointer">
                    <Icon icon="material-symbols:add-card" width="18" height="18" />
                    Nuevo Gasto
                </RouterLink>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-4">
            <!-- Summary Cards -->
            <div class="grid grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-green-100 p-2.5 rounded-xl"><Icon icon="ix:project" width="24" height="24" class="text-green-600" /></div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-semibold">Proyectos Activos</p>
                            <p class="text-2xl font-bold text-green-600">{{ summaryCards.proyectosActivos }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-100 p-2.5 rounded-xl"><Icon icon="mdi:account-group" width="24" height="24" class="text-blue-600" /></div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-semibold">Clientes</p>
                            <p class="text-2xl font-bold text-blue-600">{{ summaryCards.clientes }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-red-100 p-2.5 rounded-xl"><Icon icon="material-symbols:trending-down" width="24" height="24" class="text-red-600" /></div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-semibold">Gastos del Mes</p>
                            <p class="text-2xl font-bold text-red-600">Bs. {{ formatoBs(summaryCards.gastosMes) }}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-purple-100 p-2.5 rounded-xl"><Icon icon="material-symbols:trending-up" width="24" height="24" class="text-purple-600" /></div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-semibold">Ingresos del Mes</p>
                            <p class="text-2xl font-bold text-purple-600">Bs. {{ formatoBs(summaryCards.ingresosMes) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-white rounded-xl p-4 border border-green-100 shadow-sm col-span-2">
                    <h4 class="font-semibold text-gray-700 text-sm mb-2">Ingresos vs Gastos (Año Actual)</h4>
                    <div class="h-64">
                        <BarChart v-if="financeStats" :chart-data="chartIngresosGastos" :chart-options="{ responsive: true, maintainAspectRatio: false }" class="h-full w-full" />
                        <div v-else class="flex items-center justify-center h-full text-gray-400">Cargando...</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                    <h4 class="font-semibold text-gray-700 text-sm mb-2">Gastos por Categoria</h4>
                    <div class="h-64">
                        <DoughnutChart v-if="financeStats" :chart-data="chartGastosCategoria" :chart-options="optionsGeneral" class="h-full w-full" />
                        <div v-else class="flex items-center justify-center h-full text-gray-400">Cargando...</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                    <h4 class="font-semibold text-gray-700 text-sm mb-2">Proyectos por Tipo</h4>
                    <div class="h-56">
                        <DoughnutChart v-if="proyectos.length" :chart-data="chartProyectosPorTipo" :chart-options="optionsGeneral" class="h-full w-full" />
                        <div v-else class="flex items-center justify-center h-full text-gray-400">Sin datos</div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                    <h4 class="font-semibold text-gray-700 text-sm mb-2">Personal Asignado</h4>
                    <div class="h-56">
                        <DoughnutChart v-if="personal.length" :chart-data="chartPersonalAsignado" :chart-options="optionsGeneral" class="h-full w-full" />
                        <div v-else class="flex items-center justify-center h-full text-gray-400">Sin datos</div>
                    </div>
                </div>
            </div>

            <!-- Ultimos Proyectos -->
            <div class="bg-white rounded-xl p-4 border border-green-100 shadow-sm" v-if="proyectos.length">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-700 text-sm">Ultimos Proyectos</h4>
                    <RouterLink to="/system/proyectos" class="text-xs text-green-600 hover:text-green-700 font-medium">
                        Ver todos
                    </RouterLink>
                </div>
                <div class="divide-y divide-gray-100">
                    <div v-for="p in proyectos.slice(0, 5)" :key="p.id_proyecto"
                        class="flex items-center justify-between py-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" :class="p.nombre_estado === 'Finalizado' ? 'bg-gray-400' : 'bg-green-400'"></span>
                            <span class="font-medium text-gray-700">{{ p.nombre_proyecto }}</span>
                        </div>
                        <span class="text-gray-400 text-xs">{{ p.nombre_tipo || 'Sin tipo' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <WizardProyecto v-if="showWizard" @close="showWizard = false" @created="onWizardCreated" />
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
</style>
