<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api.js";

import Calendario from '../../components/Calendario.vue' //CALENDARIO

const loading = ref(true)

//GRAFICAS
import DoughnutChart from '../../components/DoughnutChart.vue'
import BarChart from '../../components/BarChart.vue'

const personal = ref([])
const proyectos = ref([])
const roles = ref([])
const recursos = ref([])
const asignacionesPersonal = ref([])
const financeStats = ref(null)

const fetchData = async () => {
    try {
        const personalRes = await api.get('/api/personal')
        personal.value = personalRes.data

        const proyectosRes = await api.get('/api/proyectos')
        proyectos.value = proyectosRes.data

        const rolesRes = await api.get('/api/roles_personal')
        roles.value = rolesRes.data

        const recursosRes = await api.get('/api/recursostecnicos')
        recursos.value = recursosRes.data

        const asignacionesRes = await api.get('/api/asignaciones')
        asignacionesPersonal.value = asignacionesRes.data

        const financeRes = await api.get('/api/stats/finance')
        financeStats.value = financeRes.data

    } catch (err) {
        console.log('Error al cargar datos: ', err)
    }
}

//CONTEO - MAXIMO DE 5 DATOS EN GRAFICAS
const processChartData = (counts, defaultColors, otherColor = '#BDBDBD') => {
    const items = Object.entries(counts);

    items.sort(([, a], [, b]) => b - a);

    const topItems = items.slice(0, 5);
    const otherItems = items.slice(5);

    let labels = topItems.map(([label]) => label);
    let data = topItems.map(([, value]) => value);
    let backgroundColors = defaultColors.slice(0, topItems.length);

    if (otherItems.length > 0) {
        const otherSum = otherItems.reduce((sum, [, value]) => sum + value, 0);
        labels.push(`Otros ${otherSum}`);
        data.push(otherSum);
        backgroundColors.push(otherColor);
    }

    if (data.length === 0 || data.every(d => d === 0)) {
        return { 
            labels: ['Sin datos'], 
            data: [1], 
            backgroundColors: ['#E0E0E0'] 
        };
    }

    return { labels, data, backgroundColors };
}

//OPCIONES GENERALES
const optionsGeneral = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataValue = data.datasets[0].data[i];
              return {
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor ? data.datasets[0].borderColor[i] : 'rgba(0,0,0,0)',
                lineWidth: 1,
                hidden: isNaN(dataValue),
                index: i
              };
            });
          }
          return [];
        }
      }
    }
  }
}

//1 - PERSONAL POR ROL
const chartPersonalPorRol = computed(() => {
  const rolCounts = {};
  const rolMap = new Map(roles.value.map(r => [r.id_rol, r.nombre_rol]));

  personal.value.forEach(p => {
    const rolName = rolMap.get(p.id_rol) || 'Rol Desconocido'; 
    rolCounts[rolName] = (rolCounts[rolName] || 0) + 1;
  });

  const chartData = processChartData(
    rolCounts, 
    ['#ff443d', '#ffc53d', '#57ff3d', '#3da8ff', '#8e3dff'],
    '#757575'
  );

  return {
    labels: chartData.labels,
    datasets: [{
      backgroundColor: chartData.backgroundColors, 
      data: chartData.data,
    }]
  }
})

const optionsPersonalPorRol = {
  ...optionsGeneral,
  plugins: {
    ...optionsGeneral.plugins,
    title: { display: true, text: 'Personal por Rol', font: { size: 16 } }
  }
}

//2 - PROYECTOS POR TIPOS
const chartProyectosPorTipo = computed(() => {
  const tipoCounts = {};
  proyectos.value.forEach(p => {
    const tipoName = p.nombre_tipo || 'Desconocido';
    tipoCounts[tipoName] = (tipoCounts[tipoName] || 0) + 1;
  });

  const chartData = processChartData(
    tipoCounts,
    ['#83f288', '#54c45a', '#23ad2a', '#0a9411', '#007306'], '#757575'
  );
  
  return {
    labels: chartData.labels,
    datasets: [{
      backgroundColor: chartData.backgroundColors,
      data: chartData.data,
    }]
  }
})

const optionsProyectosPorTipo = {
  ...optionsGeneral,
  plugins: {
    ...optionsGeneral.plugins,
    title: { display: true, text: 'Proyectos por Tipo', font: { size: 16 } }
  }
}

//3 - PERSONAL ASIGNADO A PROYECTO
const chartPersonalAsignado = computed(() => {
  if (!personal.value.length) {
    return {
      labels: ['Sin datos'],
      datasets: [{ backgroundColor: ['#E0E0E0'], data: [1] }]
    };
  }

  // 1. Obtener la lista de IDs de personal que tienen AL MENOS UNA asignación
  // Usamos la tabla asignacion_personal
  const assignedPersonalIds = new Set(
    asignacionesPersonal.value.map(a => a.id_personal)
  );

  let assignedCount = 0;
  let unassignedCount = 0;

  // 2. Recorrer todo el personal para contarlos
  personal.value.forEach(p => {
    if (assignedPersonalIds.has(p.id_personal)) {
      assignedCount++;
    } else {
      unassignedCount++;
    }
  });
  
  // Si no hay datos de personal, devolvemos sin datos
  if (assignedCount + unassignedCount === 0) {
     return { labels: ['Sin datos'], datasets: [{ backgroundColor: ['#E0E0E0'], data: [1] }] };
  }

  return {
    // Etiqueta: Nombre + Cantidad (ej: Asignados 4)
    labels: [`Asignados ${assignedCount}`, `No Asignados ${unassignedCount}`],
    datasets: [{
      backgroundColor: ['#23ad2a', '#757575'], // Verde Oscuro y Gris
      data: [assignedCount, unassignedCount],
    }]
  }
})

const optionsPersonalAsignado = {
  ...optionsGeneral,
  plugins: {
    ...optionsGeneral.plugins,
    title: { display: true, text: 'Personal Asignado a Proyectos', font: { size: 16 } }
  }
}

// 4 - GASTOS POR CATEGORIA
const chartGastosCategoria = computed(() => {
    if (!financeStats.value || !financeStats.value.expensesByCategory) return { labels: [], datasets: [] };
    
    const cats = financeStats.value.expensesByCategory;
    const labels = cats.map(c => c.nombre_categoria);
    const data = cats.map(c => c.total);
    
    return {
        labels,
        datasets: [{
            backgroundColor: ['#ff443d', '#ffc53d', '#57ff3d', '#3da8ff', '#8e3dff'],
            data
        }]
    }
});

const optionsGastosCategoria = {
  ...optionsGeneral,
  plugins: {
    ...optionsGeneral.plugins,
    title: { display: true, text: 'Gastos por Categoría', font: { size: 16 } }
  }
}

// 5 - INGRESOS VS GASTOS (Últimos meses)
const chartIngresosGastos = computed(() => {
    if (!financeStats.value || !financeStats.value.monthlyStats) return { labels: [], datasets: [] };
    
    const incomeStats = financeStats.value.monthlyStats.income;
    const expenseStats = financeStats.value.monthlyStats.expenses;
    
    // Unir meses únicos
    const months = new Set([
        ...incomeStats.map(i => i.mes),
        ...expenseStats.map(e => e.mes)
    ]);
    const sortedMonths = Array.from(months).sort((a,b) => a - b);
    
    const labels = sortedMonths.map(m => {
        const date = new Date();
        date.setMonth(m - 1);
        return date.toLocaleString('es-ES', { month: 'short' });
    });
    
    const incomeData = sortedMonths.map(m => {
        const found = incomeStats.find(i => i.mes == m);
        return found ? found.total : 0;
    });
    
    const expenseData = sortedMonths.map(m => {
        const found = expenseStats.find(e => e.mes == m);
        return found ? found.total : 0;
    });

    return {
        labels,
        datasets: [
            {
                label: 'Ingresos',
                backgroundColor: '#23ad2a',
                data: incomeData
            },
            {
                label: 'Gastos',
                backgroundColor: '#ff443d',
                data: expenseData
            }
        ]
    }
});

const optionsIngresosGastos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Ingresos vs Gastos (Año Actual)', font: { size: 16 } }
    }
}

//FIN DE GRAFICAS

const cantClientsReg = ref(0)
const cantEmpleados = ref(0)
const cantTiposProyectos = ref(0)
const cantEstadosProyectos = ref(0)
const cantLocaciones = ref(0)
const cantRecursos = ref(0)
const cantTiposRecursos = ref(0)
const cantRolesPersonal = ref(0)
const cantProyectos = ref(0)

const cargarCantClientsReg = async () => {
    try {
        const res = await api.get('/api/clientes')
        cantClientsReg.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de clientes registrados: ', err)
    }
}

const cargarCantEmpleados = async () => {
    try {
        const res = await api.get('/api/personal')
        cantEmpleados.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de empleados: ', err)
    }
}

const cargarCantTiposProyectos = async () => {
    try {
        const res = await api.get('/api/tiposproyecto')
        cantTiposProyectos.value = res.data.length
    } catch (err) {
        console.log('Error al cargar los tipos de proyectos: ', err)
    }
}

const cargarCantEstadosProyectos = async () => {
    try {
        const res = await api.get('/api/estadosproyecto')
        cantEstadosProyectos.value = res.data.length
    } catch (err) {
        console.log('Error al cargar los estados de proyectos: ', err)
    }
}

const cargarCantLocaciones = async () => {
    try {
        const res = await api.get('/api/locacion')
        cantLocaciones.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de locaciones: ', err)
    }
}

const cargarCantRecursos = async () => {
    try {
        const res = await api.get('/api/recursostecnicos')
        cantRecursos.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de recursos: ', err)
    }
}

const cargarCantTiposRecursos = async () => {
    try {
        const res = await api.get('/api/tiposrecursos')
        cantTiposRecursos.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de tipos de recursos: ', err)
    }
}

const cargarCantRolesPersonal = async () => {
    try {
        const res = await api.get('/api/roles_personal')
        cantRolesPersonal.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de roles de personal: ', err)
    }
}

const cargarCantProyectos = async () => {
    try {
        const res = await api.get('/api/proyectos')
        cantProyectos.value = res.data.length
    } catch (err) {
        console.log('Error al cargar la cantidad de proyectos: ', err)
    }
}

onMounted(() => {
    cargarCantClientsReg()
    cargarCantEmpleados()
    cargarCantTiposProyectos()
    cargarCantEstadosProyectos()
    cargarCantLocaciones()
    cargarCantRecursos()
    cargarCantTiposRecursos()
    cargarCantRolesPersonal()
    cargarCantProyectos()
    fetchData()
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Dashboard</h3>
        </div>
        <div class="flex-1 overflow-y-auto border border-gray-200 p-2 rounded-lg min-h-[400px] max-h-[calc(100vh-130px)]">
            <div class="w-full">
                <div class="grid grid-cols-3 gap-4 h-full">
                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                        <div class="border-b border-gray-200 pb-2 mb-4">
                            <h3 class="text-center font-bold text-lg">Calendario</h3>
                        </div>
                        <Calendario />
                    </div>

                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                        <div class="flex flex-col">
                            <div class="border-b border-gray-200 pb-2 mb-4">
                                <h3 class="text-center font-bold text-lg">Datos Generales</h3>
                            </div>
                            <p class="text-green-600 font-semibold">Cantidad de Empleados: {{ cantEmpleados }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Clientes: {{ cantClientsReg }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Tipos de Proyectos: {{ cantTiposProyectos }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Estados de Proyectos: {{ cantEstadosProyectos }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Locaciones: {{ cantLocaciones }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Recursos Técnicos: {{ cantRecursos }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Tipos de Recursos: {{ cantTiposRecursos }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Roles de Personal: {{ cantRolesPersonal }}</p>
                            <p class="text-green-600 font-semibold">Cantidad de Proyectos: {{ cantProyectos }}</p>
                        </div>
                    </div>

                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                        <div class="border-b border-gray-200 pb-2 mb-4">
                            <h3 class="text-center font-bold text-lg">Desglose de Gastos</h3>
                        </div>
                         <div class="flex flex-col items-center h-64">
                            <DoughnutChart v-if="financeStats" :chart-data="chartGastosCategoria" :chart-options="optionsGastosCategoria" class="h-full w-full"/>
                            <div v-else class="flex items-center justify-center h-full text-gray-400">Cargando...</div>
                        </div>
                    </div>

                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg col-span-2">
                        <div class="border-b border-gray-200 pb-2 mb-4">
                            <h3 class="text-center font-bold text-lg">Graficas</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="flex flex-col items-center">
                                <DoughnutChart :chart-data="chartProyectosPorTipo" :chart-options="optionsProyectosPorTipo" class="h-64 w-full"/>
                            </div>
                            <div class="flex flex-col items-center">
                                <DoughnutChart :chart-data="chartPersonalAsignado" :chart-options="optionsPersonalAsignado" class="h-64 w-full"/>
                            </div>
                            <div class="flex flex-col items-center">
                                <DoughnutChart :chart-data="chartPersonalPorRol" :chart-options="optionsPersonalPorRol" class="h-64 w-full"/>
                            </div>
                        </div>
                    </div>

                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                         <div class="border-b border-gray-200 pb-2 mb-4">
                            <h3 class="text-center font-bold text-lg">Finanzas</h3>
                        </div>
                        <div class="flex flex-col items-center h-64">
                             <BarChart v-if="financeStats" :chart-data="chartIngresosGastos" :chart-options="optionsIngresosGastos" class="h-full w-full"/>
                             <div v-else class="flex items-center justify-center h-full text-gray-400">Cargando...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>