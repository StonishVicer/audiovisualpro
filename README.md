# 🎬 AudiovisualPro - Sistema de Gestión de Producción

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)

**Sistema web completo** para gestionar **proyectos audiovisuales** con frontend en **Vue.js 3** + **TailwindCSS** y backend en **Node.js** + **PostgreSQL**. Incluye chat en tiempo real, dashboards financieros, asignación de recursos y reportes PDF.

---

## 🚀 Features

- **Gestión Completa**: Proyectos, clientes, contratos, entregables, personal y finanzas  
- **Chat en Tiempo Real**: Socket.io para comunicación cliente-administrador  
- **Dashboards Interactivos**: Gráficos con Chart.js (Bar, Doughnut)  
- **Reportes PDF**: Generación automática con jsPDF  
- **CRUD Completo**: APIs REST para todas las entidades  
- **Responsive Design**: TailwindCSS + Vite para desarrollo rápido  

---

## 🛠️ Stack Tecnológico

| Frontend | Backend | Base de Datos | Herramientas |
|----------|---------|---------------|--------------|
| **Vue 3** (Composition API) | **Node.js** + **Express** | **PostgreSQL** | **Vite**, **pnpm** |
| **TailwindCSS** | **Socket.io** (Realtime) | **Pool de Conexiones** | **Chart.js**, **jsPDF** |
| **Vue Router** | **Multer** (Uploads) | **Migraciones SQL** | **Axios**, **Day.js** |

---

## 📂 Estructura del Proyecto

```
audiovisualpro/
├── backend/                 # API REST + Socket.io
│   ├── src/
│   │   ├── controllers/     # 15+ controladores (proyectos, facturas, etc.)
│   │   ├── routes/          # Rutas API protegidas
│   │   └── database/        # Conexión PostgreSQL
│   └── scripts/             # Migraciones y seeds
├── frontend/                # Vue 3 SPA
│   ├── src/
│   │   ├── views/systemviews/  # 15+ vistas de gestión
│   │   ├── components/     # UI reutilizables (Modal, Charts, Sidebar)
│   │   └── services/       # API + Socket Service
└── BD/                     # Schema PostgreSQL completo
```

---

## 🏃‍♂️ Instalación & Setup

### 1. Clonar Repositorio
```bash
git clone https://github.com/StonishVicer/audiovisualpro.git
cd audiovisualpro
```

### 2. Backend (PostgreSQL requerido)
```bash
cd backend
pnpm install
# Configurar .env con DB credentials
pnpm run migrate  # Ejecutar migraciones
pnpm start        # puerto 3000
```

### 3. Frontend
```bash
cd frontend
pnpm install
pnpm dev          # puerto 5173
```

### 4. Base de Datos
```sql
-- Importar BD/nuevaBD.sql en PostgreSQL
-- Usuarios por defecto: admin/admin
```

---

## 🔌 APIs Principales

| Endpoint | Descripción | Método |
|----------|-------------|--------|
| `/api/proyectos` | CRUD Proyectos + Estados | GET/POST/PUT/DELETE |
| `/api/facturas` | Facturación + Items | POST/PUT |
| `/api/chat/private` | Mensajes Realtime | Socket.io |
| `/api/stats` | Dashboard Financiero | GET |
| `/api/auth/login` | Autenticación Admin | POST |

---

## 📊 Módulos del Sistema

```
👥 Clientes & Contratos
🎬 Proyectos & Estados
📍 Locaciones & Recursos
👥 Personal & Asignaciones
📦 Entregables & Estados
💰 Finanzas (Facturas/Gastos/Pagos)
📈 Reportes & Dashboards
💬 Chat Realtime
```

---

## 🚀 Demo Local

1. **Backend**: `http://localhost:3000`
2. **Frontend**: `http://localhost:5173`
3. **Login Admin**: `admin` / `admin`
4. **Chat Cliente**: `http://localhost:5173/clientchat`

---

## 📄 License
Código abierto bajo **MIT License**. Proyecto fork mejorado del original [colmen4z/audiovisualpro](https://github.com/colmen4z/audiovisualpro).

Desarrollado con ❤️ por [**StonishVicer**](https://github.com/StonishVicer)
