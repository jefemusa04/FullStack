import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Sidebar = () => {
    const { user, logout, updateProfile } = useAuth();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Solo guardamos el nombre en el estado, ya no la contraseña
    const [editForm, setEditForm] = useState({ nombre: '' });

    if (!user) return null;

    const isDocente = user.rol === 'docente';

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

    const isActive = (path) => location.pathname === path;

    const toggleDropdown = () => setShowDropdown(s => !s);

    // Lógica para obtener la inicial del avatar (reutilizable)
    const getAvatarChar = () => user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

    const openEdit = () => {
        setEditForm({ nombre: user?.nombre || '' });
        setShowDropdown(false);
        setShowEditModal(true);
    };

    const closeEdit = () => setShowEditModal(false);

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editForm.nombre.trim()) return toast.error('El nombre no puede estar vacío');

        if (typeof updateProfile === 'function') {
            // Solo enviamos el nombre para actualizar
            await updateProfile({ nombre: editForm.nombre });
        }
        setShowEditModal(false);
    };

    // Estilos inline para los items del menú desplegable para que no se vean aplastados
    const dropdownItemStyle = {
        display: 'block',
        width: '100%',
        padding: '12px 20px', // Más espacio vertical y horizontal
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#374151',
        fontSize: '0.95rem',
        transition: 'background 0.2s'
    };

    // Agrega esta función dentro de tu componente Sidebar (antes del return)
    const handlePasswordResetRequest = () => {
        // Aquí es donde conectarías con tu backend real
        setShowEditModal(false); // Cerramos el modal
        toast.info(`📧 Se ha enviado un enlace de recuperación a ${user.email}`);
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="topbar-logo">
                    <span className="sidebar-logo-icon">🎓</span>
                    <div className="sidebar-logo-text">
                        <div className="sidebar-logo-title">Gestión Escolar</div>
                    </div>
                </div>
            </div>

            <nav className="topbar-nav">
                <Link to="/dashboard" className={`topbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    <span className="topbar-icon">🏠</span>
                    <span>Dashboard</span>
                </Link>

                {menuItems.map(item => (
                    <Link key={item.name} to={item.path} className={`topbar-link ${isActive(item.path) ? 'active' : ''}`}>
                        <span className="topbar-icon">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}

                <Link to="/mensajes" className={`topbar-link ${isActive('/mensajes') ? 'active' : ''}`}>
                    <span className="topbar-icon">💬</span>
                    <span>Mensajes</span>
                </Link>
            </nav>

            <div className="topbar-right">
                <div className="topbar-user-area" style={{ position: 'relative' }}>
                    <div className="topbar-user-info" onClick={toggleDropdown} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div className="sidebar-user-name">{user?.nombre || user?.email}</div>
                            <div className="sidebar-user-role">{user?.rol}</div>
                        </div>
                        <div className="sidebar-user-avatar">{getAvatarChar()}</div>
                    </div>

                    {showDropdown && (
                        <div className="topbar-dropdown" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: 8,
                            background: 'white',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            minWidth: '180px', // Ancho mínimo para que no se vea estrecho
                            zIndex: 100
                        }}>
                            <button
                                style={dropdownItemStyle}
                                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                onClick={openEdit}
                            >
                                ⚙️ Editar cuenta
                            </button>
                            <button
                                style={{ ...dropdownItemStyle, color: '#ef4444' }} // Color rojo suave para salir
                                onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                onClick={() => { setShowDropdown(false); logout(); }}
                            >
                                🚪 Salir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Mi Perfil</h3>
                            <button className="modal-close" onClick={closeEdit}>✖</button>
                        </div>
                        <div className="modal-body">

                            {/* --- AVATAR GRANDE EN EL CENTRO --- */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div className="sidebar-user-avatar" style={{
                                    width: '80px',
                                    height: '80px',
                                    fontSize: '2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getAvatarChar()}
                                </div>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div style={{ display: 'grid', gap: 15 }}>

                                    {/* CAMPO: NOMBRE */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Nombre Completo</label>
                                        <input
                                            className="form-input"
                                            value={editForm.nombre}
                                            onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                        />
                                    </div>

                                    {/* CAMPO: CORREO (SOLO LECTURA) */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Correo Electrónico</label>
                                        <input
                                            className="form-input"
                                            value={user?.email || ''}
                                            disabled
                                            style={{ backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed', marginBottom: '10px' }}
                                        />

                                        {/* --- NUEVO BOTÓN PARA SOLICITAR EL CAMBIO --- */}
                                        <div style={{
                                            background: '#eff6ff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #bfdbfe'
                                        }}>
                                            <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: '0 0 10px 0' }}>
                                                ¿Necesitas cambiar tu contraseña?
                                            </p>
                                            <button
                                                type="button" // Importante que sea type="button" para no enviar el formulario de nombre
                                                onClick={handlePasswordResetRequest}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #3b82f6',
                                                    color: '#2563eb',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    width: '100%'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#eff6ff'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                ✉️ Enviar enlace de restablecimiento
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                        <button type="button" className="btn btn-cancel" onClick={closeEdit}>Cancelar</button>
                                        <button type="submit" className="btn btn-create">Guardar Cambios</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Sidebar;