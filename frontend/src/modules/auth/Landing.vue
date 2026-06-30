<script setup>
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
</script>

<template>
    <header class="sticky top-0 z-50 bg-green-500 bg-opacity-90 shadow-lg">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <a href="#" class="text-2xl font-bold text-white tracking-wider">
                AUDIOVISUAL<span class="m-2 p-1 bg-white rounded-lg text-green-500">PRO</span>
            </a>
            <nav>
            	<RouterLink to="/login" class="text-lg bg-white rounded-lg cursor-pointer font-semibold text-green-500 p-2">
            Iniciar Sesion
            	</RouterLink>
            </nav>
        </div>
    </header>

    <section class="hero-bg h-[70vh] flex items-center justify-center text-center bg-white bg-opacity-70" style="background-blend-mode: darken;">
        <div class="max-w-4xl px-4">
            <h1 class="text-5xl sm:text-6xl lg:text-7xl text-gray-700 font-extrabold leading-tight mb-4">
                <span class="text-green-500">Transformamos</span> ideas en impacto visual.
            </h1>
            <p class="text-xl sm:text-2xl text-gray-500 mb-8">
                Producción de video, fotografía y post-producción de élite para marcas ambiciosas.
            </p>
        </div>
    </section>

    <section id="servicios" class="py-16 md:py-24">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl text-gray-700 font-bold text-center mb-12 border-b-2 border-green-500 inline-block mx-auto pb-2">Nuestros Servicios</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div class="bg-white-800 p-8 rounded-lg shadow-2xl border-2 border-green-500 transition duration-300">
                    <div class="text-green-500 mb-4">
                    	<Icon icon="mdi:video" width="65" height="65" />
                    </div>
                    <h3 class="text-2xl text-green-500 font-semibold mb-3">Producción de Video</h3>
                    <p class="text-gray-700">Desde cortometrajes corporativos hasta anuncios de alto impacto. Creamos narrativas que resuenan y convierten.</p>
                </div>

                <div class="bg-white-800 p-8 rounded-lg shadow-2xl border-2 border-green-500 transition duration-300">
                    <div class="text-green-500 mb-4">
                    	<Icon icon="mdi:camera" width="65" height="65" />
                    </div>
                    <h3 class="text-2xl text-green-500 font-semibold mb-3">Fotografía Profesional</h3>
                    <p class="text-gray-700">Retratos corporativos, fotografía de producto y cobertura de eventos. Imágenes que definen tu marca.</p>
                </div>

                <div class="bg-white-800 p-8 rounded-lg shadow-2xl border-2 border-green-500 transition duration-300">
                    <div class="text-green-500 mb-4">
                    	<Icon icon="ri:edit-fill" width="65" height="65" />
                    </div>
                    <h3 class="text-2xl text-green-500 font-semibold mb-3">Edición y Colorización</h3>
                    <p class="text-gray-700">Potenciamos tu material con una post-producción impecable: edición fluida, VFX y un etalonaje cinematográfico.</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-green-500 py-8">
        <div class="container font-semibold mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white">
            <p>&copy; 2025 AudiovisualPro. Todos los derechos reservados.</p>
        </div>
    </footer>
</template>