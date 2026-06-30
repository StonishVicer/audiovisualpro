# 🎬 AudiovisualPro — Sistema de Gestión de Producción Audiovisual

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Sistema web full-stack para gestionar proyectos de producción audiovisual. Frontend en **Vue 3** + **TailwindCSS**, backend en **Node.js** + **Express 5**, base de datos **PostgreSQL**. Autenticación JWT, dashboard financiero y asignación de recursos.

> **⚠️ ESTADO: EN PAUSA** — v2.3 Refinamiento Final · 30 Jun 2026

---

## 📊 ESTADO DEL PROYECTO

### ✅ LO QUE SE HIZO (v2.3)

#### Autenticación y Seguridad
- Cache de verificación de token en el frontend (`tokenVerified` + `verifyPromise`). Una sola llamada a `/api/auth/verify` por sesión.
- Interceptor 401 con bypass para rutas públicas (`/`, `/login`, `/client/*`).
- Rate limiter solo en `POST /api/auth/login`. Verify excluido del rate limit.

#### Sistema Bimonetario (USD/VES)
- Tablas `monedas` y `tipos_cambio` creadas en migración.
- `MonedaService.getTasaCambio()` con fallback a 1.0 si no hay tasa en BD.
- Insert automático de tasa por defecto (1.0) si la tabla está vacía.
- Endpoints: `GET /tasa`, `POST /tasa`, `POST /convertir`, `GET /list`.
- Frontend: componente `CurrencySelector` + composable `useCurrency`.

#### Catálogos Maestros Fijos
- Datos precargados en BD vía migración (`ON CONFLICT DO NOTHING`):
  - 7 Tipos de Proyecto (Comercial, Corporativo, Eventos, Educativo, Documental, Ficción, Otro)
  - 4 Estados de Proyecto (En Progreso, Finalizado, Cancelado, En Espera)
  - 8 Roles de Personal (Director, Productor, Camarógrafo, Editor, Sonidista, Diseñador Gráfico, Asistente, Otro)
  - 6 Tipos de Recurso (Cámara, Iluminación, Sonido, Postproducción, Transporte, Otro)
  - 7 Categorías de Gasto (Transporte, Comida, Reservaciones, Materiales, Equipos, Personal, Otros)
- Constraints UNIQUE en columnas de nombre de todos los catálogos.
- Eliminado módulo `SettingsView.vue` y ruta `/system/configuracion`.
- Wizard de proyectos: selects nativos para tipo y estado, sin creación inline.

#### Normalización de Identificación y Teléfono
- **Clientes**: select J/V/E + número de identificación. Label "Identificación" (no "RIF").
- **Clientes**: select de prefijo telefónico (0412, 0414, 0416, 0424, 0426, 0212, 0241, 0243, 0251, 0261) + número.
- **Personal**: idéntica normalización (J/V/E + número, prefijo + teléfono).
- Columnas `tipo_identificacion` y `prefijo_telefono` en tablas `clientes` y `personal`.
- Columna `cedula_personal` expandida a `VARCHAR(20)`.

#### Wizard de Proyectos
- Presupuesto con toggle de moneda ($ / Bs.).
- Paso 5 (Personal): cálculo profesional de costo = `(salario/160) × horas`.
- Resumen financiero en paso 6 con costo total de personal.
- Sin creación inline de tipos/estados/roles/tipos recurso/categorías.

#### Modal de Detalles del Proyecto
- Tabs: General, Locaciones, Recursos, Personal, Entregables, Finanzas.
- Personal: muestra salario mensual, horas trabajadas, costo estimado por persona.
- Finanzas: tarjeta de contrato, creación inline de facturas y gastos, resumen financiero con balance.
- Carga de datos corregida (`onMounted` en vez de watch inmediato).

#### Eliminaciones
- Chat completo eliminado (frontend, backend, DB, Socket.io, rutas, menú sidebar).
- `SettingsView.vue` y carpeta `settings/` eliminados.
- `CreateTipoRecursoInline.vue` eliminado (tipos de recurso son fijos).

#### Base de Datos
- Migración idempotente (`migracion_final.sql`) con todas las tablas y datos maestros.
- Tablas `monedas` y `tipos_cambio` creadas.
- Columnas `tipo_identificacion` y `prefijo_telefono` en `clientes` y `personal`.
- `contratos` usa `LEFT JOIN` para soportar clientes nulos.

---

### ❌ LO QUE FALTA

- **Reportes PDF**: la generación de reportes financieros existe (`generateReportePDF`) pero no está integrada al flujo del modal de detalles.
- **StaffPayments**: el módulo de pagos a personal no filtra por proyecto ni muestra relación con asignaciones.
- **FinancialReports**: no consolida datos multi-proyecto correctamente.
- **Subida de archivos en entregables**: los endpoints soportan `multer` pero la UI no expone el input de archivo.
- **Validación de teléfonos**: sin regex de validación en frontend o backend.
- **Dashboard**: muestra datos estáticos, no consolida KPIs reales del sistema.

---

### 🔧 QUEDÓ PENDIENTE

- Migrar los endpoints de catálogos a solo-lectura (`GET`) en backend. Actualmente soportan CRUD completo aunque la UI ya no expone creación.
- Implementar soft-delete en proyectos y clientes en vez de eliminación física.
- Paginación en listados (proyectos, clientes, personal, finanzas).
- Tests automatizados: solo existen tests unitarios básicos para `proyecto.service` y `cliente.service`.
- Variables de entorno para CORS origins, prefijos telefónicos configurables.
- Roles y permisos: el sistema usa un solo rol "gestor". No hay multi-usuario real.
- Notificaciones: el chat fue eliminado, no hay sistema de notificaciones alternativo.

---

## 🚀 EJECUCIÓN

### Requisitos
- Node.js ≥ 18
- PostgreSQL ≥ 16
- Docker (opcional, para `docker-compose`)

### Desarrollo
```bash
# Backend
cd backend
cp .env.example .env   # editar credenciales
npm install
npm run dev             # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev             # http://localhost:5173

# Base de datos (migración idempotente)
psql -U postgres -d audiovisualpro_db -f BD/migracion_final.sql
```

### Docker
```bash
docker-compose up -d    # PostgreSQL + Backend (sin frontend)
```

---

## 📁 ESTRUCTURA

```
audiovisualpro/
├── BD/
│   ├── migracion_final.sql   # Migración idempotente (tablas + datos maestros)
│   └── nuevaBD.sql           # Schema base original
├── backend/
│   ├── src/
│   │   ├── config/           # dotenv, database, logger
│   │   ├── controllers/      # Express controllers
│   │   ├── middlewares/      # auth (JWT), validators, errorHandler, rateLimit
│   │   ├── models/           # PostgreSQL models (Repository pattern)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Error classes, helpers
│   │   └── server.js         # Express entry point
│   └── __tests__/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusables (Modal, Toast, SearchableSelect, forms/)
│   │   ├── composables/      # useCurrency
│   │   ├── modules/          # Feature modules (auth, clients, finances, personnel, projects, etc.)
│   │   ├── router/           # Vue Router + auth guards
│   │   ├── services/         # api.js (Axios + JWT interceptor)
│   │   └── App.vue
│   └── index.html
├── docker-compose.yml
├── kilo.json
└── README.md
```

---

## 📝 NOTAS FINALES

El proyecto alcanzó un estado de **estabilidad estructural** en v2.3:
- Flujo de autenticación robusto (sin 401 falsos, sin rate limiting en verify).
- Sistema bimonetario funcional con fallback automático.
- Catálogos maestros fijos con migración idempotente.
- Normalización completa de identificaciones y teléfonos en todo el sistema.
- Wizard de creación de proyectos con lógica financiera profesional.
- Modal de detalles con 6 tabs funcionales y creación inline de facturas/gastos.

**El proyecto está en pausa.** Las funcionalidades core están operativas. Los pendientes listados arriba son mejoras incrementales que no bloquean el uso del sistema.
