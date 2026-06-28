<script setup>
import Sidebar from '../../components/Sidebar.vue'
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="flex h-screen overflow-hidden bg-green-50 p-4 gap-3">
        <Sidebar />

        <div class="w-full bg-white rounded-2xl shadow-lg p-5 border border-green-100 overflow-hidden">
            <RouterView />
        </div>
    </div>
</template>