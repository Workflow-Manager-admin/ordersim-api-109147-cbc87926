import React, { useState } from "react";
import { useApi } from "../state/ApiContext";

// PUBLIC_INTERFACE
export default function AuthForm() {
  const { setApiKey } = useApi();
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setApiKey(value.trim());
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>API Key Required</h2>
      <input
        type="text"
        placeholder="Enter API Key"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
