import React from "react";
import { useAuth } from "../hooks/userAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Bienvenido, {user?.nombre || user?.email || "Usuario"}.</p>
      <button onClick={() => { logout(); window.location.href = "/login"; }}>
        Cerrar sesión
      </button>
    </div>
  );
}
