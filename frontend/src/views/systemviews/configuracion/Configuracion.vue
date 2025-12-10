<script setup>
import { Icon } from '@iconify/vue'
import Modal from '../../../components/Modal.vue'
import Toast from '../../../components/Toast.vue'
import api from '../../../services/api.js'
</script>

<template>
	<div class="flex items-center space-x-6">
		<div class="relative flex-shrink-0">
			<Icon icon="mdi:account-tie" width="100" height="100" class="w-32 h-32 rounded-full object-cover ring-4 ring-green-500 bg-green-100 text-green-700 dark:ring-offset-gray-800 p-2" />
		</div>
		<div class="flex flex-col justify-center flex-grow">
			<div class="flex items-center">
				<h3 class="text-2xl font-extrabold text-green-700 mr-2">
					Alejandro Durán
				</h3>
				<button class="flex items-center cursor-pointer text-sm mt-2 px-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-1 rounded-lg transition-colors">
					Cambiar Nombre
					<Icon icon="material-symbols:edit" width="20" height="20" class="ml-2" />
				</button>
			</div>
			<div class="flex items-center">
				<p class="mt-1 text-base font-semibold text-gray-600 mr-2">
					@admin_alejandro
				</p>
				<button class="flex items-center cursor-pointer text-sm mt-2 px-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-1 rounded-lg transition-colors">
					Cambiar Nombre de Usuario
					<Icon icon="material-symbols:edit" width="20" height="20" class="ml-2" />
				</button>
			</div>
			<button class="flex w-50 text-center items-center cursor-pointer text-sm mt-2 px-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 rounded-lg transition-colors">
				Cambiar Contraseña
				<Icon icon="solar:password-bold" width="20" height="20" class="ml-2" />
			</button>
		</div>
	</div>
</template>