import React, { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function OrdersPage() {
  const { apiFetch } = useApi();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);

  // For new order
  const [order, setOrder] = useState({
    user_id: "",
    items: [],
  });
  const [item, setItem] = useState({ product_id: "", quantity: 1 });

  useEffect(() => {
    apiFetch("/users")
      .then((r) => r.json())
      .then(setUsers);
    apiFetch("/products")
      .then((r) => r.json())
      .then(setProducts);
    loadOrders();
    // eslint-disable-next-line
  }, []);

  const loadOrders = async () => {
    let url = "/orders";
    const params = [];
    if (userFilter) params.push(`user_id=${userFilter}`);
    if (statusFilter) params.push(`status_=${statusFilter}`);
    if (params.length) url += "?" + params.join("&");
    const res = await apiFetch(url);
    setOrders(await res.json());
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        user_id: Number(order.user_id),
        items: order.items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
        })),
      }),
    });
    setOrder({ user_id: "", items: [] });
    loadOrders();
  };

  const handleAddItem = () => {
    if (!item.product_id || item.quantity < 1) return;
    setOrder((o) => ({
      ...o,
      items: [...o.items, { ...item }],
    }));
    setItem({ product_id: "", quantity: 1 });
  };

  const handleStatusUpdate = async (oid, status) => {
    setStatusUpdating(oid);
    await apiFetch(`/orders/${oid}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setStatusUpdating(null);
    loadOrders();
  };

  const handleDelete = async (oid) => {
    await apiFetch(`/orders/${oid}`, { method: "DELETE" });
    loadOrders();
  };

  return (
    <section>
      <h2>Orders</h2>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          loadOrders();
        }}
      >
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any Status</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      <div className="card-list">
        {orders.map((o) => (
          <div className="card" key={o.id}>
            <div>
              <b>Order #{o.id}</b> user: {o.user_id} ({users.find(u => u.id === o.user_id)?.username || "?"})
            </div>
            <div>Status: <b>{o.status}</b></div>
            <div>Items:
              <ul>
                {o.items.map((it, i) => (
                  <li key={i}>
                    {products.find(p => p.id === it.product_id)?.name || it.product_id} x {it.quantity} (${it.price})
                  </li>
                ))}
              </ul>
            </div>
            <div>Total: ${o.total}</div>
            <div>
              <select
                value=""
                onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                disabled={statusUpdating === o.id}
              >
                <option value="">Change Status…</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="btn danger" onClick={() => handleDelete(o.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr />
      <h3>Create Order</h3>
      <form className="inline-form" onSubmit={handleOrderSubmit}>
        <select
          required
          value={order.user_id}
          onChange={e => setOrder(o => ({ ...o, user_id: e.target.value }))}
        >
          <option value="">Select User…</option>
          {users.map((u) =>
            <option key={u.id} value={u.id}>{u.username}</option>
          )}
        </select>
        <div>
          Add Item:
          <select
            value={item.product_id}
            onChange={e => setItem(i => ({ ...i, product_id: e.target.value }))}
          >
            <option value="">Select Product…</option>
            {products.map((p) =>
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
          <input
            type="number"
            min={1}
            style={{ width: 60 }}
            value={item.quantity}
            onChange={e => setItem(i => ({ ...i, quantity: e.target.value }))}
          />
          <button type="button" className="btn" onClick={handleAddItem}>
            Add
          </button>
        </div>
        <div>
          {order.items.map((it, idx) =>
            <span key={idx} style={{ marginRight: 8 }}>
              [{products.find(p => p.id === Number(it.product_id))?.name || it.product_id} x {it.quantity}]
            </span>
          )}
        </div>
        <button type="submit" disabled={!order.user_id || !order.items.length}>
          Place Order
        </button>
      </form>
    </section>
  );
}
