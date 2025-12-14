import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Calificaciones = () => {
    const { user } = useAuth();
    const isDocente = user?.rol === 'docente';

    // Datos simulados
    const [calificaciones] = useState([
        { id: 1, estudiante: 'Juan Pérez', tarea: 'Ensayo Final', grupo: 'Matemáticas I', calificacion: 85, maxPuntos: 100, fecha: '2025-12-20' },
        { id: 2, estudiante: 'María Gómez', tarea: 'Presentación Oral', grupo: 'Historia Universal', calificacion: 92, maxPuntos: 100, fecha: '2025-12-18' },
        { id: 3, estudiante: 'Pedro López', tarea: 'Proyecto Final', grupo: 'Programación Web', calificacion: 78, maxPuntos: 100, fecha: '2025-12-15' },
    ]);

    const [misCalificaciones] = useState([
        { id: 1, tarea: 'Ensayo Final', grupo: 'Matemáticas I', calificacion: 85, maxPuntos: 100, fecha: '2025-12-20', comentario: 'Buen trabajo' },
        { id: 2, tarea: 'Presentación Oral', grupo: 'Historia Universal', calificacion: 92, maxPuntos: 100, fecha: '2025-12-18', comentario: 'Excelente presentación' },
    ]);

    const getCalificacionColor = (calificacion, maxPuntos) => {
        const porcentaje = (calificacion / maxPuntos) * 100;
        if (porcentaje >= 90) return 'excelente';
        if (porcentaje >= 80) return 'bueno';
        if (porcentaje >= 70) return 'regular';
        return 'bajo';
    };

    const getPromedio = () => {
        if (misCalificaciones.length === 0) return 0;
        const suma = misCalificaciones.reduce((acc, cal) => acc + (cal.calificacion / cal.maxPuntos) * 100, 0);
        return (suma / misCalificaciones.length).toFixed(1);
    };

    if (isDocente) {
        return (
            <div className="calificaciones-page">
                <div className="calificaciones-header">
                    <div>
                        <h1 className="calificaciones-title">📊 Gestión de Calificaciones</h1>
                        <p className="calificaciones-subtitle">Administra y revisa las calificaciones de tus estudiantes</p>
                    </div>
                    <button className="btn btn-create">
                        📄 Exportar PDF
                    </button>
                </div>

                <div className="calificaciones-stats">
                    <div className="calificaciones-stat-card">
                        <div className="calificaciones-stat-icon">📝</div>
                        <div className="calificaciones-stat-info">
                            <div className="calificaciones-stat-value">{calificaciones.length}</div>
                            <div className="calificaciones-stat-label">Calificaciones Registradas</div>
                        </div>
                    </div>
                    <div className="calificaciones-stat-card">
                        <div className="calificaciones-stat-icon">👥</div>
                        <div className="calificaciones-stat-info">
                            <div className="calificaciones-stat-value">
                                {new Set(calificaciones.map(c => c.estudiante)).size}
                            </div>
                            <div className="calificaciones-stat-label">Estudiantes Evaluados</div>
                        </div>
                    </div>
                    <div className="calificaciones-stat-card">
                        <div className="calificaciones-stat-icon">📚</div>
                        <div className="calificaciones-stat-info">
                            <div className="calificaciones-stat-value">
                                {new Set(calificaciones.map(c => c.grupo)).size}
                            </div>
                            <div className="calificaciones-stat-label">Grupos</div>
                        </div>
                    </div>
                </div>

                <div className="calificaciones-table-container">
                    <div className="calificaciones-table-header">
                        <h2 className="calificaciones-table-title">Lista de Calificaciones</h2>
                        <div className="calificaciones-table-actions">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="calificaciones-search-input"
                            />
                            <select className="calificaciones-filter-select">
                                <option value="">Todos los grupos</option>
                                <option value="Matemáticas I">Matemáticas I</option>
                                <option value="Historia Universal">Historia Universal</option>
                                <option value="Programación Web">Programación Web</option>
                            </select>
                        </div>
                    </div>

                    <div className="calificaciones-table-wrapper">
                        <table className="calificaciones-table">
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Tarea</th>
                                    <th>Grupo</th>
                                    <th>Calificación</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calificaciones.map(cal => {
                                    const colorClass = getCalificacionColor(cal.calificacion, cal.maxPuntos);
                                    return (
                                        <tr key={cal.id}>
                                            <td>
                                                <div className="calificaciones-student-info">
                                                    <div className="calificaciones-student-avatar">
                                                        {cal.estudiante.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="calificaciones-student-name">{cal.estudiante}</span>
                                                </div>
                                            </td>
                                            <td className="calificaciones-tarea">{cal.tarea}</td>
                                            <td>
                                                <span className="calificaciones-group-badge">{cal.grupo}</span>
                                            </td>
                                            <td>
                                                <div className={`calificaciones-grade ${colorClass}`}>
                                                    <span className="calificaciones-grade-value">{cal.calificacion}</span>
                                                    <span className="calificaciones-grade-max">/ {cal.maxPuntos}</span>
                                                </div>
                                            </td>
                                            <td className="calificaciones-date">{cal.fecha}</td>
                                            <td>
                                                <div className="calificaciones-actions">
                                                    <button className="calificaciones-action-btn" title="Editar">
                                                        ✏️
                                                    </button>
                                                    <button className="calificaciones-action-btn" title="Ver detalles">
                                                        👁️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Vista Estudiante
    return (
        <div className="calificaciones-page">
            <div className="calificaciones-header">
                <div>
                    <h1 className="calificaciones-title">📊 Mis Calificaciones</h1>
                    <p className="calificaciones-subtitle">Revisa tus calificaciones y progreso académico</p>
                </div>
            </div>

            <div className="calificaciones-stats">
                <div className="calificaciones-stat-card highlight">
                    <div className="calificaciones-stat-icon">⭐</div>
                    <div className="calificaciones-stat-info">
                        <div className="calificaciones-stat-value">{getPromedio()}%</div>
                        <div className="calificaciones-stat-label">Promedio General</div>
                    </div>
                </div>
                <div className="calificaciones-stat-card">
                    <div className="calificaciones-stat-icon">📝</div>
                    <div className="calificaciones-stat-info">
                        <div className="calificaciones-stat-value">{misCalificaciones.length}</div>
                        <div className="calificaciones-stat-label">Tareas Calificadas</div>
                    </div>
                </div>
            </div>

            <div className="calificaciones-table-container">
                <h2 className="calificaciones-table-title">Historial de Calificaciones</h2>

                <div className="calificaciones-table-wrapper">
                    <table className="calificaciones-table">
                        <thead>
                            <tr>
                                <th>Tarea</th>
                                <th>Grupo</th>
                                <th>Calificación</th>
                                <th>Fecha</th>
                                <th>Comentario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misCalificaciones.map(cal => {
                                const colorClass = getCalificacionColor(cal.calificacion, cal.maxPuntos);
                                return (
                                    <tr key={cal.id}>
                                        <td className="calificaciones-tarea">{cal.tarea}</td>
                                        <td>
                                            <span className="calificaciones-group-badge">{cal.grupo}</span>
                                        </td>
                                        <td>
                                            <div className={`calificaciones-grade ${colorClass}`}>
                                                <span className="calificaciones-grade-value">{cal.calificacion}</span>
                                                <span className="calificaciones-grade-max">/ {cal.maxPuntos}</span>
                                            </div>
                                        </td>
                                        <td className="calificaciones-date">{cal.fecha}</td>
                                        <td className="calificaciones-comment">{cal.comentario || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Calificaciones;
