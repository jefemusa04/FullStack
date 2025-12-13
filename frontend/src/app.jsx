// src/App.jsx (Router FINAL CONSOLIDADO)

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Componentes de Layout y Protección
import PrivateRoute from "./components/PrivateRoute"; 
import MainLayout from "./components/MainLayout"; 
import { useAuth } from './context/AuthContext'; 

// Componentes de Autenticación
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"; 

// Importar los archivos CONSOLIDADOS (Asegúrate de que existan en src/pages/)
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';
import Calificaciones from './pages/Calificaciones';

// Importaciones específicas (Alumnos solo para Docente)
import Alumnos from './pages/docente/Alumnos'; 
import Mensajes from './pages/Mensajes'; 


// -------------------------------------------------------------------
// Componente de Redirección (CORREGIDO: Solo redirige a /dashboard)
function PrivateRouteRedir() {
    const { user } = useAuth(); 
    
    // Si no está logueado, lo manda a login (aunque esto lo hace el PrivateRoute padre)
    if (!user) return <Navigate to="/login" replace />; 

    // 🛑 Redirige a la ruta genérica CONSOLIDADA
    return <Navigate to="/dashboard" replace />;
}
// -------------------------------------------------------------------


export default function App() {
  return (
    <>
      <Routes>
        {/* 1. RUTAS PÚBLICAS */}
        <Route path="/" element={<PrivateRouteRedir />} /> {/* Redirige a /dashboard si está logueado */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 2. GRUPO DE RUTAS PROTEGIDAS (Requiere Autenticación) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>

                {/* RUTAS CONSOLIDADAS: Accesibles por ambos roles si están logueados */}
                <Route path="/dashboard" element={<Dashboard />} /> 
                <Route path="/tareas" element={<Tareas />} />
                <Route path="/calificaciones" element={<Calificaciones />} />
                <Route path="/mensajes" element={<Mensajes />} /> 

                {/* RUTA ESPECÍFICA DE DOCENTE (Protección de Rol Anidada) */}
                <Route element={<PrivateRoute allowedRoles={['docente']} />}>
                    <Route path="/alumnos" element={<Alumnos />} /> 
                </Route>
                
          </Route>
        </Route>

        {/* 6. CATCH-ALL (404) */}
        <Route path="*" element={<h2 style={{ padding: 20 }}>404 - Página no encontrada</h2>} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}