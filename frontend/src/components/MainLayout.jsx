import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Layout principal para rutas protegidas. 
 * Incluye Sidebar y la estructura principal de contenido.
 */
function MainLayout() {
    return (
        // Utilizamos la clase global del contenedor de la aplicación
        <div className="app-container"> 
            
            {/* Sidebar (cambia según el rol del usuario) */}
            <Sidebar /> 
            
            {/* Contenedor principal del contenido */}
            <div className="main-content"> {/* Ya contiene flex:1 y overflow-hidden */}
                {/* Navbar (Si decides implementarla) */}
                {/* <Navbar /> */} 
                
                {/* El Outlet renderiza las páginas específicas de cada ruta */}
                <main className="main-content-inner">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;