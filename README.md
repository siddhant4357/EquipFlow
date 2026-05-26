# EquipFlow - Industrial Asset Management System ⚡⚙️
Manage your industrial assets effortlessly with real-time GPS tracking, QR code event sourcing, and an offline-first mobile operator mode.

Perfect for logistics, manufacturing, and field operations where internet connectivity is unreliable but asset tracking is critical. EquipFlow bridges the gap between field operators and the central management dashboard.

⚡ **Offline-First • Built for Scale • Event-Sourced** ⚡

---

## 🧠 Project Overview

### What is EquipFlow?
EquipFlow is a production-grade asset management platform. It operates across two primary interfaces: a **Central Management Dashboard** for administrators and a mobile-optimized, **Offline-First PWA** (Progressive Web App) for field operators.

### Project Abstract
EquipFlow develops a robust tracking system capable of managing the lifecycle and real-time location of industrial equipment. The system overcomes real-world field challenges such as dead zones and internet drops by employing an offline-first architecture with background synchronization. It integrates a Node.js/MongoDB backend with a modern React web application.

> **Note**
> **Core Philosophy**: "Tracking is not just about current state—it is about the journey." This project utilizes **Event Sourcing**, ensuring that every scan, location change, and status update is logged as an immutable event in the audit trail, rather than just overwriting the asset's current state.

### Methodology: Why Offline-First?
**The Challenge: Dead Zones**
Field operators often work in warehouses, basements, or remote sites with spotty or zero cellular reception. 

**Problem:** Traditional web apps fail or hang when trying to update the server without a connection.
**Result:** Frustrated workers, lost data, and inaccurate tracking.

**The Solution: IndexedDB & Background Sync**
We utilize `idb` to store the entire asset catalog locally on the operator's device.
- **Local Read/Write:** When an operator scans an asset and logs a location, the event is immediately saved to an offline queue in the browser's IndexedDB.
- **Auto-Sync:** The application continuously monitors `navigator.onLine`. The moment connectivity is restored, the queued events are bulk-pushed to the backend server, seamlessly updating the live dashboard.

---

## 🏗️ System Architecture & Data Flow

EquipFlow utilizes a decoupled client-server architecture.

### High-Level Data Flow
`Field Operator scans QR` → `Local IndexedDB Query` → `Event Logged Offline` → `Network Restores` → `Bulk Sync to Backend` → `Live Dashboard Updates`

### A. Backend Architecture (Node.js/Express)
- **RESTful API**: Handles authentication, asset CRUD, event logging, and sync queues.
- **MongoDB**: Utilizes robust Mongoose schemas (`User`, `Asset`, `Event`) with referential integrity.
- **QR Generation**: Automatically generates and stores base64 PNG QR codes upon asset creation.
- **Security**: JWT-based stateless authentication with strict Role-Based Access Control (RBAC).

### B. Frontend Architecture (React/Vite)
- **Context Providers**: Global state management for Authentication (`AuthContext`) and Offline Sync Queues (`SyncContext`).
- **Dynamic Routing**: Role-based redirects ensuring Operators land on the scanner, while Admins land on the analytics dashboard.
- **Geocoding**: Extracts real-time GPS coordinates via the HTML5 Geolocation API.

---

## 🚀 Key Features

*   📱 **Offline-First Operator Mode:** Mobile-optimized QR scanner that works entirely offline, queuing scans and location updates locally.
*   🗺️ **Live GPS Map View:** A dedicated map utilizing `react-leaflet` to display real-time pins for the last known scanned locations of all equipment.
*   📜 **Immutable Audit Trails:** A complete chronological history of every interaction, status change, and movement an asset has undergone.
*   ⚠️ **Smart Maintenance Alerts:** Dashboard widgets that automatically flag equipment past their scheduled maintenance or calibration dates.
*   🖨️ **Bulk QR Code Export:** Generate printable sheets of all active asset QR codes directly from the browser (`react-to-print`).
*   👥 **Strict RBAC:** Three distinct tiers—Admin (full access), Manager (view/analytics), and Operator (field scanning only).
*   🎨 **Premium Dark Design:** Sleek industrial slate and amber aesthetic (`#0f172a`) with glassmorphic elements and CSS animations.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
*   Node.js 18+
*   MongoDB (Local instance or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install

# Configure Environment Variables
cp .env.example .env
# Edit .env file with your MongoDB URI and JWT Secret

# Run Database Seeder (Creates Demo Users and Assets)
npm run seed

# Start the Express server (Runs on port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite server (Runs on port 5173)
npm run dev
```

---

## ⚙️ Configuration & Environment Variables

**Backend `.env`**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/equipflow
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📊 Demo Accounts

The database seeder provisions three accounts so you can test the RBAC immediately:

*   **Admin**: `admin@equipflow.com` / `admin123` *(Sees everything, can create users and assets)*
*   **Manager**: `manager@equipflow.com` / `manager123` *(Can view dashboard and analytics)*
*   **Operator**: `operator@equipflow.com` / `operator123` *(Redirected directly to the mobile QR scanner)*

---

## 💻 Tech Stack

### Backend
*   **Framework**: Node.js, Express.js
*   **Database**: MongoDB, Mongoose
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs
*   **Utilities**: `qrcode` (Base64 QR generation)

### Frontend
*   **Framework**: React 18, Vite
*   **Routing**: React Router DOM v6
*   **Mapping**: Leaflet, `react-leaflet`
*   **Offline Storage**: `idb` (IndexedDB promises)
*   **Scanner**: `html5-qrcode`
*   **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism)
*   **Printing**: `react-to-print`

---

## 📁 Project Structure

```text
EquipFlow/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route logic (asset, auth, dashboard, sync)
│   │   ├── middlewares/     # Auth guards and global error handlers
│   │   ├── models/          # Mongoose Schemas (User, Asset, Event)
│   │   ├── routes/          # Express route definitions
│   │   └── server.js        # API entrypoint
│   ├── seed.js              # Database initialization script
│   └── package.json         
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Scanner, Modals, Layout)
│   │   ├── context/         # React Context (Auth, Sync)
│   │   ├── hooks/           # Custom hooks (useGeolocation, useLocalStorage)
│   │   ├── pages/           # Route Views (Dashboard, Map, Operator)
│   │   ├── services/        # API clients and IndexedDB logic
│   │   ├── App.jsx          # Primary router and wrappers
│   │   └── index.css        # Global CSS variables and styling
│   └── package.json         
└── README.md                # Project documentation
```

---

## 📝 Core API Endpoints

### Authentication
*   `POST /api/auth/login`: Authenticate user and issue JWT.
*   `GET /api/auth/me`: Verify token and return user profile.

### Assets & Dashboard
*   `GET /api/assets`: Retrieve all assets (supports pagination/search).
*   `POST /api/assets`: Create new asset (auto-generates QR).
*   `GET /api/assets/:id/history`: Fetch the chronological event trail for an asset.
*   `GET /api/dashboard/overview`: Fetch live analytics and maintenance alerts.

### Offline Sync
*   `POST /api/sync/events`: Bulk ingest offline events queued by operators.
*   `GET /api/sync/assets`: Lightweight endpoint for operators to pull the latest catalog.

---

## 📜 License & Acknowledgment
Licensed under the MIT License. Free for educational, academic, and personal use.

🎉 **Ready to track smarter? Run EquipFlow locally and manage your industrial assets with ease!** 🎉
