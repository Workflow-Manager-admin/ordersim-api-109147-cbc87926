import React, { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function UsersPage() {
  const { apiFetch } = useApi();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function loadUsers() {
    const res = await apiFetch("/users");
    setUsers(await res.json());
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUsername("");
    setPassword("");
    loadUsers();
  };

  const handleDelete = async (id) => {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  return (
    <section>
      <h2>Users</h2>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          required
        />
        <input
          type="password"
          value={password}
          minLength={3}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          required
        />
        <button type="submit">Add User</button>
      </form>
      <div className="card-list">
        {users.map((u) => (
          <div className="card" key={u.id}>
            <span>
              <strong>{u.username}</strong> (ID: {u.id})
            </span>
            <button className="btn danger" onClick={() => handleDelete(u.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
