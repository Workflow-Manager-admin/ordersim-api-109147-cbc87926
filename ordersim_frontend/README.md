# OrderSim Frontend

A React frontend for the OrderSim API (FastAPI mock e-commerce backend).  
**Features:** Full CRUD UI for users, products, orders, cart, payments. API Key Auth, env config, smooth workflow.

---

## 🏁 Quick Start

### 1. Backend (FastAPI) Setup

From the project root, run:

```bash
cd ordersim_api
source venv/bin/activate
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```
(Requires Python, FastAPI, Uvicorn. See backend README for more info.)

### 2. Frontend Setup

```bash
cd ordersim_frontend
cp .env.example .env       # Update variables if needed
npm install
npm run dev                # Runs Vite dev server on http://localhost:5173
```

### 3. Usage

- The frontend will prompt for an API Key (default: `test_api_key_123`).
- All major backend operations are supported.
- Environment variables in `.env`:
  - `VITE_API_BASE_URL` — Backend root (default: http://localhost:8000)
  - `VITE_API_KEY`      — API Key sent as `Authorization: Bearer <API_KEY>`

---

## 📚 Features

- **Users:** Create, list, delete.
- **Products:** CRUD.
- **Orders:** Place, list/filter, update status, delete.
- **Cart:** Add/view/clear items.
- **Payments:** Initiate, view.
- **API Key Auth:** Everything is protected by an API key.

## 🛡️ Configuration

Edit `.env` to match your backend (host/port/auth).  
Update the API key if running with different secret.

---

## 🛠️ Tech Stack

- Vite + React + Fetch API
- Context + hooks for API/Auth state
- Simple styles, responsive layout

## ⏭️ Development

- Open at http://localhost:5173 after running as above.
- Change API endpoints/config as needed for your workflow.
