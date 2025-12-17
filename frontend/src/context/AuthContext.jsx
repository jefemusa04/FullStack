import React, { createContext, useState, useEffect, useContext } from "react";
import { loginRequest, registerRequest } from "../services/authService";
import { saveAuth, clearAuth, getUser } from "../utils/authUtils";
import { toast } from 'react-toastify';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getUser());
    const [loading, setLoading] = useState(false);

    // Rehidrata el usuario desde localStorage
    const rehydrateUser = () => {
        const userData = getUser();
        setUser(userData);
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await loginRequest(email, password);
            
            // El backend devuelve: { _id, nombre, email, rol, token }
            const userData = res.data;
            const token = userData.token;

            // Guardar en localStorage
            saveAuth(token, userData);
            setUser(userData);

            setLoading(false);
            return { ok: true, data: { user: userData } };
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.mensaje || err.response?.data?.message || "Error en login";
            return { ok: false, message: msg };
        }
    };

    const register = async (payload) => {
        setLoading(true);
        try {
            const res = await registerRequest(payload);
            
            // El backend devuelve: { _id, nombre, email, rol, token }
            const userData = res.data;
            const token = userData.token;

            // Guardar en localStorage
            if (token) {
                saveAuth(token, userData);
                setUser(userData);
            }

            setLoading(false);
            return { ok: true, data: userData };
        } catch (err) {
            setLoading(false);
            const msg = err.response?.data?.mensaje || err.response?.data?.message || "Error al registrar";
            return { ok: false, message: msg };
        }
    };

    const logout = () => {
        clearAuth();
        setUser(null);
        toast.info('Sesión cerrada');
    };

    // Actualizar perfil
    const updateProfile = async ({ nombre }) => {
        try {
            // Configuramos el header con el Token
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`, // Necesitamos el token actual
                },
            };

            // ENVIAMOS LA PETICIÓN AL BACKEND (Esto es lo que faltaba)
            const { data } = await axios.put(VITE_API_URL, { nombre }, config);

            // Si el backend responde bien, actualizamos el estado local con LO QUE RESPONDIÓ EL SERVIDOR
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);

            // Eventos y notificaciones
            window.dispatchEvent(new Event('authChanged'));
            toast.success('Perfil actualizado correctamente');
            return { ok: true };

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Error al actualizar perfil';
            toast.error(msg);
            return { ok: false, message: msg };
        }
    };

    useEffect(() => {
        // Escuchar cambios de localStorage desde otras pestañas
        const onStorage = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                rehydrateUser();
            }
        };

        // Evento personalizado para notificar cambios en la misma pestaña
        const onAuthChanged = () => rehydrateUser();

        window.addEventListener('storage', onStorage);
        window.addEventListener('authChanged', onAuthChanged);

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

// Hook para acceder al contexto
export const useAuth = () => {
    return useContext(AuthContext);
};