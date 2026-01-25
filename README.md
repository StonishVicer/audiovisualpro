# 🎬 AudiovisualPro - Production Management System

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)

**Full-stack web system** for managing **audiovisual production projects** with **Vue.js 3** + **TailwindCSS** frontend and **Node.js** + **PostgreSQL** backend. Features real-time chat, financial dashboards, resource allocation, and PDF reports.

---

## 🚀 Features

- **Complete Management**: Projects, clients, contracts, deliverables, personnel, and finances  
- **Real-time Chat**: Socket.io for client-administrator communication  
- **Interactive Dashboards**: Charts with Chart.js (Bar, Doughnut)  
- **PDF Reports**: Automatic generation with jsPDF  
- **Full CRUD**: REST APIs for all entities  
- **Responsive Design**: TailwindCSS + Vite for rapid development  

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Tools |
|----------|---------|----------|-------|
| **Vue 3** (Composition API) | **Node.js** + **Express** | **PostgreSQL** | **Vite**, **pnpm** |
| **TailwindCSS** | **Socket.io** (Realtime) | **Connection Pool** | **Chart.js**, **jsPDF** |
| **Vue Router** | **Multer** (File Uploads) | **SQL Migrations** | **Axios**, **Day.js** |

---

## 📂 Project Structure

```
audiovisualpro/
├── backend/                 # REST API + Socket.io
│   ├── src/
│   │   ├── controllers/     # 15+ controllers (projects, invoices, etc.)
│   │   ├── routes/          # Protected API routes
│   │   └── database/        # PostgreSQL connection
│   └── scripts/             # Migrations and seeds
├── frontend/                # Vue 3 SPA
│   ├── src/
│   │   ├── views/systemviews/  # 15+ management views
│   │   ├── components/     # Reusable UI (Modal, Charts, Sidebar)
│   │   └── services/       # API + Socket services
└── BD/                     # Complete PostgreSQL schema
```

---

## 🏃‍♂️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/StonishVicer/audiovisualpro.git
cd audiovisualpro
```

### 2. Backend (PostgreSQL required)
```bash
cd backend
pnpm install
# Configure .env with DB credentials
pnpm run migrate  # Run migrations
pnpm start        # Port 3000
```

### 3. Frontend
```bash
cd frontend
pnpm install
pnpm dev          # Port 5173
```

### 4. Database
```sql
-- Import BD/nuevaBD.sql into PostgreSQL
-- Default users: admin/admin
```

---

## 🔌 Main APIs

| Endpoint | Description | Method |
|----------|-------------|--------|
| `/api/proyectos` | Projects CRUD + States | GET/POST/PUT/DELETE |
| `/api/facturas` | Invoicing + Items | POST/PUT |
| `/api/chat/private` | Real-time Messages | Socket.io |
| `/api/stats` | Financial Dashboard | GET |
| `/api/auth/login` | Admin Authentication | POST |

---

## 📊 System Modules

```
👥 Clients & Contracts
🎬 Projects & States
📍 Locations & Resources
👥 Personnel & Assignments
📦 Deliverables & States
💰 Finances (Invoices/Expenses/Payments)
📈 Reports & Dashboards
💬 Real-time Chat
```

---

## 🚀 Local Demo

1. **Backend**: `http://localhost:3000`
2. **Frontend**: `http://localhost:5173`
3. **Admin Login**: `admin` / `admin`
4. **Client Chat**: `http://localhost:5173/clientchat`

---

## 📄 License
Open source under **MIT License**. Enhanced fork of original [colmen4z/audiovisualpro](https://github.com/colmen4z/audiovisualpro).

Developed with ❤️ by [**StonishVicer**](https://github.com/StonishVicer)
