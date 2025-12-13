// src/components/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const isDocente = user.rol === 'docente';

    // Iconos para cada menú
    const docenteLinks = [
        { name: 'Alumnos', path: '/alumnos', icon: '👨‍🎓' },
        { name: 'Tareas', path: '/tareas', icon: '📝' },
        { name: 'Calificaciones', path: '/calificaciones', icon: '📊' },
    ];

    const estudianteLinks = [
        { name: 'Tareas Asignadas', path: '/tareas', icon: '📝' },
        { name: 'Mis Calificaciones', path: '/calificaciones', icon: '📊' },
    ];

    const menuItems = isDocente ? docenteLinks : estudianteLinks;
    const platformName = isDocente ? 'Docente' : 'Estudiante';

    // Función para verificar si una ruta está activa
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar"> 
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="sidebar-logo-icon">🎓</span>
                    <div className="sidebar-logo-text">
                        <div className="sidebar-logo-title">Gestión Escolar</div>
                        <div className="sidebar-logo-subtitle">{platformName}</div>
                    </div>
                </div>
            </div>
            
            <nav className="sidebar-nav">
                <Link 
                    to="/dashboard" 
                    className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                    <span className="sidebar-icon">🏠</span>
                    <span>Dashboard</span>
                </Link>
                
                {menuItems.map(item => (
                    <Link 
                        key={item.name} 
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
                
                <Link 
                    to="/mensajes" 
                    className={`sidebar-link ${isActive('/mensajes') ? 'active' : ''}`}
                >
                    <span className="sidebar-icon">💬</span>
                    <span>Mensajes</span>
                </Link>
            </nav>
            
            <div className="sidebar-footer">
                <div className="sidebar-user-info">
                    <div className="sidebar-user-avatar">
                        {user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="sidebar-user-details">
                        <div className="sidebar-user-name">{user?.nombre || user?.email}</div>
                        <div className="sidebar-user-role">{user?.rol}</div>
                    </div>
                </div>
                <button onClick={logout} className="sidebar-logout">
                    <span className="sidebar-icon">🚪</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;