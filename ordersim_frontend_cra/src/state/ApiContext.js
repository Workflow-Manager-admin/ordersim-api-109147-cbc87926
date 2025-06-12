import React, { createContext, useContext, useState } from "react";

// PUBLIC_INTERFACE
export const ApiContext = createContext();

// PUBLIC_INTERFACE
export function ApiProvider({ children }) {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("apiKey") || process.env.REACT_APP_API_KEY || ""
  );
  const [baseUrl] = useState(process.env.REACT_APP_API_BASE_URL || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!apiKey);

  const saveApiKey = (key) => {
    setApiKey(key);
    setIsAuthenticated(!!key);
    localStorage.setItem("apiKey", key);
  };

  // PUBLIC_INTERFACE
  const apiFetch = async (url, opts = {}) => {
    const headers = {
      ...(opts.headers || {}),
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": opts.body ? "application/json" : undefined,
    };
    const response = await fetch(`${baseUrl}${url}`, {
      ...opts,
      headers,
    });
    if (response.status === 401 || response.status === 403) {
      setIsAuthenticated(false);
      localStorage.removeItem("apiKey");
      throw new Error("Authentication failed");
    }
    return response;
  };

  return (
    <ApiContext.Provider
      value={{
        baseUrl,
        apiKey,
        isAuthenticated,
        setApiKey: saveApiKey,
        apiFetch,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useApi() {
  return useContext(ApiContext);
}
