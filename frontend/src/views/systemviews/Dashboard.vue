<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api.js";

//INICIO DE LAS GRAFICAS
//GRAFICA CIRCULAR
import { Pie } from "vue-chartjs";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

const personaXRol = ref([])

//KEYS
const chartKey = ref(0)

const cargarPersonaXRol = async () => {
  try {
    const res = await api.get('/api/personal')
    personaXRol.value = res.data
    
    const conteoPorRol = {}
    res.data.forEach((p) => {
      const nombreRol = p.nombre_rol || 'Sin rol'
      if (!conteoPorRol[nombreRol]) {
        conteoPorRol[nombreRol] = 0
      }
      conteoPorRol[nombreRol]++
    })
    
    chartData.value.labels = Object.keys(conteoPorRol)
    chartData.value.datasets[0].data = Object.values(conteoPorRol)

    chartKey.value += 1
  } catch (err) {
    console.log('Error al cargar el personal por rol: ', err)
  }
}

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Personal por Rol',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
      borderWidth: 1
    }
  ]
})
//FIN DE LAS GRAFICAS

const cantClientsReg = ref(0)
const cantEmpleados = ref(0)
const cantTiposProyectos = ref(0)
const cantEstadosProyectos = ref(0)
const cantLocaciones = ref(0)
const cantRecursos = ref(0)
const cantTiposRecursos = ref(0)
const cantRolesPersonal = ref(0)

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

onMounted(() => {
    cargarCantClientsReg()
    cargarCantEmpleados()
    cargarCantTiposProyectos()
    cargarCantEstadosProyectos()
    cargarCantLocaciones()
    cargarCantRecursos()
    cargarCantTiposRecursos()
    cargarCantRolesPersonal()

    //GRAFICAS
    cargarPersonaXRol()
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
                        Calendario
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
                        </div>
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                        
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg col-span-2">
                        <div class="border-b border-gray-200 pb-2 mb-4">
                            <h3 class="text-center font-bold text-lg">Graficas</h3>
                        </div>
                        <div class="h-[330px] max-w-[500px] mx-auto">
                            <Pie :key="chartKey" :data="chartData" :options="chartOptions" />
                        </div>
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>