// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { loginRequest, registerRequest } from "../services/authService";
import { saveAuth, clearAuth } from "../utils/authUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // 1. Intenta cargar del localStorage (lógica original)
    const u = localStorage.getItem("user");
    if (u) return JSON.parse(u);

    // 🛑 2. AUTO-LOGIN TEMPORAL PARA DESARROLLO (ROL DOCENTE)
    // REMOVER ESTE BLOQUE cuando integres el backend real.
    // Esto es lo que permite ver el dashboard sin pasar por el login.
    return { 
        _id: 'dev-d', 
        nombre: 'Docente Temporal', 
        email: 'docente@dev.com', 
        rol: 'docente' 
    }; 
    // --------------------------------------------------------
    
    // Si no quieres el auto-login, usa la línea original:
    // return null; 
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginRequest(email, password); // backend debe devolver { token, user }
      const { token, user } = res.data;
      saveAuth(token, user);
      setUser(user);
      setLoading(false);
      return { ok: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || "Error en login";
      return { ok: false, message: msg };
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await registerRequest(payload); // backend devuelve usuario creado
      setLoading(false);
      return { ok: true, data: res.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || "Error al registrar";
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  useEffect(() => {
    // Aquí podrías validar el token si es necesario
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


 // Hook para acceder fácilmente a los valores del contexto de autenticación.
export const useAuth = () => {
    return useContext(AuthContext);
};