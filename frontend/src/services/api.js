import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000'
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.createProyectoCompleto = (payload) => api.post('/api/proyectos/complete', payload)
api.crearClienteInline = (data) => api.post('/api/clientes', data)
api.crearLocacionInline = (data) => api.post('/api/locacion', data)
api.crearRecursoInline = (data) => api.post('/api/recursostecnicos', data)
api.crearPersonalInline = (data) => api.post('/api/personal', data)
api.crearTipoRecursoInline = (data) => api.post('/api/tiposrecursos', data)

export default api
