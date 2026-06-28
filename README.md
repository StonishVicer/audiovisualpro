# 🎬 AudiovisualPro — Sistema de Gestión de Producción Audiovisual

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Sistema web full-stack para gestionar proyectos de producción audiovisual. Frontend en **Vue 3** + **TailwindCSS**, backend en **Node.js** + **Express 5**, base de datos **PostgreSQL**. Incluye chat en tiempo real por proyecto, dashboard financiero, asignación de recursos, reportes PDF y autenticación JWT.

---

## 🚀 Funcionalidades

- Gestión completa: proyectos, clientes, contratos, entregables, personal y finanzas
- Chat en tiempo real por proyecto con historial persistente (Socket.io + PostgreSQL)
- Autenticación JWT con rutas protegidas
- Dashboards interactivos con Chart.js
- Reportes PDF automáticos con jsPDF
- CRUD completo para todas las entidades
- Subida de archivos (imágenes, PDF, Word) con límite de 5 MB
- Soporte Docker para desarrollo y despliegue

---

## 🛠️ Stack Tecnológico

| Frontend | Backend | Base de Datos | Herramientas |
|----------|---------|---------------|-------------|
| Vue 3 (Composition API) | Node.js + Express 5 | PostgreSQL 16 | Vite, pnpm |
| TailwindCSS v4 | Socket.io (tiempo real) | Connection Pool | Chart.js, jsPDF |
| Vue Router 4 | Multer (subida de archivos) | Migraciones SQL | Axios, Day.js |
| Vitest | JWT (autenticación) | | Jest, Supertest |

---

## 📂 Estructura del Proyecto

```
audiovisualpro/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.js           # Punto de entrada (Express + Socket.io)
│   │   ├── config/             # env.js (dotenv), database.js (pool PostgreSQL)
│   │   ├── models/             # Capa de acceso a datos (SQL, sin lógica de negocio)
│   │   ├── services/           # Lógica de negocio y orquestación
│   │   ├── controllers/        # Manejo de request/response (sin SQL directo)
│   │   ├── routes/             # Definición de rutas y middlewares
│   │   ├── middlewares/        # auth.js, errorHandler.js, multerConfig.js
│   │   ├── sockets/            # Lógica de Socket.io (chat)
│   │   └── __tests__/          # Pruebas unitarias (Jest)
│   ├── migrations/             # Scripts de migración (legacy)
│   └── uploads/                # Archivos subidos (gitignored)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── modules/            # Módulos funcionales
│   │   │   ├── auth/           # Login, Landing
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── projects/       # Proyectos, Tipos, Estados
│   │   │   ├── clients/        # Clientes y Contratos
│   │   │   ├── finances/       # Facturas, Gastos, Pagos, Reportes
│   │   │   ├── resources/      # Locaciones, Recursos, Tipos
│   │   │   ├── personnel/      # Personal, Asignaciones, Roles
│   │   │   ├── deliverables/   # Entregables y Estados
│   │   │   └── chat/           # Chat admin y cliente
│   │   ├── components/         # Componentes compartidos (Modal, Sidebar, Charts)
│   │   ├── router/             # Vue Router
│   │   ├── services/           # api.js (Axios + JWT), socketService.js
│   │   ├── utils/              # generatepdf.js
│   │   └── __tests__/          # Pruebas unitarias (Vitest)
│   └── vite.config.js
├── BD/
│   ├── nuevaBD.sql             # Schema completo (pg_dump)
│   └── migracion_final.sql     # Migración idempotente
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── docker-compose.yml
├── ARCHITECTURE.md             # Guía de arquitectura
└── README.md
```

---

## 🏃‍♂️ Instalación y Configuración

### Requisitos previos
- **Node.js 20+** y **pnpm** (`npm install -g pnpm`)
- **PostgreSQL 16+** (o usar Docker)
- **Docker** (opcional)

### 1. Variables de entorno

Copia `.env.example` a `.env` en la **raíz del proyecto**:

```bash
cp .env.example .env
```

Edita `.env` si tus credenciales de PostgreSQL son diferentes:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin123
DB_NAME=audiovisualpro_db
DB_PORT=5432
JWT_SECRET=un_secreto_muy_largo_y_seguro_para_jwt
PORT=3000
```

### 2. Base de datos

```bash
# Crear la base de datos
createdb audiovisualpro_db

# Cargar el schema
psql -U postgres -d audiovisualpro_db -f BD/nuevaBD.sql

# Ejecutar la migración (chat, facturas, usuario admin)
psql -U postgres -d audiovisualpro_db -f BD/migracion_final.sql
```

### 3. Backend

```bash
cd backend
pnpm install
pnpm dev        # Arranca en http://localhost:3000 con nodemon
```

### 4. Frontend

```bash
cd frontend
pnpm install
pnpm dev        # Arranca en http://localhost:5173
```

### 5. Acceso

| Recurso | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Login | `admin` / `admin123` |
| Chat cliente | http://localhost:5173/client/chat |

---

## 🐳 Docker

```bash
# Desde la raíz del proyecto
docker compose up --build

# Frontend: http://localhost
# API:      http://localhost:3000
```

La base de datos se crea, migra y puebla automáticamente.

---

## 🔌 API Endpoints

| Endpoint | Descripción | Auth |
|----------|-------------|------|
| `POST /api/auth/login` | Autenticación de admin | No |
| `GET/POST /api/proyectos` | Proyectos | Sí |
| `GET/PUT/DELETE /api/proyectos/:id` | Proyecto individual | Sí |
| `GET/POST /api/clientes` | Clientes (RIF o Cédula) | Sí |
| `PUT/DELETE /api/clientes/:id` | Cliente individual | Sí |
| `GET/POST/PUT/DELETE /api/contratos` | Contratos | Sí |
| `GET/POST /api/facturas` | Facturas + Items | Sí |
| `PUT/DELETE /api/facturas/:id` | Factura individual | Sí |
| `GET/POST /api/gastos` | Gastos | Sí |
| `POST /api/entregables` | Subir entregables (multipart) | Sí |
| `GET /api/stats/finance` | Dashboard financiero | Sí |
| `GET/POST/PUT/DELETE /api/personal` | Personal | Sí |

---

## 💬 Sistema de Chat

Chat por proyecto con historial persistente en PostgreSQL.

- **Admin:** `/system/chat` → selecciona proyecto → chat en tiempo real
- **Cliente:** `/client/chat` → selecciona identidad → selecciona proyecto → chat

### Eventos Socket.io
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `join_room` | Cliente → Servidor | Unirse a sala de proyecto |
| `send_message` | Cliente → Servidor | Enviar mensaje (persiste en DB) |
| `new_message` | Servidor → Sala | Broadcast de nuevo mensaje |
| `chat_history` | Servidor → Cliente | Últimos 50 mensajes al unirse |

---

## 🧪 Pruebas

```bash
# Backend (Jest — 12 tests)
cd backend && pnpm test

# Frontend (Vitest — 6 tests)
cd frontend && pnpm test
```

---

## 📄 Licencia

MIT License. Fork mejorado de [colmen4z/audiovisualpro](https://github.com/colmen4z/audiovisualpro).

Desarrollado por [**StonishVicer**](https://github.com/StonishVicer)
