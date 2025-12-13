// src/components/Navbar.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext'; 

const Navbar = () => {
    const { user } = useAuth();
    
    // NOTA: Si usas esta Navbar, debes añadir la clase .navbar-header a tu styles.css

    return (
        <header className="navbar-header" style={{ 
            backgroundColor: '#ffffff', 
            color: '#1f2937', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center'
        }}>
            <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>
                {user?.nombre || user?.email} ({user?.rol})
            </span>
            {/* Aquí irían botones de Notificaciones o perfil si los necesitas */}
        </header>
    );
};

export default Navbar;