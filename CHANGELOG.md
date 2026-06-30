# CHANGELOG

## [2.2.0] — 2026-06-30

### Added
- **Arquitectura Bimonetaria (USD/VES)**: Soporte completo para transacciones en dos monedas.
  - Nuevas tablas: `monedas`, `tipos_cambio`
  - Columnas `id_moneda`, `monto_usd`, `monto_ves` en `facturas`, `gastos`, `pagos_personal`
  - Servicio `MonedaService` con caché de tasa de cambio (TTL: 1 hora), conversión bimonetaria y logging
  - Endpoints: `GET /api/moneda/tasa/:fecha?`, `POST /api/moneda/tasa`, `POST /api/moneda/convertir`, `GET /api/moneda/list`
  - Migración SQL: `backend/migrations/005_moneda_bimonetaria.sql`
  - Composable frontend `useCurrency.js` con estado compartido de moneda
  - Componente `CurrencySelector.vue` para selección de moneda con tasa en tiempo real
  - Integración en `InvoiceList`, `ExpenseList`, `StaffPayments`, `FinancialReports`
- **Creación inline de tipos/estados desde el Wizard**: `SearchableSelect` permite crear tipos y estados de proyecto sin salir del wizard
- **Estado de carga en selectores del Wizard**: Indicadores de carga (`loading`) para tipos y estados de proyecto
- **Validación robusta en Step 1 del Wizard**: El botón "Siguiente" se deshabilita si no hay tipos/estados cargados

### Fixed
- **Bug de renderizado en tarjeta de proyecto**: Eliminado el acceso a `lista_locaciones` y `recursos_asignados` que causaban "Error al cargar la información"
- **Reemplazado badge de estado complejo**: La lógica "Todo está bien" / "Detalles" se reemplazó por un badge simple basado en el estado del proyecto (En Progreso → Amarillo, Finalizado → Verde, Cancelado → Rojo)

### Changed
- **`Proyecto.vue`**: Eliminadas props `locacionesAsignadas` y `recursosAsignados`; añadido `estadoBadge` computado
- **`ProjectList.vue`**: Simplificado `getProyectos()` eliminando mapeo de arrays no existentes
- **`SearchableSelect.vue`**: El label de creación ahora muestra el nombre ingresado (`Crear nuevo tipo: [nombre]`)
- **Servicios financieros**: `FacturaService`, `GastoService`, `PagoService` ahora calculan y persisten montos en ambas monedas
- **`server.js`**: Añadida ruta `/api/moneda`

## [2.0.0] — 2026-06-27

### Added
- **JWT Authentication Middleware** (`backend/src/middlewares/auth.js`): All API routes (except `/api/auth/login`) are now protected. Requests require `Authorization: Bearer <token>` header.
- **Global Error Handler** (`backend/src/middlewares/errorHandler.js`): Catches unhandled exceptions and returns consistent JSON error responses.
- **Chat Room System**: Replaced the old 1-to-1 chat with a room-based per-project chat with persistent message history.
  - New database tables: `chat_rooms`, `chat_messages`
  - New `ProjectChat.vue` (admin): List projects, select one, chat in real-time.
  - Updated `ClientChat.vue`: Client selects identity → project → chat.
  - Socket.io events: `join_room`, `send_message`, `new_message`, `chat_history`
- **Contract CRUD**: Added `PUT /api/contratos/:id` and `DELETE /api/contratos/:id` endpoints.
- **File Upload Enhancements**: Multer now filters by MIME type (images, PDF, Word) with 5MB limit. Old files are deleted on update/delete.
- **Migration Script** (`BD/migracion_final.sql`): Idempotent SQL script that:
  - Renames `facturas.fecha_emision` → `fecha_factura`, `monto_total` → `total`
  - Adds columns: `numero_factura`, `cliente_id`, `subtotal`, `estado`, `notas`
  - Creates `factura_items` table
  - Adds `proyectos.fecha_fin`, `pagos_personal.sueldo`, `pagos_personal.extra`
  - Inserts default admin user (`admin` / `admin123`)
  - Creates `chat_rooms` and `chat_messages` tables
- **Unit Tests**:
  - Backend (Jest + Supertest): 12 tests across auth, facturas, and proyectos controllers
  - Frontend (Vitest + @vue/test-utils): Tests for API service and Proyecto component
- **Docker Support**:
  - `backend/Dockerfile`: Node 20 Alpine, production-ready
  - `frontend/Dockerfile`: Multi-stage build with nginx serving static files
  - `frontend/nginx.conf`: Reverse proxy config for API and Socket.io
  - `docker-compose.yml`: PostgreSQL 16 + Backend + Frontend with healthchecks
  - `.dockerignore`: Excludes node_modules, .env, uploads
- **New npm scripts**:
  - Backend: `test`, `start`, `migrate`
  - Frontend: `test`, `test:watch`

### Fixed
- **`auth.controller.js` line 24**: `json.status` → `res.status` (ReferenceError when wrong password)
- **`categoriasGasto.controller.js`**: Added missing `await` to `pool.query()` calls in `getCategoriaGastoByID` and `getCategoriaGasto`
- **`categoriasGasto.controller.js`**: Fixed dead error messages (`||` → string concatenation)
- **`proyecto.controller.js`**: Implemented empty `deleteProyecto` function body
- **`proyecto.controller.js`**: Added `pr.fecha_fin` to GROUP BY clause in `getProyectos`
- **`recursoTecnico.controller.js` line 7**: Fixed SQL typo `recurso tecnico` → `recurso_tecnico`
- **`cliente.controller.js`**: Added missing `return` before `res.status(404)` in `deleteCliente`
- **`Sidebar.vue` line 120**: `!menu.subname` → `!menu.submenu` (submenus now render correctly)
- **`server.js`**: Removed duplicate `express.static('uploads')` line, using absolute path only
- **`entregables.controller.js`**: Added physical file deletion on `updateEntregable` and `deleteEntregable`

### Changed
- **GestionContratos.vue**: Connected form to API (`createContrato` function) with "Nuevo Contrato" button and delete functionality
- **CategoriasGasto.vue**: Full implementation — create, edit (modal), delete with toast notifications
- **AsignacionPersonal.vue**: Replaced number inputs with `<select>` dropdowns for proyecto and personal, loading data from API
- **Server.js**: Auth middleware applied globally under `/api`, Socket.io redesigned for room-based chat
- **Router (Frontend)**: Admin chat route now uses `ProjectChat.vue` instead of `AdminChat.vue`
- **.gitignore**: Added `uploads/` to backend
- **package.json**: Added test dependencies (Jest, Supertest, Vitest, @vue/test-utils, happy-dom) and test scripts
