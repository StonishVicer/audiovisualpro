// server.js (Versión Modificada con Socket.IO)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io'; 

import authRoutes from './routes/auth.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import tiposProyectoRoutes from './routes/tiposProyecto.routes.js';
import estadosProyectoRoutes from './routes/estadosProyecto.routes.js';
import locacionRoutes from './routes/locacion.routes.js';
import tiposRecursosRoutes from "./routes/tiposRecursos.routes.js";
import recursosTecnicosRoutes from './routes/recursoTecnico.routes.js';
import rolesPersonalRoutes from './routes/rolespersonal.routes.js';
import personalRoutes from './routes/personal.routes.js';
import asignacionPersonalRoutes from './routes/asignacionpersonal.routes.js';
import proyectosRoutes from "./routes/proyecto.routes.js";
import contratosRoutes from './routes/contratos.routes.js';
import pagosRoutes from './routes/pagos.routes.js';
import facturasRoutes from './routes/facturas.routes.js';
import gastosRoutes from './routes/gasto.routes.js';
import entregablesRoutes from './routes/entregables.routes.js';
import estadosEntregableRoutes from './routes/estadosEntregable.routes.js';


dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = http.createServer(app); 

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
}); 

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
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
app.use('/api/pagos_personal', pagosRoutes)
app.use('/api/facturas', facturasRoutes)
app.use('/api/gastos', gastosRoutes);
app.use('/api/entregables', entregablesRoutes)
app.use('/api/estadosentregable', estadosEntregableRoutes)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const users = {};

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('register', (userId) => {
        users[userId] = socket.id;
        socket.userId = userId; 
        console.log(`✅ Usuario ${userId} registrado.`);
    });

    socket.on('private_message', ({ receiverId, message }) => {
        const receiverSocketId = users[receiverId];
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('private_message', {
                senderId: socket.userId,
                message: message
            });

            socket.emit('message_sent', { message: message });
            
            console.log(`💬 Mensaje de ${socket.userId} a ${receiverId}`);
        } else {
            console.log(`❌ Error: Destinatario ${receiverId} no encontrado.`);
            socket.emit('error', 'No hay un destinario en linea.');
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            delete users[socket.userId];
            console.log(`Usuario ${socket.userId} desconectado.`);
        }
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Servidor (API + Sockets) corriendo en localhost:${PORT}`);
});