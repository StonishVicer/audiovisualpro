<script setup>
import { Icon } from '@iconify/vue';

const arrayTest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<template>
    <div class="h-screen flex flex-col">
        <div class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="text-center font-bold text-lg">Gestion de Contratos</h3>
        </div>

        <div class="mb-3">
            <div class="flex justify-end">
                <button class="w-50 flex items-center text-center justify-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-lg transition-colors">
                    <Icon icon="mdi:paper-add" width="25" height="25" class="mr-2" />
                    Nuevo Contrato
                </button>
            </div>
        </div>

        <div class="mb-3">
            <div class="flex space-x-2">
                <div class="relative flex-1">
                    <Icon
                        icon="material-symbols:search"
                        width="25"
                        height="25"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Buscar contrato"
                    >
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[400px] max-h-[calc(100vh-240px)]">
            <div>
                <table class="table-auto w-full">
                    <thead>
                        <tr class="bg-green-100 text-green-900">
                            <th class="px-4 py-2 text-left">N* Contrato</th>
                            <th class="px-4 py-2 text-left">Proyecto</th>
                            <th class="px-4 py-2 text-left">Cliente</th>
                            <th class="px-4 py-2 text-left">Fecha de firma</th>
                            <th class="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="array in arrayTest" :key="array" class="border-b border-green-100 hover:bg-green-50 transition">
                            <td class="px-4 py-2">Contrato {{ array }}</td>
                            <td class="px-4 py-2">Proyecto {{ array }}</td>
                            <td class="px-4 py-2">Cliente {{ array }}</td>
                            <td class="px-4 py-2">{{ array }}/{{ array }}/202{{ array }}</td>
                            <td class="px-4 py-2 flex items-center gap-2">
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:edit" width="20" height="20" class="mr-2" />
                                    Editar
                                </button>
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="material-symbols:delete" width="20" height="20" class="mr-2" />
                                    Eliminar
                                </button>
                                <button
                                    class="flex items-center text-center justify-center cursor-pointer bg-yellow-300 hover:bg-yellow-500 text-black font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                    <Icon icon="clarity:details-solid" width="20" height="20" class="mr-2" />
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>