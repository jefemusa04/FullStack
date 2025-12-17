import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';


// VISTA DOCENTE
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
        { _id: 't2', titulo: 'Presentación Oral', descripcion: 'Video de 5 minutos.', grupo: 'Historia Universal', fechaEntrega: '2025-12-15', puntuacionMaxima: 20 },
        { _id: 't3', titulo: 'Proyecto Final', descripcion: 'Desarrollo web completo.', grupo: 'Programación Web', fechaEntrega: '2025-12-10', puntuacionMaxima: 50 },
    ]);

    // Datos Mock (Entregas)
    const [entregasMock] = useState([
        { _id: 'e1', alumno: 'Juan Pérez', fecha: '2025-12-18', estado: 'Entregado', archivo: 'ensayo.pdf', calificacion: null },
        { _id: 'e2', alumno: 'Maria Gomez', fecha: '-', estado: 'Pendiente', archivo: null, calificacion: null },
    ]);

    const tareasMostradas = grupoFiltro ? tareas.filter(t => t.grupo === grupoFiltro) : tareas;
    const [searchTerm, setSearchTerm] = useState('');
    const tareasFiltradasPorBusqueda = tareasMostradas.filter(t => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return `${t.titulo} ${t.descripcion} ${t.grupo}`.toLowerCase().includes(term);
    });

    // --- LÓGICA DE SEMANAS ---
    const getWeekRangeLabel = (dateStr) => {
        const d = new Date(dateStr);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayOfWeek = (day.getDay() + 6) % 7; 
        const monday = new Date(day);
        monday.setDate(day.getDate() - dayOfWeek);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (dt) => dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        return `${fmt(monday)} - ${fmt(sunday)}`;
    };

    const groupByWeek = (items) => {
        const map = new Map();
        items.forEach(it => {
            const label = getWeekRangeLabel(it.fechaEntrega);
            if (!map.has(label)) map.set(label, []);
            map.get(label).push(it);
        });
        return Array.from(map.entries()).sort((a, b) => {
            const aDate = new Date(a[1][0].fechaEntrega);
            const bDate = new Date(b[1][0].fechaEntrega);
            return aDate - bDate;
        });
    };

    const grouped = groupByWeek(tareasFiltradasPorBusqueda);
    const [selectedWeek, setSelectedWeek] = useState(grouped.length ? grouped[0][0] : null);
    const [showSidebar, setShowSidebar] = useState(true);
    const weekRefs = useRef({});

    // Scroll automático
    useEffect(() => {
        if (selectedWeek && weekRefs.current[selectedWeek]) {
            weekRefs.current[selectedWeek].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedWeek]);

    // --- MANEJADORES ---
    const handleOpenCreate = () => { setFormData(initialFormState); setCurrentTask(null); setView('form'); };
    const handleOpenEdit = (tarea) => { setFormData(tarea); setCurrentTask(tarea); setView('form'); };
    const handleSaveTask = (e) => {
        e.preventDefault();
        if (currentTask) {
            setTareas(tareas.map(t => (t._id === currentTask._id ? { ...formData, _id: t._id } : t)));
        } else {
            setTareas([...tareas, { ...formData, _id: Date.now().toString() }]);
        }
        setView('list');
    };
    const handleDelete = (id) => { if(window.confirm('¿Eliminar tarea?')) setTareas(tareas.filter(t => t._id !== id)); };
    const handleViewSubmissions = (tarea) => { setCurrentTask(tarea); setView('entregas'); };

    // Estilos Inline
    const tabStyle = { position: 'absolute', left: -18, top: 120, zIndex: 60, cursor: 'pointer' };
    const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' };

    // --- VISTAS RENDERIZADAS ---

    // VISTA FORMULARIO
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
                    <div className="form-header-global"><h2 className="form-title-global">Información de la Actividad</h2></div>
                    <form onSubmit={handleSaveTask}>
                        <div className="form-grid-global">
                            <div><label className="label-global">Título</label><input type="text" className="input-global" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ej: Examen Parcial" /></div>
                            <div><label className="label-global">Grupo</label><select className="input-global" value={formData.grupo} onChange={e => setFormData({...formData, grupo: e.target.value})} required><option value="">Selecciona...</option><option value="Matemáticas I">Matemáticas I</option><option value="Historia Universal">Historia Universal</option><option value="Programación Web">Programación Web</option></select></div>
                        </div>
                        <div className="form-grid-global">
                            <div><label className="label-global">Puntos Máximos</label><input type="number" className="input-global" value={formData.puntuacionMaxima} onChange={e => setFormData({...formData, puntuacionMaxima: e.target.value})} required /></div>
                            <div><label className="label-global">Fecha de Entrega</label><input type="date" className="input-global" value={formData.fechaEntrega} onChange={e => setFormData({...formData, fechaEntrega: e.target.value})} required /></div>
                        </div>
                        <div><label className="label-global">Descripción</label><textarea className="input-global" rows="4" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Instrucciones..."></textarea></div>
                        <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setView('list')} className="btn btn-cancel">Cancelar</button><button type="submit" className="btn btn-create">{currentTask ? '💾 Guardar Cambios' : '🚀 Publicar Tarea'}</button></div>
                    </form>
                </div>
            </div>
        );
    }

    // VISTA ENTREGAS
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
                <div className="stats-row">
                    <div className="stat-card-global highlight"><div className="stat-icon-global">📊</div><div className="stat-info-global"><div className="stat-value-global">{entregasMock.length}</div><div className="stat-label-global">Total Alumnos</div></div></div>
                    <div className="stat-card-global"><div className="stat-icon-global">✅</div><div className="stat-info-global"><div className="stat-value-global">{entregasMock.filter(e => e.estado === 'Entregado').length}</div><div className="stat-label-global">Entregados</div></div></div>
                </div>
                <div className="data-container-global">
                    <div className="data-header-global"><h2 className="data-title-global">Detalle de Envíos</h2></div>
                    <div className="overflow-x-auto">
                        <table className="table-global">
                            <thead><tr><th>Alumno</th><th>Estado</th><th>Fecha</th><th>Archivo</th><th>Acción</th></tr></thead>
                            <tbody>
                                {entregasMock.map(entrega => (
                                    <tr key={entrega._id}>
                                        <td><span className="font-semibold text-gray-800">{entrega.alumno}</span></td>
                                        <td><span className={`badge-pill ${entrega.estado === 'Entregado' ? 'success' : 'warning'}`}>{entrega.estado}</span></td>
                                        <td className="text-gray-600">{entrega.fecha}</td>
                                        <td>{entrega.archivo ? (<span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">📄 {entrega.archivo}</span>) : <span className="text-gray-400">-</span>}</td>
                                        <td><div className="actions-row-global"><button className="action-btn-global" title="Calificar">📝</button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA LISTA PRINCIPAL
    return (
        <div className="page-container" style={{display: 'flex', gap: 20, position: 'relative'}}>
            
            {/* Pestaña móvil del sidebar */}
            {!showSidebar && (
                <div style={tabStyle} role="button" onClick={() => setShowSidebar(true)} title="Abrir Semanas">
                    <div className="week-tab-circle"><span style={{fontSize:16, lineHeight:1}}>☰</span></div>
                </div>
            )}

            {/* SIDEBAR DE SEMANAS */}
            {showSidebar && (
                <aside className="weeks-sidebar" style={{width: 200, flexShrink: 0}}>
                    <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
                        <div>
                            <h2 className="page-title" style={{fontSize: '1.25rem'}}>🗓️ Semanas</h2>
                        </div>
                        <button onClick={() => setShowSidebar(false)} style={closeBtnStyle}>✕</button>
                    </div>
                    <div style={{marginTop:10}}>
                        <button onClick={() => setSelectedWeek(null)} className={`week-button ${!selectedWeek ? 'selected' : ''}`} style={{marginBottom:8}}>
                            <div style={{fontWeight:600}}>Todas</div>
                        </button>
                        {grouped.map(([label, items]) => (
                            <div key={label} style={{marginBottom:8}}>
                                <button onClick={() => setSelectedWeek(label)} className={`week-button ${selectedWeek===label ? 'selected' : ''}`}>
                                    <div style={{fontWeight:600}}>{label}</div>
                                    <div className="week-count">{items.length} tarea{items.length>1?'s':''}</div>
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* CONTENIDO PRINCIPAL */}
            <main style={{flex:1, minWidth: 0}}>
                {/* Header Principal */}
                <div className="page-header" style={{marginBottom: '1.5rem'}}>
                    <div>
                        <h1 className="page-title">{grupoFiltro ? `Gestión: ${grupoFiltro}` : 'Gestión de Tareas'}</h1>
                        <p className="page-subtitle">Administra actividades y evaluaciones</p>
                        
                        {grupoFiltro && (
                            <button onClick={() => setSearchParams({})} className="btn-chip">
                                ↺ Ver todas las materias
                            </button>
                        )}
                    </div>
                    <button onClick={handleOpenCreate} className="btn btn-create">➕ Crear Tarea</button>
                </div>

                {/* Stats Row */}
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

                {/* LISTA DE TAREAS AGRUPADA POR SEMANA */}
                <div className="data-container-global" style={{padding: 18, borderRadius: 8}}>
                    <div className="data-header-global" style={{padding: '0 6px'}}>
                        <h2 className="data-title-global">{selectedWeek || 'Cronograma de Actividades'}</h2>
                        <div className="data-controls-global">
                            <input type="text" placeholder="Buscar tarea..." className="global-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        {grouped.length > 0 ? (
                            grouped.map(([label, items]) => (
                                <div key={label} ref={el => (weekRefs.current[label] = el)} style={{marginBottom:16, padding:'12px 12px', borderBottom: selectedWeek===label ? '2px solid #e6eef8' : '1px solid #eee', background: selectedWeek===label ? '#fbfdff' : 'transparent', borderRadius:6}}>
                                    <h3 style={{marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', color: 'var(--color-primary)', fontWeight: 'bold'}}>
                                        <span>{label}</span>
                                        <span style={{fontSize:'0.85rem', color:'#666', fontWeight:'normal'}}>{items.length} actividades</span>
                                    </h3>
                                    <ul style={{listStyle:'none', padding:0}}>
                                        {items.map(t => (
                                            <li key={t._id} style={{padding:16, borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', gap: '1rem', flexWrap: 'wrap'}}>
                                                <div style={{flex: 1}}>
                                                    <div style={{fontWeight:700, color:'#1e293b', fontSize: '1.05rem'}}>{t.titulo}</div>
                                                    <div style={{fontSize:'0.9rem', color:'#334155', marginTop:6}} className="task-description">{t.descripcion}</div>
                                                    <div style={{fontSize:'0.85rem', color:'#64748b', marginTop: 8}}>{t.grupo} • Puntos: {t.puntuacionMaxima}</div>
                                                    <div style={{fontSize:'0.85rem', color:'#64748b', marginTop: 4}}>Entrega: {t.fechaEntrega}</div>
                                                </div>
                                                
                                                <div className="actions-row-global">
                                                    <button onClick={() => handleViewSubmissions(t)} className="action-btn-global" title="Ver Entregas">👁️</button>
                                                    <button onClick={() => handleOpenEdit(t)} className="action-btn-global" title="Editar">✏️</button>
                                                    <button onClick={() => handleDelete(t._id)} className="action-btn-global delete" title="Eliminar">🗑️</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div style={{padding: '2rem', textAlign: 'center', color: '#999'}}>No hay tareas para mostrar.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// VISTA ESTUDIANTE: Estilo Calificaciones
const TareasVistaEstudiante = ({ user }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const grupoFiltro = searchParams.get('grupo');

    // Mock de tareas
    const [tareas] = useState([
        { _id: 't1', titulo: 'Ensayo Final', grupo: 'Matemáticas I', fechaEntrega: '2025-12-20', descripcion: 'Redacta un ensayo...', entrega: { estado: 'Pendiente' } },
        { _id: 't2', titulo: 'Quiz Semanal', grupo: 'Matemáticas I', fechaEntrega: '2025-12-16', descripcion: 'Auto-evaluación...', entrega: { estado: 'Entregado' } },
        { _id: 't3', titulo: 'Proyecto Grupo', grupo: 'Programación Web', fechaEntrega: '2025-12-11', descripcion: 'Desarrolla una SPA...', entrega: { estado: 'Pendiente' } },
        { _id: 't4', titulo: 'Lectura', grupo: 'Historia Universal', fechaEntrega: '2025-12-08', descripcion: 'Lee el capítulo 4...', entrega: { estado: 'Pendiente' } },
    ]);

    const tareasFiltradas = grupoFiltro ? tareas.filter(t => t.grupo === grupoFiltro) : tareas;
    const [searchTerm, setSearchTerm] = useState('');
    const tareasFiltradasPorBusqueda = tareasFiltradas.filter(t => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return `${t.titulo} ${t.descripcion} ${t.grupo}`.toLowerCase().includes(term);
    });

    // Helpers
    const getWeekRangeLabel = (dateStr) => {
        const d = new Date(dateStr);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayOfWeek = (day.getDay() + 6) % 7; 
        const monday = new Date(day);
        monday.setDate(day.getDate() - dayOfWeek);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (dt) => dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        return `${fmt(monday)} - ${fmt(sunday)}`;
    };

    const groupByWeek = (items) => {
        const map = new Map();
        items.forEach(it => {
            const label = getWeekRangeLabel(it.fechaEntrega);
            if (!map.has(label)) map.set(label, []);
            map.get(label).push(it);
        });
        return Array.from(map.entries()).sort((a, b) => {
            const aDate = new Date(a[1][0].fechaEntrega);
            const bDate = new Date(b[1][0].fechaEntrega);
            return aDate - bDate;
        });
    };

    const grouped = groupByWeek(tareasFiltradasPorBusqueda);
    const [selectedWeek, setSelectedWeek] = useState(grouped.length ? grouped[0][0] : null);
    const [showSidebar, setShowSidebar] = useState(true);
    const weekRefs = useRef({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTask, setModalTask] = useState(null);

    const openModal = (t) => { setModalTask(t); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setModalTask(null); };

    // Estilos inline
    const tabStyle = { position: 'absolute', left: -18, top: 120, zIndex: 60, cursor: 'pointer' };
    const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' };

    useEffect(() => {
        if (selectedWeek && weekRefs.current[selectedWeek]) {
            weekRefs.current[selectedWeek].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedWeek]);

    return (
        <div className="page-container" style={{display: 'flex', gap: 20, position: 'relative'}}>
            {!showSidebar && (
                <div style={tabStyle} role="button" onClick={() => setShowSidebar(true)} title="Abrir Semanas">
                    <div className="week-tab-circle"><span style={{fontSize:16, lineHeight:1}}>☰</span></div>
                </div>
            )}

            {showSidebar && (
                <aside className="weeks-sidebar" style={{width: 200, position:'relative'}}>
                    <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div><h2 className="page-title">🗓️ Semanas</h2><p className="page-subtitle">Filtra por semana</p></div>
                        <div><button onClick={() => setShowSidebar(false)} style={closeBtnStyle}>✕</button></div>
                    </div>
                    <div style={{marginTop:10}}>
                        {grouped.map(([label, items]) => (
                            <div key={label} style={{marginBottom:8}}>
                                <button onClick={() => setSelectedWeek(label)} className={`week-button ${selectedWeek===label ? 'selected' : ''}`}>
                                    <div style={{fontWeight:600}}>{label}</div>
                                    <div className="week-count">{items.length} tarea{items.length>1?'s':''}</div>
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            <main style={{flex:1}}>
                <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <h1 className="page-title">📝 Mis Tareas</h1>
                        <p className="page-subtitle">Organizadas por semana de entrega</p>
                        
                        {grupoFiltro && (
                            <button onClick={() => setSearchParams({})} className="btn-chip">
                                ↺ Ver todas las materias
                            </button>
                        )}
                        <div style={{marginTop:8}}>
                            <input type="text" placeholder="🔍 Buscar tarea..." className="global-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="data-container-global" style={{padding: 18, borderRadius: 8}}>
                    <div className="data-header-global" style={{padding: '0 6px'}}>
                        <h2 className="data-title-global">{selectedWeek || 'Todas las semanas'}</h2>
                    </div>

                    <div>
                        {grouped.map(([label, items]) => (
                            <div key={label} ref={el => (weekRefs.current[label] = el)} style={{marginBottom:16, padding:'12px 12px', borderBottom: selectedWeek===label ? '2px solid #e6eef8' : '1px solid #eee', background: selectedWeek===label ? '#fbfdff' : 'transparent', borderRadius:6}}>
                                <h3 style={{marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span>{label}</span>
                                    <span style={{fontSize:'0.85rem', color:'#666'}}>{items.length} tarea{items.length>1?'s':''}</span>
                                </h3>
                                <ul style={{listStyle:'none', padding:0}}>
                                    {items.map(t => (
                                        <li key={t._id} style={{padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff'}}>
                                            <div>
                                                <div style={{fontWeight:700, color:'#0b3b66'}}>{t.titulo}</div>
                                                <div style={{fontSize:'0.85rem', color:'#666'}}>{t.grupo} • Entrega: {t.fechaEntrega}</div>
                                            </div>
                                            <div>
                                                <span className={`badge-pill ${t.entrega.estado==='Entregado' ? 'success' : 'warning'}`} style={{marginRight:8}}>{t.entrega.estado}</span>
                                                <button className="btn btn-view" onClick={() => openModal(t)}>Ver</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Modal de detalle de tarea */}
            {modalOpen && modalTask && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modalTask.titulo}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{marginBottom:12}}><strong>Grupo:</strong> {modalTask.grupo} • <strong>Entrega:</strong> {modalTask.fechaEntrega}</p>
                            <div style={{marginBottom:12}}>{modalTask.descripcion}</div>
                            <div style={{marginTop:12}}>
                                <h4 style={{marginBottom:8}}>Submission status</h4>
                                <div className="stat-card-global" style={{padding:'12px'}}>
                                    <div style={{fontWeight:700}}>{modalTask.entrega.estado === 'Entregado' ? 'Submitted for grading' : 'Not submitted'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


//COMPONENTE PRINCIPAL

const Tareas = () => {
    const { user } = useAuth();
    return user?.rol === 'docente' ? <TareasVistaDocente /> : <TareasVistaEstudiante user={user} />;
};

export default Tareas;