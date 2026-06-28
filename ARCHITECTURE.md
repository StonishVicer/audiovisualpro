# 🏗️ AudiovisualPro — Architecture Guide

## Overview

AudiovisualPro follows a **clean layered architecture** with strict separation of concerns:

```
📁 raíz (config global)
  └── backend/       → Node.js + Express + PostgreSQL
  └── frontend/      → Vue 3 + Vite + TailwindCSS
  └── BD/            → SQL scripts (schema + migrations)
```

---

## Backend Architecture (Clean Layered)

```
backend/src/
├── config/          → env.js (dotenv), database.js (pool), logger.js (Winston)
├── models/          → Data access layer (SQL queries only)
├── services/        → Business logic, transactions, validation
├── controllers/     → Request/response handling (thin, delegates to services)
├── routes/          → Route definitions + validation middleware
├── middlewares/     → auth.js, errorHandler.js, validators.js, multerConfig.js
├── sockets/         → Socket.io event handlers (delegates to services)
├── utils/           → Custom error classes (AppError, NotFoundError, etc.)
└── server.js        → Entry point (Express + Socket.io + Rate Limiting + Swagger)
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| **Config** | Loads `.env`, creates DB pool, configures Winston logger |
| **Models** | Pure data access — all SQL lives here. Exports objects with `findAll()`, `create()`, `remove()`, etc. |
| **Services** | Business logic, transactions, orchestration. Calls models. Throws custom errors (`AppError` subclasses). |
| **Controllers** | Validates input via middleware, calls services, sends HTTP response. **No SQL or business logic.** Delegates errors via `next(err)`. |
| **Routes** | Defines HTTP methods/paths, applies validation middleware (`express-validator`). |
| **Sockets** | `setupChat(io)` — registers Socket.io events, delegates to `ChatService`. |
| **Middlewares** | `verifyToken` (JWT), `errorHandler` (unified error response), `validators` (express-validator chains), `multerConfig`. |
| **Utils** | Custom error hierarchy: `AppError` → `NotFoundError`, `ValidationError`, `ConflictError`, `UnauthorizedError`. |

### Data Flow

```
HTTP Request
  → Rate Limiter (express-rate-limit)
    → Route (matches URL, applies auth middleware)
      → Validator Middleware (express-validator)
        → Controller (delegates to service)
          → Service (business logic, calls model)
            → Model (executes SQL via pool.query)
              → PostgreSQL
          ← Returns data
        ← Throws AppError on failure
      ← Formats JSON response
    → Error Handler (catches thrown errors, logs with Winston)
  ← HTTP Response
```

### Service Layer (v2.0)

Every entity has a dedicated service:

| Service | File | Entities |
|---------|------|----------|
| ProyectoService | `services/proyectoService.js` | Proyecto CRUD, Asignaciones, ProyectoComplete |
| ClienteService | `services/clienteService.js` | Cliente CRUD |
| PersonalService | `services/personalService.js` | Personal + Asignaciones CRUD |
| LocacionService | `services/locacionService.js` | Locaciones + Recursos Técnicos + Tipos |
| ContratoService | `services/contratoService.js` | Contratos CRUD |
| FacturaService | `services/facturaService.js` | Facturas + Items (transaccional) |
| GastoService | `services/gastoService.js` | Gastos + Pagos + Categorías CRUD |
| EntregableService | `services/entregableService.js` | Entregables + Estados CRUD |
| CatalogoService | `services/catalogoService.js` | Tipos Proyecto, Estados, Roles, Stats |
| ChatService | `services/chatService.js` | Chat messages persistence |
| AuthService | `services/authService.js` | Login, JWT generation |

### Route Consolidation

Catalog-like entities (types, states, roles) are consolidated for efficiency:
- `controllers/catalogos.controller.js` → `CatalogoService`
- `controllers/locacion.controller.js` → `LocacionService` / `RecursoTecnicoService` / `TipoRecursoService`
- `controllers/gastoController.js` → `GastoService` / `PagoService`

---

## Security & Observability

| Feature | Implementation |
|---------|---------------|
| **Rate Limiting** | `express-rate-limit` — 100 req/15min (API), 10 req/15min (Login) |
| **Input Validation** | `express-validator` — typed, sanitized, with custom error messages |
| **Error Handling** | Unified via `AppError` hierarchy, caught by `errorHandler` middleware |
| **Logging** | Winston — JSON logs to `logs/error.log` + `logs/combined.log`, console in dev |
| **Auth** | JWT with `verifyToken` middleware on all `/api/*` routes |
| **File Upload** | Multer — MIME filter, 5MB limit |
| **API Docs** | Swagger UI at `/api-docs` (OpenAPI 3.0, auto-generated from route annotations) |
| **SQL Injection** | All queries parameterized (`$1`, `$2`, etc.) |

---

## Frontend Architecture (Module-based)

```
frontend/src/
├── modules/         → Feature modules (each is self-contained)
│   ├── auth/        → Login, Landing
│   ├── dashboard/   → Dashboard, SystemLayout
│   ├── projects/    → ProjectList, ProjectTypes, ProjectStates
│   ├── clients/     → ClientList, ContractList
│   ├── finances/    → InvoiceList, ExpenseList, Categories, Payments, Reports
│   ├── resources/   → LocationList, ResourceList, ResourceTypes
│   ├── personnel/   → StaffList, StaffAssignment, StaffRoles
│   ├── deliverables/→ DeliverableByProject, DeliverableStates
│   └── chat/        → AdminChat, ClientChat
├── components/      → Shared UI (Sidebar, Modal, Toast, Charts, Proyecto card)
├── router/          → Vue Router configuration
├── services/        → api.js (Axios with JWT interceptor), socketService.js
└── utils/           → generatepdf.js
```

---

## Environment Configuration

| File | Purpose |
|------|---------|
| `.env` (root) | Actual environment variables (gitignored) |
| `.env.example` (root) | Template for new developers |
| `backend/src/config/env.js` | Loads `.env` from project root, validates and exports config |
| `backend/src/config/logger.js` | Winston logger with file + console transports |

`.env` is at project **root** so it works for both Docker Compose and local development.

---

## Database

| File | Purpose |
|------|---------|
| `BD/nuevaBD.sql` | Full pg_dump of schema (DDL only) |
| `BD/migracion_final.sql` | Idempotent migration (chat tables, factura restructuring, default user) |
| `backend/migrations/` | Node.js migration scripts (legacy, for reference) |

---

## Key Design Decisions

1. **Clean Layered Architecture**: Models → Services → Controllers → Routes ensures each layer can be tested independently
2. **Services as single source of business logic**: Every controller delegates to a service; no SQL or validation in controllers
3. **Custom Error Hierarchy**: `AppError` subclasses enable precise HTTP status codes and operational-vs-programmer error distinction
4. **Unified Error Handler**: All thrown errors flow to `errorHandler` middleware; controllers never call `res.status(500)`
5. **Dotenv at root**: Single source of truth, works with Docker and local dev
6. **Structured Logging**: Winston replaces `console.log` — JSON logs for production, colorized for development
7. **Input Validation**: `express-validator` chains applied at route level before controllers
8. **Rate Limiting**: Global API limiter + stricter auth limiter to prevent brute force
9. **Module-based frontend**: Features are grouped by domain, not by file type
10. **Socket.io separation**: `sockets/chat.js` delegates all persistence to `ChatService`
11. **Token interceptor**: Frontend `api.js` auto-attaches JWT from localStorage
