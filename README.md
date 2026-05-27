# EquipFlow - AI-Powered Industrial Asset Management System ⚡🤖

Manage your industrial assets with real-time GPS tracking, QR code event sourcing, offline-first mobile operators, and an AI-powered predictive maintenance engine that flags equipment failure before it happens.

Perfect for logistics, manufacturing, and field operations where internet connectivity is unreliable but asset tracking is critical. EquipFlow bridges the gap between field operators and the central management dashboard — and now, it *predicts the future*.

⚡ **Offline-First • AI-Powered • Event-Sourced • Built for Scale** ⚡

---

## 🧠 Project Overview

### What is EquipFlow?
EquipFlow is a production-grade, full-stack asset management platform. It operates across **three tiers**:
1. A **Central Admin Dashboard** (React) for administrators and managers — with live analytics, AI alerts, and GPS maps.
2. A mobile-optimized, **Offline-First PWA** (Progressive Web App) for field operators who scan QR codes in the field.
3. A **Python AI Microservice** (FastAPI + Scikit-Learn) that runs a Machine Learning model to predict equipment failure risk.

### Project Abstract
EquipFlow is a full-stack industrial platform that tracks the complete lifecycle and real-time location of physical assets. The system overcomes real-world field challenges such as dead zones by employing an offline-first architecture with background synchronization. It then goes a step further by applying a **Random Forest Classification model** trained on historical event data to proactively predict which assets are at risk of failure — before they break down.

> **Core Philosophy**: "Tracking is not just about current state — it is about the journey, and predicting where the journey ends."

---

## 🤖 AI Predictive Maintenance Engine

This is the most technically advanced feature of EquipFlow. It uses a **Scikit-Learn Random Forest Classifier** to compute a failure probability score (0% – 100%) for every active asset.

### How Predictions Work — Step by Step

**Step 1: Event Sourcing as Training Data**

Every time an operator scans an asset, moves it, or logs maintenance — an immutable **Event** is written to MongoDB. These events are the raw material the AI uses to understand an asset's history. The relevant event types are:
- `scan` → routine check-in
- `in-transit` → asset is being moved/shipped
- `maintenance` → a maintenance checkup was performed

**Step 2: Feature Engineering (Node.js)**

When you click "Run AI Predictive Analysis", the Node.js backend queries each asset's complete event history and computes **5 numerical features**:

| Feature | What it measures |
|---|---|
| `age_days` | How many days since the asset was first registered |
| `total_scans` | Total number of scan events in its lifetime |
| `transit_count` | How many times it has been moved / shipped |
| `maintenance_count` | How many maintenance events have been logged |
| `days_since_last_maintenance` | Days elapsed since the most recent maintenance event |

**Step 3: ML Inference (Python FastAPI)**

The computed features are sent via HTTP POST to the **Python AI Microservice** running on port `8001`. The FastAPI service feeds these features into the trained Random Forest model and returns a `risk_probability` between `0.0` and `1.0`.

**Step 4: Risk Scoring Logic**

The Random Forest model was trained on the following logical rules (encoded into 1,000 synthetic training samples):

- High `age_days` → machine is old, more likely to fail
- High `transit_count` → heavy use, more wear and tear
- High `days_since_last_maintenance` → long overdue for a checkup → high risk
- Regular `maintenance_count` → well-maintained, lower risk

**Step 5: Dashboard Alert Thresholds**

The returned probability is color-coded in real time:

| Score | Badge | Meaning |
|---|---|---|
| `> 75%` | 🔴 Red | **Critical** — Likely to fail soon |
| `50% – 75%` | 🟡 Yellow | **Warning** — Elevated risk |
| `< 50%` | 🟢 Green | **Healthy** — No immediate risk |
| Not analyzed | Gray | AI has not yet run for this asset |

### The ML Model: Random Forest Classifier

- **Algorithm**: `sklearn.ensemble.RandomForestClassifier` with 100 decision trees
- **Training Data**: 1,000 synthetic samples generated with realistic failure patterns
- **Model Persistence**: The trained model is serialized to `model.pkl` using `joblib` and reloaded on startup (no re-training needed between runs)
- **Auto-Train on Startup**: If `model.pkl` does not exist, the service auto-trains on first launch

---

## 🏗️ System Architecture & Data Flow

### Three-Server Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ React Frontend  │────▶│ Node.js/Express API  │────▶│  Python FastAPI      │
│ (Port 5173)     │     │ (Port 5000)          │     │  AI Microservice     │
│                 │     │ MongoDB/Mongoose      │     │  (Port 8001)         │
│ Admin Dashboard │     │ JWT Auth, Events,    │     │  Scikit-Learn        │
│ Operator PWA    │     │ Assets, Sync         │     │  RandomForest        │
└─────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### Full Data Flow

**Field Operation Flow:**
`Operator scans QR` → `Event saved to IndexedDB (offline)` → `Network restores` → `Bulk sync to Node.js API` → `Events written to MongoDB` → `Dashboard updates live`

**AI Prediction Flow:**
`Admin clicks "Run AI Analysis"` → `Node.js aggregates 5 features per asset from Event history` → `Features sent to Python /predict endpoint` → `Random Forest returns failure probability` → `MongoDB updated with aiFailureRisk score` → `Dashboard shows color-coded risk badges`

### Backend Architecture (Node.js/Express)
- **RESTful API**: Handles authentication, asset CRUD, event logging, and sync queues.
- **MongoDB**: Mongoose schemas for `User`, `Asset`, and `Event` with referential integrity.
- **QR Generation**: Auto-generates base64 PNG QR codes on asset creation via the `qrcode` library.
- **Security**: JWT-based stateless authentication with RBAC middleware.
- **AI Bridge**: `ai.service.js` aggregates features and bridges to the Python microservice.

### Frontend Architecture (React/Vite)
- **Context Providers**: `AuthContext` and `SyncContext` for global state.
- **Dynamic Routing**: Role-based redirects (Operators → Scanner, Admins → Dashboard).
- **Geocoding**: Real GPS coordinates via the HTML5 Geolocation API on scan events.

### AI Microservice Architecture (Python/FastAPI)
- **`model.py`**: Synthetic data generator + Random Forest training + inference logic.
- **`main.py`**: FastAPI routes exposing `/predict` and `/train` endpoints.
- **`requirements.txt`**: `fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `numpy`, `joblib`.

---

## 🚀 Key Features

- 🤖 **AI Predictive Maintenance**: Random Forest ML model predicts equipment failure probability from historical event data. Color-coded risk badges (🔴🟡🟢) on every asset.
- 📱 **Offline-First Operator Mode**: Mobile QR scanner that works entirely without internet, queuing scans and GPS events locally in IndexedDB.
- 🗺️ **Live GPS Map View**: Leaflet-powered map showing real-time pins for the last known scanned location of all equipment.
- 📜 **Immutable Audit Trails (Event Sourcing)**: Complete chronological history of every scan, movement, and status change — nothing is ever overwritten.
- ⚠️ **Smart Maintenance Alerts**: Dashboard widget that automatically flags assets past their scheduled maintenance date.
- 🖨️ **Bulk QR Code Export**: Generate and print sheets of all active QR codes with one click (`react-to-print`).
- 👥 **Strict RBAC**: Admin, Manager, and Operator tiers with enforced role-based routing.
- 🎨 **Premium Dark Design**: Sleek industrial slate and amber UI with glassmorphic elements and micro-animations.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local instance or Atlas cloud URI)

### 1. Backend Setup (Node.js)
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret

# Seed the database with demo users and assets
npm run seed

# Start the API server (port 5000)
npm run dev
```

### 2. Frontend Setup (React)
```bash
cd frontend
npm install

# Start Vite dev server (port 5173)
npm run dev
```

### 3. AI Microservice Setup (Python) — NEW
```bash
cd ai-service

# Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate          # macOS/Linux

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server (port 8001)
# The model auto-trains on first launch if model.pkl doesn't exist
python main.py
```

> **Note:** All three servers must be running simultaneously for the full feature set. The main app works without the AI service, but the "Run AI Predictive Analysis" button requires it.

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

The seeder provisions three accounts for immediate testing:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@equipflow.com` | `admin123` | Full access — users, assets, analytics, AI |
| **Manager** | `manager@equipflow.com` | `manager123` | Dashboard and analytics, read-only |
| **Operator** | `operator@equipflow.com` | `operator123` | Mobile QR scanner only |

---

## 💻 Tech Stack

### Backend (Node.js)
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcryptjs | Password hashing |
| `qrcode` | Base64 QR code generation |
| `axios` | HTTP bridge to Python AI service |
| `dotenvx` | Environment variable management |
| `nodemon` | Development hot-reload |

### Frontend (React)
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router DOM v6 | Client-side routing |
| Leaflet + `react-leaflet` | GPS map rendering |
| `idb` (IndexedDB) | Offline event queue storage |
| `html5-qrcode` | Camera-based QR code scanning |
| `react-to-print` | Browser-native print/export |
| Vanilla CSS (Variables, Grid, Glassmorphism) | Styling |

### AI Microservice (Python)
| Technology | Purpose |
|---|---|
| FastAPI + Uvicorn | High-performance async API server |
| Scikit-Learn | Random Forest Classifier |
| Pandas + NumPy | Feature engineering and data manipulation |
| joblib | Model serialization (`.pkl` file) |

---

## 📁 Project Structure

```text
EquipFlow/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection
│   │   ├── controllers/         # Route handlers (asset, auth, dashboard, ai, sync)
│   │   ├── middlewares/         # JWT auth guard, RBAC, error handler
│   │   ├── models/              # Mongoose schemas (User, Asset, Event)
│   │   ├── routes/              # Express route definitions
│   │   ├── services/
│   │   │   └── ai.service.js    # Feature aggregation + Python API bridge
│   │   └── server.js            # API entrypoint
│   ├── seed.js                  # Database seeder (users & demo assets)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # QR Scanner, Layout, Modals, BulkQRExport
│   │   ├── context/             # AuthContext, SyncContext
│   │   ├── pages/
│   │   │   ├── dashboard/       # DashboardOverview (AI alerts), AssetList, Map
│   │   │   ├── Login.jsx
│   │   │   └── OperatorDashboard.jsx
│   │   ├── services/            # API client (dataService.js), IndexedDB (syncDb.js)
│   │   ├── App.jsx
│   │   └── index.css            # Global CSS tokens and animations
│   └── package.json
│
├── ai-service/                  # NEW — Python ML Microservice
│   ├── main.py                  # FastAPI app with /predict and /train endpoints
│   ├── model.py                 # RandomForest training + inference logic
│   ├── requirements.txt         # Python dependencies
│   ├── .gitignore               # Excludes venv/, model.pkl, .env
│   └── model.pkl                # Serialized trained model (auto-generated)
│
└── README.md
```

---

## 📝 Core API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Verify token, return user profile |

### Assets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assets` | List all assets (search/pagination supported) |
| `POST` | `/api/assets` | Create asset (auto-generates QR code) |
| `PUT` | `/api/assets/:id` | Update asset details |
| `DELETE` | `/api/assets/:id` | Delete asset |
| `GET` | `/api/assets/:id/history` | Full chronological event trail for one asset |
| `POST` | `/api/assets/:id/qr` | Regenerate QR code |

### Dashboard & AI
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/overview` | Live stats, maintenance alerts, AI risk assets |
| `GET` | `/api/dashboard/activity` | Recent event feed |
| `POST` | `/api/dashboard/run-predictions` | Trigger AI risk scoring for all assets |
| `POST` | `/api/dashboard/train-ai` | Retrain the ML model (Admin only) |

### Offline Sync
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sync/events` | Bulk ingest offline events from operators |
| `GET` | `/api/sync/assets` | Lightweight asset catalog pull for operators |

### Python AI Microservice (Port 8001)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/train` | Generate synthetic data and train the Random Forest model |
| `POST` | `/predict` | Predict failure probability given 5 asset features |

---

## 🔑 How to Run the Predictive Maintenance Feature

1. Make sure all **three servers** are running (Node, React, Python).
2. Log in as **Admin** at `http://localhost:5173`.
3. Navigate to the **Overview** tab of the dashboard.
4. Click the **"🧠 Run AI Predictive Analysis"** button in the top right.
5. The system aggregates all asset event histories, queries the ML model, and updates every asset's risk score in real time.
6. High-risk assets (>50% failure probability) appear in the **AI Predictive Alerts** widget.
7. Visit the **Assets** tab to see color-coded **AI Risk Score** badges on every row.

---

## 📜 License & Acknowledgment
Licensed under the MIT License. Free for educational, academic, and personal use.

🎉 **Ready to predict, track, and manage smarter? Run EquipFlow and let the AI do the heavy lifting!** 🤖⚡
