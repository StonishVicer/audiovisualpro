<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '../services/api'
import { useRouter, RouterLink } from 'vue-router'

import Toast from '../components/Toast.vue'

const error = ref(false)
const loginMessage = ref('')

const isLoading = ref(false)

const showPassword = ref(false)

const usuario_gestor = ref('')
const pass_gestor = ref('')

const router = useRouter()

const handleLogin = async () => {
    isLoading.value = true

    try {
        if (!usuario_gestor.value || !pass_gestor.value) {
            error.value = true
            loginMessage.value = "Complete todos los campos"
            return
        }
        const res = await api.post('/api/auth/login', {
            usuario_gestor: usuario_gestor.value,
            pass_gestor: pass_gestor.value
        })
        localStorage.setItem('token', res.data.token)
        router.push('/system')
    } catch (err) {
        error.value = true
        loginMessage.value = err.response?.data?.message || 'Error al iniciar sesion'
    } finally {
        isLoading.value = false
    }
}

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            <div class="w-full bg-white rounded-2xl shadow-lg p-8 border border-green-100">
                <h1 class="text-center mb-4 font-bold text-green-600 text-xl">Inicio de Sesion</h1>
                
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div v-if="error" class="flex items-center justify-center text-[15px] font-semibold border border-red-200 bg-red-100 p-2 rounded-lg text-center text-red-500">
                        <Icon icon="mdi:error" width="25" class="mr-2" />
                        {{ loginMessage }}
                    </div>

                    <div class="mb-2">
                        <label class="block text-sm text-gray-600 mb-1">Nombre de Usuario</label>
                        <input
                            type="text"
                            v-model="usuario_gestor"
                            placeholder="Usuario"
                            class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                    </div>

                    <div class="mb-2">
                        <label class="block text-sm text-gray-600 mb-1">Contraseña</label>
                        <div class="relative">
                            <input 
                                :type="showPassword ? 'text' : 'password'"
                                v-model="pass_gestor"
                                placeholder="Contraseña"
                                class="transition w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                            <button
                                type="button"
                                @click.prevent="togglePasswordVisibility"
                                class="rounded-lg absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none text-gray-500 hover:text-green-500 text-shadow-lg transition"
                            >
                                <Icon :icon="showPassword ? 'el:eye-close' : 'mdi:eye'" width="25" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="cursor-pointer mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="isLoading"
                    >
                        <span v-if="!isLoading">Ingresar</span>
                        <span v-else>Cargando...</span>
                    </button>
                </form>
            </div>
            
            <div class="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-8 border border-green-100">
                <h1 class="text-center mb-4 font-bold text-green-600 text-xl">Chatear</h1>

                <p class="text-center mb-4 font-semibold text-gray-500 text-lg">
                    En este apartado, podra chatear en tiempo real con el administrador del sistema para asi poder discutir sobre proyectos, sugerencias, etc.
                </p>

                <RouterLink
                    to="/client/chat"
                    class="cursor-pointer mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors text-center"
                >
                    Chatear
                </RouterLink>
            </div>
        </div>

        <Toast
            v-model="isLoading"
            message="Conectando..."
            type="loading"
        />
    </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .grid {
    gap: 2rem;
  }

  form {
    font-size: 0.95rem;
  }

  input {
    font-size: 0.95rem;
  }
}
</style>
