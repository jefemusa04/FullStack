import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { toast } from 'react-toastify';

const Sidebar = () => {
    const { user, logout, updateProfile } = useAuth();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ nombre: '', password: '' });

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

    const openEdit = () => {
        setEditForm({ nombre: user?.nombre || '', password: '', confirm: '' });
        setShowDropdown(false);
        setShowEditModal(true);
    };

    const closeEdit = () => setShowEditModal(false);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        // Validaciones seguras en cliente
        if (!editForm.nombre) return toast.error('El nombre no puede estar vacío');
        if (editForm.password) {
            if (editForm.password.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
            if (editForm.password !== editForm.confirm) return toast.error('Las contraseñas no coinciden');
        }

        if (typeof updateProfile === 'function') {
            // updateProfile no guarda la contraseña en localStorage; asume backend si existe
            await updateProfile({ nombre: editForm.nombre, password: editForm.password || undefined });
        }
        setShowEditModal(false);
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
                        <div className="sidebar-user-avatar">{user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</div>
                    </div>

                    {showDropdown && (
                        <div className="topbar-dropdown" style={{ position: 'absolute', right: 0, marginTop: 8, background: 'white', color: '#111827', borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.08)', overflow: 'hidden' }}>
                            <button className="btn" onClick={openEdit} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left' }}>Editar cuenta</button>
                            <button className="btn btn-cancel" onClick={() => { setShowDropdown(false); logout(); }} style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left' }}>Salir</button>
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Editar Cuenta</h3>
                            <button className="modal-close" onClick={closeEdit}>✖</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditSubmit}>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    <label>Nombre</label>
                                    <input className="form-input" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                                    <label>Nueva contraseña (opcional)</label>
                                    <input type="password" className="form-input" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                                    <label>Confirmar contraseña</label>
                                    <input type="password" className="form-input" value={editForm.confirm} onChange={e => setEditForm({...editForm, confirm: e.target.value})} />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        <button type="button" className="btn btn-cancel" onClick={closeEdit}>Cancelar</button>
                                        <button type="submit" className="btn btn-create">Guardar</button>
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