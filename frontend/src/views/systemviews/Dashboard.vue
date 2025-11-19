<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api.js";

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
})
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Dashboard</h3>
        </div>
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
                Calendario
            </div>
            <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg col-span-2">
                Calendario
            </div>
            <div class="p-2 bg-white rounded-lg border border-green-100 shadow-lg">
                Calendario
            </div>
        </div>
    </div>
</template>