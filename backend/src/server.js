import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './config/env.js';
import { verifyToken } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setupChat } from './sockets/chat.js';

import authRoutes from './routes/auth.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import tiposProyectoRoutes from './routes/tiposProyecto.routes.js';
import estadosProyectoRoutes from './routes/estadosProyecto.routes.js';
import locacionRoutes from './routes/locacion.routes.js';
import tiposRecursosRoutes from './routes/tiposRecursos.routes.js';
import recursosTecnicosRoutes from './routes/recursoTecnico.routes.js';
import rolesPersonalRoutes from './routes/rolespersonal.routes.js';
import personalRoutes from './routes/personal.routes.js';
import asignacionPersonalRoutes from './routes/asignacionpersonal.routes.js';
import proyectosRoutes from './routes/proyecto.routes.js';
import contratosRoutes from './routes/contratos.routes.js';
import pagosRoutes from './routes/pagos.routes.js';
import facturasRoutes from './routes/facturas.routes.js';
import gastosRoutes from './routes/gasto.routes.js';
import statsRoutes from './routes/stats.routes.js';
import entregablesRoutes from './routes/entregables.routes.js';
import estadosEntregableRoutes from './routes/estadosEntregable.routes.js';
import categoriasGastoRoutes from './routes/categoriasGasto.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Middleware de autenticación
app.use('/api', verifyToken);

// Rutas protegidas
app.use('/api/clientes', clienteRoutes);
app.use('/api/tiposproyecto', tiposProyectoRoutes);
app.use('/api/estadosproyecto', estadosProyectoRoutes);
app.use('/api/locacion', locacionRoutes);
app.use('/api/tiposrecursos', tiposRecursosRoutes);
app.use('/api/recursostecnicos', recursosTecnicosRoutes);
app.use('/api/roles_personal', rolesPersonalRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/asignaciones', asignacionPersonalRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/pagos_personal', pagosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/entregables', entregablesRoutes);
app.use('/api/estadosentregable', estadosEntregableRoutes);
app.use('/api/categoriasgasto', categoriasGastoRoutes);

app.use(errorHandler);

setupChat(io);

httpServer.listen(config.port, () => {
    console.log(`Servidor corriendo en localhost:${config.port}`);
});
