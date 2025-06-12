import React, { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function ProductsPage() {
  const { apiFetch } = useApi();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const loadProducts = async () => {
    const res = await apiFetch("/products");
    setProducts(await res.json());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (pid) => {
    await apiFetch(`/products/${pid}`, { method: "DELETE" });
    loadProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }),
    });
    setForm({ name: "", description: "", price: "", stock: "" });
    loadProducts();
  };

  return (
    <section>
      <h2>Products</h2>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="name"
        />
        <input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="description"
        />
        <input
          required
          type="number"
          value={form.price}
          min={0.01}
          step="0.01"
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="price"
        />
        <input
          required
          type="number"
          min={1}
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          placeholder="stock"
        />
        <button type="submit">Add Product</button>
      </form>
      <div className="card-list">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <strong>
              {p.name} (ID: {p.id})
            </strong>
            <div>
              <span>
                <em>{p.description}</em> <br />
                Price: ${p.price} | Stock: {p.stock}
              </span>
            </div>
            <button className="btn danger" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
