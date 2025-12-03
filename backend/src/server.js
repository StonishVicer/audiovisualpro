import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path' 
import { fileURLToPath } from 'url' 


import authRoutes from './routes/auth.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import tiposProyectoRoutes from './routes/tiposProyecto.routes.js'
import estadosProyectoRoutes from './routes/estadosProyecto.routes.js'
import locacionRoutes from './routes/locacion.routes.js'
import tiposRecursosRoutes from "./routes/tiposRecursos.routes.js";
import recursosTecnicosRoutes from './routes/recursoTecnico.routes.js'
import rolesPersonalRoutes from './routes/rolespersonal.routes.js'
import personalRoutes from './routes/personal.routes.js'
import asignacionPersonalRoutes from './routes/asignacionpersonal.routes.js'
import proyectosRoutes from "./routes/proyecto.routes.js";
import contratosRoutes from './routes/contratos.routes.js'


import entregablesRoutes from './routes/entregables.routes.js'
import estadosEntregableRoutes from './routes/estadosEntregable.routes.js'

dotenv.config()
const app = express()


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/tiposproyecto', tiposProyectoRoutes)
app.use('/api/estadosproyecto', estadosProyectoRoutes)
app.use('/api/locacion', locacionRoutes)
app.use('/api/tiposrecursos', tiposRecursosRoutes)
app.use('/api/recursostecnicos', recursosTecnicosRoutes)
app.use('/api/roles_personal', rolesPersonalRoutes)
app.use('/api/personal', personalRoutes)
app.use('/api/asignaciones', asignacionPersonalRoutes)
app.use('/api/proyectos', proyectosRoutes)
app.use('/api/contratos', contratosRoutes)

app.use('/api/entregables', entregablesRoutes)
app.use('/api/estadosentregable', estadosEntregableRoutes) 

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en localhost:${PORT}`)
})