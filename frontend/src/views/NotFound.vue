<script>
export default {
    methods: {
        volver() {
            this.$router.back()
        }
    }
}
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-green-500 font-bold text-2xl mb-6">404 -  Pagina no encontrada</h1>
        <div class="grid grid-cols-2 gap-2 flex items-center justify-center">
            <button @click="volver" class="bg-green-500 p-4 rounded-lg shadow-md cursor-pointer hover:bg-green-600 text-white transition font-bold">Volver</button>
            <h3 class="text-green-500 font-semibold text-lg"><- Volver a la pagina anterior</h3>
        </div>
    </div>
</template>