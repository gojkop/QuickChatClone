// client/src/main.jsx (or App.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router";
import { AuthProvider } from "./state/auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
