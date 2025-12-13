// src/App.jsx (Router FINAL CONSOLIDADO y CORREGIDO)

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Componentes de Layout y Protección
import PrivateRoute from "./components/PrivateRoute"; // Verifica Auth y Rol
import MainLayout from "./components/MainLayout"; // Contiene Sidebar y Navbar
import { useAuth } from './context/AuthContext'; // Hook para acceder al usuario

// Componentes de Autenticación
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"; 

// Importar los archivos CONSOLIDADOS (Deben estar en src/pages/)
import Dashboard from './pages/Dashboard'; // Consolidado Docente/Estudiante
import Tareas from './pages/Tareas';       // Consolidado Docente/Estudiante
import Calificaciones from './pages/Calificaciones'; // Consolidado Docente/Estudiante

// Importaciones específicas y compartidas
import Alumnos from './pages/docente/Alumnos'; // Solo para Docente
import Mensajes from './pages/Mensajes'; // Compartido

// -------------------------------------------------------------------
// Componente de Redirección (Maneja la ruta raíz "/")
function PrivateRouteRedir() {
    const { user } = useAuth(); 
    
    // Si está logueado, lo manda al dashboard principal (/dashboard)
    if (user) return <Navigate to="/dashboard" replace />;
    
    // Si no está logueado, lo manda a login (/login)
    return <Navigate to="/login" replace />;
}
// -------------------------------------------------------------------


export default function App() {
  return (
    <>
      <Routes>
        {/* 1. RUTAS PÚBLICAS */}
        <Route path="/" element={<PrivateRouteRedir />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 2. GRUPO DE RUTAS PROTEGIDAS (Todas usan PrivateRoute y MainLayout) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>

                {/* RUTAS PRINCIPALES CONSOLIDADAS Y COMPARTIDAS */}
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