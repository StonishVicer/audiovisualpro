import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import tiposProyectoRoutes from './routes/tiposProyecto.routes.js'
import estadosProyectoRoutes from './routes/estadosProyecto.routes.js'
import locacionRoutes from './routes/locacion.routes.js'
import tiposRecursosRoutes from "./routes/tiposRecursos.routes.js";
import recursosTecnicosRoutes from './routes/recursoTecnico.routes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/tiposproyecto', tiposProyectoRoutes)
app.use('/api/estadosproyecto', estadosProyectoRoutes)
app.use('/api/locacion', locacionRoutes)
app.use('/api/tiposrecursos', tiposRecursosRoutes)
app.use('/api/recursostecnicos', recursosTecnicosRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en localhost:${PORT}`)
})
