import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; 

const Dashboard = () => {
    const { user } = useAuth();
    const isDocente = user?.rol === 'docente';

    // Estado para manejar la navegación interna
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'create-group'

    // Datos iniciales simulados
    const [grupos, setGrupos] = useState([
        { id: 'g1', nombre: 'Matemáticas I', codigo: 'MAT101', alumnos: 25, tareasPendientes: 2 },
        { id: 'g2', nombre: 'Historia Universal', codigo: 'HIS202', alumnos: 18, tareasPendientes: 0 },
        { id: 'g3', nombre: 'Programación Web', codigo: 'WEB303', alumnos: 30, tareasPendientes: 5 },
    ]);

    // Estado del Formulario
    const [newGroup, setNewGroup] = useState({
        nombre: '',
        clave: '',
        descripcion: ''
    });

    // --- MANEJADORES ---

    const handleCardColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #0f6cc9 0%, #0b55a0 100%)',
            'linear-gradient(135deg, #f98012 0%, #d66e0f 100%)',
            'linear-gradient(135deg, #399b2e 0%, #2e7d25 100%)'
        ];
        return colors[index % colors.length];
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        
        // Simulación de guardado
        const nuevo = {
            id: Date.now().toString(),
            nombre: newGroup.nombre,
            codigo: newGroup.clave,
            alumnos: 0,
            tareasPendientes: 0
        };
        
        setGrupos([...grupos, nuevo]);
        
        // --- MENSAJE BONITO (TOAST) ---
        toast.success(
            <div>
                <strong>¡Materia Creada!</strong>
                <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                    El grupo <b>{newGroup.nombre}</b> se ha registrado correctamente.
                </div>
            </div>,
            {
                icon: "🎓" // Icono personalizado
            }
        );

        setNewGroup({ nombre: '', clave: '', descripcion: '' }); // Limpiar formulario
        setView('dashboard'); // Volver al inicio
    };

    // --- VISTA: FORMULARIO DE CREAR GRUPO (Solo Docente) ---
    if (view === 'create-group' && isDocente) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">➕ Crear Nuevo Grupo</h1>
                        <p className="page-subtitle">Da de alta una nueva materia o grupo para tus alumnos.</p>
                    </div>
                    <button onClick={() => setView('dashboard')} className="btn btn-cancel">
                        ← Volver al Dashboard
                    </button>
                </div>

                <div className="form-container-global">
                    <div className="form-header-global">
                        <h2 className="form-title-global">Datos del Grupo</h2>
                    </div>
                    <form onSubmit={handleCreateGroup}>
                        {/* Fila 1: Nombre y Clave */}
                        <div className="form-grid-global">
                            <div>
                                <label className="label-global">Nombre del Grupo (Ej: Matemáticas V)</label>
                                <input 
                                    type="text" 
                                    className="input-global" 
                                    value={newGroup.nombre}
                                    onChange={(e) => setNewGroup({...newGroup, nombre: e.target.value})}
                                    placeholder="Nombre de la materia"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-global">Clave Única (Ej: MAT501-A)</label>
                                <input 
                                    type="text" 
                                    className="input-global" 
                                    value={newGroup.clave}
                                    onChange={(e) => setNewGroup({...newGroup, clave: e.target.value})}
                                    placeholder="Código identificador"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fila 2: Descripción */}
                        <div>
                            <label className="label-global">Descripción (Opcional)</label>
                            <textarea 
                                className="input-global" 
                                rows="4" 
                                value={newGroup.descripcion}
                                onChange={(e) => setNewGroup({...newGroup, descripcion: e.target.value})}
                                placeholder="Breve descripción del curso..."
                            ></textarea>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setView('dashboard')} className="btn btn-cancel">
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-create">
                                + Crear Grupo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // --- VISTA: DASHBOARD PRINCIPAL ---
    return (
        <div className="page-container">
            {/* Header Estándar */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {isDocente ? `👋 Bienvenido, ${user?.nombre}` : `👋 Hola, ${user?.nombre}`}
                    </h1>
                    <p className="page-subtitle">
                        {isDocente ? 'Panel de control docente' : 'Panel de control estudiantil'}
                    </p>
                </div>
                
                {/* Botón para crear materia (Solo visible para docentes) */}
                {isDocente && (
                    <button onClick={() => setView('create-group')} className="btn btn-create">
                        ➕ Agregar Materia
                    </button>
                )}
            </div>

            {/* Stats Row Estándar */}
            <div className="stats-row">
                <div className="stat-card-global">
                    <div className="stat-icon-global">📚</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{grupos.length}</div>
                        <div className="stat-label-global">Cursos Activos</div>
                    </div>
                </div>
                <div className="stat-card-global">
                    <div className="stat-icon-global">📝</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">
                            {grupos.reduce((sum, g) => sum + g.tareasPendientes, 0)}
                        </div>
                        <div className="stat-label-global">Tareas Pendientes</div>
                    </div>
                </div>
                <div className="stat-card-global highlight">
                    <div className="stat-icon-global">📅</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">Hoy</div>
                        <div className="stat-label-global">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Contenedor de Cursos */}
            <div className="mb-8">
                <h2 className="data-title-global mb-4 flex items-center gap-2">
                    <span className="text-xl">📖</span> Cursos Recientes
                </h2>
                
                <div className="courses-grid">
                    {grupos.map((grupo, index) => (
                        <Link 
                            to={`/tareas?grupo=${encodeURIComponent(grupo.nombre)}`}
                            key={grupo.id} 
                            className="course-card" 
                            style={{ textDecoration: 'none' }}
                        >
                            <div 
                                className="course-image-pattern" 
                                style={{ background: handleCardColor(index) }}
                            >
                                <div className="course-overlay"></div>
                            </div>
                            <div className="course-content">
                                <div className="course-category">
                                    <span className="course-code">{grupo.codigo}</span>
                                    <span className="course-badge">{isDocente ? 'Grupo A' : 'Inscrito'}</span>
                                </div>
                                <h3 className="course-title" title={grupo.nombre}>
                                    {grupo.nombre}
                                </h3>
                                <div className="course-info">
                                    <div className="course-meta">
                                        <span className="course-meta-icon">{isDocente ? '👨‍🎓' : '📚'}</span>
                                        <span className="course-meta-text">
                                            {isDocente ? `${grupo.alumnos} Alumnos` : 'Prof. Ing. Juan Pérez'}
                                        </span>
                                    </div>
                                    {grupo.tareasPendientes > 0 ? (
                                        <div className="course-alert">
                                            <span className="alert-icon">⚠️</span>
                                            <span className="alert-text">{grupo.tareasPendientes} tareas pendientes</span>
                                        </div>
                                    ) : (
                                        <div className="course-success">
                                            <span className="success-icon">✅</span>
                                            <span className="success-text">Al día</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;