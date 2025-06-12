# OrderSim Frontend (Create React App)

A React frontend for the OrderSim API (mock FastAPI e-commerce backend), scaffolded with Create React App (CRA).  
Supports Users, Products, Orders, Cart, and Payments; API Key authentication and environment configuration.  
**No Vite or Vanilla JS – pure React JS with CRA!**

---

## 🏁 Quick Start

### 1. Backend (FastAPI) Setup

From the project root, start the backend:

```bash
cd ordersim_api
source venv/bin/activate
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (CRA) Setup

```bash
cd ordersim_frontend_cra
cp .env.example .env        # Edit variables if needed
npm install
npm start                   # Opens http://localhost:3000
```

> **Note:** The frontend will prompt you for your API Key (default: `test_api_key_123`).  
> The backend URL and default API key can be set in the `.env` file.

#### Environment Variables

- `REACT_APP_API_BASE_URL`: Backend root (default: http://localhost:8000)
- `REACT_APP_API_KEY`: API Key sent as `Authorization: Bearer <API_KEY>`

---

## 📚 Features

- **Users:** Create, list, delete users.
- **Products:** Add, list, delete products.
- **Orders:** Place, list/filter, update status, delete orders.
- **Cart:** Add/view/clear cart items.
- **Payments:** Initiate and view payments.
- **API Key Auth:** All endpoints are protected by API Key.

---

## 🛠️ Tech Stack / Layout

- Create React App + React Router
- Context API + hooks for state and API handling
- Simple, clean styles (see `src/styles/global.css`)
- Modern, modular approach

---

## Development

- Source: `src/` (main code in `App.js`, components, pages, state).
- Add more UI or API interactions as needed.
- See backend `README.md` for backend info.

---
