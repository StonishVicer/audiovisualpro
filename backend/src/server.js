import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { verifyToken } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
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
import proyectoCompleteRoutes from './routes/proyectoComplete.routes.js';
import monedaRoutes from './routes/moneda.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = http.createServer(app);

const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost'];

const corsOptions = {
    origin: corsOrigins,
    credentials: true
};

app.use(cors(corsOptions));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiadas peticiones, intente más tarde' }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiados intentos de inicio de sesión, intente más tarde' }
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AudiovisualPro API',
            version: '2.0.0',
            description: 'API para gestión de producción audiovisual'
        },
        servers: [{ url: process.env.SERVER_URL || `http://localhost:${config.port}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(requestLogger);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/health', healthRoutes);

app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id_gestor: req.user.id_gestor,
            usuario_gestor: req.user.usuario_gestor,
            nombre_gestor: req.user.nombre_gestor
        }
    })
});

app.use('/api/auth', loginLimiter, authRoutes);

app.use('/api', apiLimiter);
app.use('/api', verifyToken);

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
app.use('/api/proyectos/complete', proyectoCompleteRoutes);
app.use('/api/moneda', monedaRoutes);

app.use(errorHandler);

httpServer.listen(config.port, () => {
    logger.info(`Servidor corriendo en http://localhost:${config.port}`);
    logger.info(`Documentación Swagger en http://localhost:${config.port}/api-docs`);
    logger.info(`Healthcheck en http://localhost:${config.port}/health`);
});
