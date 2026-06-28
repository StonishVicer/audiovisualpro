# 🏗️ AudiovisualPro — Architecture Guide

## Overview

AudiovisualPro follows a **layered architecture** with clear separation of concerns:

```
📁 raíz (config global)
  └── backend/       → Node.js + Express + PostgreSQL
  └── frontend/      → Vue 3 + Vite + TailwindCSS
  └── BD/            → SQL scripts (schema + migrations)
```

---

## Backend Architecture (Layered)

```
backend/src/
├── config/          → env.js (dotenv), database.js (pool)
├── models/          → Data access layer (SQL queries)
├── services/        → Business logic orchestration
├── controllers/     → Request/response handling
├── routes/          → Route definitions + middleware
├── middlewares/     → auth.js, errorHandler.js, multerConfig.js
├── sockets/         → Socket.io event handlers
└── server.js        → Entry point (Express + Socket.io setup)
```

### Layer Responsibilities

| Layer | File | Responsibility |
|-------|------|----------------|
| **Config** | `config/env.js` | Loads `.env` from project root, exports normalized config object |
| **Config** | `config/database.js` | Creates and exports PostgreSQL connection pool |
| **Models** | `models/proyecto.js`, etc. | Pure data access — all SQL lives here. Exports objects with `findAll()`, `create()`, `remove()`, etc. |
| **Services** | `services/facturaService.js`, etc. | Business logic, transactions, orchestration. Calls models. |
| **Controllers** | `controllers/proyecto.controller.js`, etc. | Validates input, calls services/models, sends HTTP response. **No SQL.** |
| **Routes** | `routes/proyecto.routes.js`, etc. | Defines HTTP methods and paths, applies middleware. |
| **Sockets** | `sockets/chat.js` | `setupChat(io)` — registers Socket.io events, calls models for persistence. |
| **Middlewares** | `middlewares/auth.js` | `verifyToken` — JWT validation for all `/api/*` routes. |

### Data Flow

```
HTTP Request
  → Route (matches URL, applies auth middleware)
    → Controller (validates req.body, calls service/model)
      → Service/Model (executes SQL via pool.query)
        → PostgreSQL
      ← Returns data
    ← Formats JSON response
  ← HTTP Response
```

### Route Consolidation

Catalog-like entities (types, states, roles) are consolidated into fewer files:
- `controllers/catalogos.controller.js` handles tipos_proyecto, estados_proyecto, roles_personal, stats
- `controllers/locacion.controller.js` handles locaciones, recursos_tecnicos, tipos_recurso
- `controllers/gastoController.js` handles gastos and pagos_personal

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

### Module Conventions

- Each module groups related views together
- Views import shared components from `../../components/`
- Views import services from `../../services/`
- Routes in `router/router.js` pull from modules

---

## Environment Configuration

| File | Purpose |
|------|---------|
| `.env` (root) | Actual environment variables (gitignored) |
| `.env.example` (root) | Template for new developers |
| `backend/src/config/env.js` | Loads `.env` from project root, validates and exports config |

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

1. **Dotenv at root**: Single source of truth, works with Docker and local dev
2. **Single .gitignore**: Avoids scattered ignore rules
3. **Layered backend**: Models → Services → Controllers → Routes ensures each layer can be tested independently
4. **Module-based frontend**: Features are grouped by domain, not by file type
5. **Consolidated controllers**: Reduces file count for simple CRUD entities
6. **Socket.io separation**: `sockets/chat.js` is independently testable
7. **Token interceptor**: Frontend `api.js` auto-attaches JWT from localStorage
