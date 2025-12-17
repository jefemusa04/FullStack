import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGrupos, createGrupo } from '../services/gruposService';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user } = useAuth();
    const isDocente = user?.rol === 'docente';

    // Estado para manejar la navegación interna
    const [view, setView] = useState('dashboard');

    // --- ESTADO DE DATOS (AHORA REALES) ---
    const [grupos, setGrupos] = useState([]); // Inicia vacío
    const [loading, setLoading] = useState(true);

    // --- CARGAR DATOS DEL BACKEND ---
    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const data = await getGrupos();
                setGrupos(data);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar tus cursos.");
            } finally {
                setLoading(false);
            }
        };
        cargarGrupos();
    }, []);

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

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        try {
            // 1. Llamada a la API Real
            const grupoCreado = await createGrupo(newGroup);

            // 2. Actualizar la lista en pantalla sin recargar
            setGrupos([...grupos, grupoCreado]);

            // 3. Notificación de Éxito
            toast.success(
                <div>
                    <strong>¡Materia Creada!</strong>
                    <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                        El grupo <b>{grupoCreado.nombre}</b> está listo.
                    </div>
                </div>,
                { icon: "🎓" }
            );

            // 4. Limpiar y salir
            setNewGroup({ nombre: '', clave: '', descripcion: '' });
            setView('dashboard');

        } catch (error) {
            const msg = error.response?.data?.message || "Error al crear el grupo";
            toast.error(msg);
        }
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
                        <div className="form-grid-global">
                            <div>
                                <label className="label-global">Nombre del Grupo (Ej: Matemáticas V)</label>
                                <input
                                    type="text"
                                    className="input-global"
                                    value={newGroup.nombre}
                                    onChange={(e) => setNewGroup({ ...newGroup, nombre: e.target.value })}
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
                                    onChange={(e) => setNewGroup({ ...newGroup, clave: e.target.value })}
                                    placeholder="Código identificador"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label-global">Descripción (Opcional)</label>
                            <textarea
                                className="input-global"
                                rows="4"
                                value={newGroup.descripcion}
                                onChange={(e) => setNewGroup({ ...newGroup, descripcion: e.target.value })}
                                placeholder="Breve descripción del curso..."
                            ></textarea>
                        </div>

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
                        {/* Nota: El backend aún no calcula tareas pendientes, ponemos 0 por seguridad */}
                        <div className="stat-value-global">
                            {grupos.reduce((sum, g) => sum + (g.tareasPendientes || 0), 0)}
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

                {loading ? (
                    <p className="text-gray-500">Cargando cursos...</p>
                ) : grupos.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">No tienes cursos registrados.</p>
                        {isDocente && <p className="text-blue-600 text-sm">¡Crea tu primer grupo arriba!</p>}
                    </div>
                ) : (
                    <div className="courses-grid">
                        {grupos.map((grupo, index) => (
                            <Link
                                to={`/tareas?grupo=${encodeURIComponent(grupo.nombre)}`}
                                // OJO: MongoDB usa _id, no id
                                key={grupo._id}
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
                                        {/* Usamos clave en vez de codigo */}
                                        <span className="course-code">{grupo.clave}</span>
                                        <span className="course-badge">{isDocente ? 'Grupo A' : 'Inscrito'}</span>
                                    </div>
                                    <h3 className="course-title" title={grupo.nombre}>
                                        {grupo.nombre}
                                    </h3>
                                    <div className="course-info">
                                        <div className="course-meta">
                                            <span className="course-meta-icon">{isDocente ? '👨‍🎓' : '📚'}</span>
                                            <span className="course-meta-text">
                                                {/* Validamos si existe el array de alumnos */}
                                                {isDocente
                                                    ? `${grupo.estudiantes?.length || 0} Alumnos`
                                                    : (grupo.docente?.nombre || 'Profesor Titular')}
                                            </span>
                                        </div>
                                        {(grupo.tareasPendientes || 0) > 0 ? (
                                            <div className="course-alert">
                                                <span className="alert-icon">⚠️</span>
                                                <span className="alert-text">{grupo.tareasPendientes} {isDocente ? 'por calificar' : 'pendientes'}</span>
                                            </div>
                                        ) : (
                                            <div className="course-success">
                                                <span className="success-icon">✅</span>
                                                <span className="success-text">{isDocente ? 'Todo calificado' : 'Al día'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;