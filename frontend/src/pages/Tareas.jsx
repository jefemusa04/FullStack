import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

// ==============================================================================
// 👨‍🏫 VISTA DOCENTE: Estilo Unificado (Calificaciones) + Funcionalidad
// ==============================================================================
const TareasVistaDocente = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const grupoFiltro = searchParams.get('grupo');

    // Estados de navegación
    const [view, setView] = useState('list'); // 'list', 'form', 'entregas'
    const [currentTask, setCurrentTask] = useState(null);

    // Estado del Formulario
    const initialFormState = { 
        titulo: '', 
        descripcion: '', 
        grupo: grupoFiltro || '', 
        puntuacionMaxima: 100, 
        fechaEntrega: '' 
    };
    const [formData, setFormData] = useState(initialFormState);

    // Datos Mock (Tareas)
    const [tareas, setTareas] = useState([
        { _id: 't1', titulo: 'Ensayo Final', descripcion: 'Escribir sobre la Rev. Industrial.', grupo: 'Matemáticas I', fechaEntrega: '2025-12-20', puntuacionMaxima: 100 },
        { _id: 't2', titulo: 'Presentación Oral', descripcion: 'Video de 5 minutos.', grupo: 'Historia Universal', fechaEntrega: '2025-12-15', puntuacionMaxima: 20 }
    ]);

    // Datos Mock (Entregas)
    const [entregasMock] = useState([
        { _id: 'e1', alumno: 'Juan Pérez', fecha: '2025-12-18', estado: 'Entregado', archivo: 'ensayo.pdf', calificacion: null },
        { _id: 'e2', alumno: 'Maria Gomez', fecha: '-', estado: 'Pendiente', archivo: null, calificacion: null },
    ]);

    const tareasMostradas = grupoFiltro ? tareas.filter(t => t.grupo === grupoFiltro) : tareas;

    // --- MANEJADORES ---
    const handleOpenCreate = () => {
        setFormData(initialFormState);
        setCurrentTask(null);
        setView('form');
    };

    const handleOpenEdit = (tarea) => {
        setFormData(tarea);
        setCurrentTask(tarea);
        setView('form');
    };

    const handleSaveTask = (e) => {
        e.preventDefault();
        if (currentTask) {
            setTareas(tareas.map(t => (t._id === currentTask._id ? { ...formData, _id: t._id } : t)));
        } else {
            setTareas([...tareas, { ...formData, _id: Date.now().toString() }]);
        }
        setView('list');
    };

    const handleDelete = (id) => {
        if(window.confirm('¿Eliminar tarea?')) setTareas(tareas.filter(t => t._id !== id));
    };

    const handleViewSubmissions = (tarea) => {
        setCurrentTask(tarea);
        setView('entregas');
    };

    // --- VISTAS RENDERIZADAS ---

    // 1. VISTA FORMULARIO (Crear/Editar) - Usando estilo unificado y limpio
    if (view === 'form') {
        return (
            <div className="page-container">
                 <div className="page-header">
                    <div>
                        <h1 className="page-title">{currentTask ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}</h1>
                        <p className="page-subtitle">Define los detalles de la actividad.</p>
                    </div>
                    <button onClick={() => setView('list')} className="btn btn-cancel">← Volver al listado</button>
                </div>

                <div className="form-container-global">
                    <div className="form-header-global">
                        <h2 className="form-title-global">Información de la Actividad</h2>
                    </div>
                    <form onSubmit={handleSaveTask}>
                        <div className="form-grid-global">
                            <div>
                                <label className="label-global">Título</label>
                                <input type="text" className="input-global" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ej: Examen Parcial" />
                            </div>
                            <div>
                                <label className="label-global">Grupo</label>
                                <select className="input-global" value={formData.grupo} onChange={e => setFormData({...formData, grupo: e.target.value})} required>
                                    <option value="">Selecciona...</option>
                                    <option value="Matemáticas I">Matemáticas I</option>
                                    <option value="Historia Universal">Historia Universal</option>
                                    <option value="Programación Web">Programación Web</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid-global">
                            <div>
                                <label className="label-global">Puntos Máximos</label>
                                <input type="number" className="input-global" value={formData.puntuacionMaxima} onChange={e => setFormData({...formData, puntuacionMaxima: e.target.value})} required />
                            </div>
                            <div>
                                <label className="label-global">Fecha de Entrega</label>
                                <input type="date" className="input-global" value={formData.fechaEntrega} onChange={e => setFormData({...formData, fechaEntrega: e.target.value})} required />
                            </div>
                        </div>

                        <div>
                            <label className="label-global">Descripción</label>
                            <textarea className="input-global" rows="4" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Instrucciones para el alumno..."></textarea>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setView('list')} className="btn btn-cancel">Cancelar</button>
                            <button type="submit" className="btn btn-create">{currentTask ? '💾 Guardar Cambios' : '🚀 Publicar Tarea'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // 2. VISTA ENTREGAS (Submissions) - Estilo Tabla Calificaciones
    if (view === 'entregas') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">📥 Entregas: {currentTask?.titulo}</h1>
                        <p className="page-subtitle">Revisa los trabajos enviados por los alumnos</p>
                    </div>
                    <button onClick={() => setView('list')} className="btn btn-back">← Volver a Tareas</button>
                </div>

                {/* Stats Row de Entregas */}
                <div className="stats-row">
                    <div className="stat-card-global highlight">
                        <div className="stat-icon-global">📊</div>
                        <div className="stat-info-global">
                            <div className="stat-value-global">{entregasMock.length}</div>
                            <div className="stat-label-global">Total Alumnos</div>
                        </div>
                    </div>
                    <div className="stat-card-global">
                        <div className="stat-icon-global">✅</div>
                        <div className="stat-info-global">
                            <div className="stat-value-global">{entregasMock.filter(e => e.estado === 'Entregado').length}</div>
                            <div className="stat-label-global">Entregados</div>
                        </div>
                    </div>
                </div>

                <div className="data-container-global">
                    <div className="data-header-global">
                        <h2 className="data-title-global">Detalle de Envíos</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-global">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Archivo</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entregasMock.map(entrega => (
                                    <tr key={entrega._id}>
                                        <td>
                                            <span className="font-semibold text-gray-800">{entrega.alumno}</span>
                                        </td>
                                        <td>
                                            <span className={`badge-pill ${entrega.estado === 'Entregado' ? 'success' : 'warning'}`}>
                                                {entrega.estado}
                                            </span>
                                        </td>
                                        <td className="text-gray-600">{entrega.fecha}</td>
                                        <td>
                                            {entrega.archivo ? (
                                                <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                                                    📄 {entrega.archivo}
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td>
                                            <div className="actions-row-global">
                                                <button className="action-btn-global" title="Calificar">📝</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // 3. VISTA LISTA PRINCIPAL (Default)
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{grupoFiltro ? `Gestión: ${grupoFiltro}` : 'Gestión de Tareas'}</h1>
                    <p className="page-subtitle">Administra actividades y evaluaciones</p>
                    {grupoFiltro && <button onClick={() => setSearchParams({})} className="text-blue-600 text-sm hover:underline">Ver todo</button>}
                </div>
                <button onClick={handleOpenCreate} className="btn btn-create">➕ Crear Tarea</button>
            </div>

            <div className="stats-row">
                <div className="stat-card-global">
                    <div className="stat-icon-global">📋</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{tareasMostradas.length}</div>
                        <div className="stat-label-global">Tareas Activas</div>
                    </div>
                </div>
                <div className="stat-card-global">
                    <div className="stat-icon-global">⏳</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">3</div>
                        <div className="stat-label-global">Por Vencer</div>
                    </div>
                </div>
            </div>

            <div className="data-container-global">
                <div className="data-header-global">
                    <h2 className="data-title-global">Actividades Asignadas</h2>
                    <div className="data-controls-global">
                        <input type="text" placeholder="Buscar tarea..." className="global-search-input" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="table-global">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Grupo</th>
                                <th>Puntos</th>
                                <th>Vencimiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareasMostradas.map(tarea => (
                                <tr key={tarea._id}>
                                    <td>
                                        <div className="font-semibold text-blue-900">{tarea.titulo}</div>
                                        <div className="text-xs text-gray-500">{tarea.descripcion}</div>
                                    </td>
                                    <td><span className="badge-pill blue">{tarea.grupo}</span></td>
                                    <td className="font-bold text-gray-700">{tarea.puntuacionMaxima} pts</td>
                                    <td>
                                        <div className="text-gray-700">{tarea.fechaEntrega}</div>
                                    </td>
                                    <td>
                                        {/* CLASE CLAVE: actions-row-global para alinear horizontalmente */}
                                        <div className="actions-row-global">
                                            <button onClick={() => handleViewSubmissions(tarea)} className="action-btn-global" title="Ver Entregas">👁️</button>
                                            <button onClick={() => handleOpenEdit(tarea)} className="action-btn-global" title="Editar">✏️</button>
                                            <button onClick={() => handleDelete(tarea._id)} className="action-btn-global delete" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==============================================================================
// 👨‍🎓 VISTA ESTUDIANTE: Estilo Calificaciones
// ==============================================================================
const TareasVistaEstudiante = ({ user }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const grupoFiltro = searchParams.get('grupo');
    const [tareas] = useState([
        { _id: 't1', titulo: 'Ensayo Final', grupo: 'Matemáticas I', fechaEntrega: '2025-12-20', entrega: { estado: 'Pendiente' } }
    ]);
    const tareasMostradas = grupoFiltro ? tareas.filter(t => t.grupo === grupoFiltro) : tareas;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📝 Mis Tareas</h1>
                    <p className="page-subtitle">Sube tus actividades pendientes</p>
                </div>
            </div>
            
            <div className="stats-row">
                 <div className="stat-card-global">
                    <div className="stat-icon-global">📚</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{tareasMostradas.length}</div>
                        <div className="stat-label-global">Asignadas</div>
                    </div>
                </div>
            </div>

            <div className="data-container-global">
                <div className="data-header-global">
                    <h2 className="data-title-global">Pendientes</h2>
                </div>
                <table className="table-global">
                    <thead>
                        <tr>
                            <th>Tarea</th>
                            <th>Grupo</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tareasMostradas.map(t => (
                            <tr key={t._id}>
                                <td className="font-semibold text-blue-900">{t.titulo}</td>
                                <td><span className="badge-pill blue">{t.grupo}</span></td>
                                <td><span className="badge-pill warning">{t.entrega.estado}</span></td>
                                <td>
                                    <div className="actions-row-global">
                                        <button className="btn btn-view" style={{fontSize:'0.8rem'}}>Ver</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==============================================================================
// 🧭 COMPONENTE PRINCIPAL
// ==============================================================================
const Tareas = () => {
    const { user } = useAuth();
    return user?.rol === 'docente' ? <TareasVistaDocente /> : <TareasVistaEstudiante user={user} />;
};

export default Tareas;