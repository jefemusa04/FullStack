// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { loginRequest, registerRequest } from "../services/authService";
import { saveAuth, clearAuth } from "../utils/authUtils";
import { toast } from 'react-toastify';

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

    // Rehidrata el usuario desde localStorage (útil cuando se actualiza localStorage fuera del flujo normal)
    const rehydrateUser = () => {
        const raw = localStorage.getItem("user");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setUser(parsed);
                return;
            } catch (e) {
                console.warn("AuthContext: error parsing user from localStorage", e);
            }
        }
        setUser(null);
    };

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

    // Actualiza el perfil localmente (nombre y/o contraseña).
    // Si tienes un endpoint en el backend, deberías llamar ahí.
    const updateProfile = async ({ nombre, password }) => {
        try {
            // Ejemplo: si tu backend soporta actualizar perfil, llama aquí.
            // await api.put(`/usuarios/${user._id}`, { nombre, password });

            const updated = { ...(user || {}), nombre: nombre || (user && user.nombre) };
            // Actualiza localStorage y estado
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);

            // Notificar otras partes de la app
            window.dispatchEvent(new Event('authChanged'));
            toast.success('Perfil actualizado');
            return { ok: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al actualizar perfil';
            toast.error(msg);
            return { ok: false, message: msg };
        }
    };

  useEffect(() => {
        // Aquí podrías validar el token si es necesario
        // Escuchar cambios de localStorage desde otras pestañas
        const onStorage = (e) => {
            if (e.key === 'user') rehydrateUser();
        };

        // Evento personalizado para notificar cambios en la misma pestaña
        const onAuthChanged = () => rehydrateUser();

        window.addEventListener('storage', onStorage);
        window.addEventListener('authChanged', onAuthChanged);

        // Al montar, rehidratar por si ya hay user en localStorage
        rehydrateUser();

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('authChanged', onAuthChanged);
        };
  }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};


 // Hook para acceder fácilmente a los valores del contexto de autenticación.
export const useAuth = () => {
    return useContext(AuthContext);
};