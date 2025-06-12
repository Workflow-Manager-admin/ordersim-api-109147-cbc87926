import React, { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function CartPage() {
  const { apiFetch } = useApi();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState("");
  const [cart, setCart] = useState(null);
  const [add, setAdd] = useState({ product_id: "", quantity: 1 });

  useEffect(() => {
    apiFetch("/users").then((r) => r.json()).then(setUsers);
    apiFetch("/products").then((r) => r.json()).then(setProducts);
  }, []);

  const loadCart = async () => {
    if (!userId) return;
    const res = await apiFetch(`/users/${userId}/cart`);
    setCart(await res.json());
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await apiFetch(`/users/${userId}/cart`, {
      method: "POST",
      body: JSON.stringify({
        product_id: Number(add.product_id),
        quantity: Number(add.quantity),
      }),
    });
    setAdd({ product_id: "", quantity: 1 });
    loadCart();
  };

  const handleClear = async () => {
    await apiFetch(`/users/${userId}/cart`, { method: "DELETE" });
    loadCart();
  };

  return (
    <section>
      <h2>Cart</h2>
      <select value={userId} onChange={e => { setUserId(e.target.value); setCart(null); }}>
        <option value="">Select User…</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
      </select>
      {userId && (
        <>
          <button onClick={loadCart}>Load Cart</button>
          <form className="inline-form" onSubmit={handleAdd}>
            <select
              value={add.product_id}
              required
              onChange={e => setAdd(a => ({ ...a, product_id: e.target.value }))}
            >
              <option value="">Product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={add.quantity}
              onChange={e => setAdd(a => ({ ...a, quantity: e.target.value }))}
              style={{ width: 80 }}
            />
            <button type="submit">Add to Cart</button>
          </form>
          <button className="btn danger" onClick={handleClear}>Clear Cart</button>
        </>
      )}
      <div className="card" style={{ marginTop: '1rem' }}>
        {cart ? (
          <>
            <ul>
              {cart.items.map(it => (
                <li key={it.product_id}>
                  {products.find(p => p.id === it.product_id)?.name || it.product_id} x {it.quantity} (${it.price})
                </li>
              ))}
            </ul>
            <div><b>Total: ${cart.total}</b></div>
          </>
        ) : (
          userId && <div>No cart loaded. Click "Load Cart".</div>
        )}
      </div>
    </section>
  );
}
