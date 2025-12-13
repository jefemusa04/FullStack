import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const isDocente = user?.rol === 'docente';

    const grupos = [
        { id: 'g1', nombre: 'Matemáticas I', codigo: 'MAT101', alumnos: 25, tareasPendientes: 2 },
        { id: 'g2', nombre: 'Historia Universal', codigo: 'HIS202', alumnos: 18, tareasPendientes: 0 },
        { id: 'g3', nombre: 'Programación Web', codigo: 'WEB303', alumnos: 30, tareasPendientes: 5 },
    ];

    const getCardColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #0f6cc9 0%, #0b55a0 100%)',
            'linear-gradient(135deg, #f98012 0%, #d66e0f 100%)',
            'linear-gradient(135deg, #399b2e 0%, #2e7d25 100%)'
        ];
        return colors[index % colors.length];
    };

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
                {/* Botón opcional o vacío */}
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

            {/* Contenedor de Cursos (Mantiene el Grid pero con título estándar) */}
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
                                style={{ background: getCardColor(index) }}
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