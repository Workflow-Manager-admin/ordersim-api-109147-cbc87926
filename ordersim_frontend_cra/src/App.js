import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useApi } from "./state/ApiContext";

import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import PaymentsPage from "./pages/PaymentsPage";
import AuthForm from "./components/AuthForm";

function Navbar() {
  return (
    <nav className="nav">
      <Link to="/users">Users</Link>
      <Link to="/products">Products</Link>
      <Link to="/orders">Orders</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/payments">Payments</Link>
    </nav>
  );
}

// PUBLIC_INTERFACE
function App() {
  const { isAuthenticated } = useApi();

  return (
    <div>
      <header className="app-header">
        <h1>OrderSim Demo</h1>
      </header>
      {isAuthenticated ? (
        <>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/orders" />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Routes>
          </main>
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;
