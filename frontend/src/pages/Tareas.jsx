import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

// IMPORTACIÓN DE SERVICIOS
import { getTareas, createTarea, updateTarea, deleteTarea } from '../services/tareasService';
import { getGrupos } from '../services/gruposService'; 
// Asegúrate de que tu entregasService tenga createEntrega y getMisEntregas
import { getEntregasByTarea, calificarEntrega, createEntrega, getMisEntregas } from '../services/entregasService';

// ==========================================
// VISTA DOCENTE
// ==========================================
const TareasVistaDocente = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const grupoFiltro = searchParams.get('grupo');

    // Estados de navegación
    const [view, setView] = useState('list'); // 'list', 'form', 'entregas'
    const [currentTask, setCurrentTask] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Estado para el archivo del docente
    const [archivo, setArchivo] = useState(null);
    // NUEVO: Estado para saber si el docente quiere borrar el archivo existente
    const [eliminarArchivo, setEliminarArchivo] = useState(false);

    // Estado del Formulario
    const initialFormState = { 
        titulo: '', 
        descripcion: '', 
        grupo: grupoFiltro || '', 
        puntuacionMaxima: 100, 
        fechaEntrega: '' 
    };
    const [formData, setFormData] = useState(initialFormState);

    // ESTADO DE DATOS REALES (Tareas y Grupos)
    const [tareas, setTareas] = useState([]);
    const [listaGrupos, setListaGrupos] = useState([]); 

    // --- ESTADO DE ENTREGAS (DATOS REALES) ---
    const [entregas, setEntregas] = useState([]); 
    const [loadingEntregas, setLoadingEntregas] = useState(false);

    // --- CARGAR DATOS INICIALES ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [tareasData, gruposData] = await Promise.all([
                getTareas(),
                getGrupos()
            ]);
            setTareas(tareasData);
            setListaGrupos(gruposData);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("Error de conexión. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtrado local
    const tareasMostradas = grupoFiltro ? tareas.filter(t => {
        const nombreGrupo = t.grupo?.nombre || t.grupo; 
        return nombreGrupo === grupoFiltro || t.grupo?._id === grupoFiltro;
    }) : tareas;

    const [searchTerm, setSearchTerm] = useState('');
    const tareasFiltradasPorBusqueda = tareasMostradas.filter(t => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const nombreGrupo = t.grupo?.nombre || t.grupo || '';
        return `${t.titulo} ${t.descripcion} ${nombreGrupo}`.toLowerCase().includes(term);
    });

    // --- LÓGICA DE SEMANAS ---
    const getWeekRangeLabel = (dateStr) => {
        if (!dateStr) return 'Sin Fecha';
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
            const dateA = new Date(a[1][0].fechaEntrega || 0);
            const dateB = new Date(b[1][0].fechaEntrega || 0);
            return dateA - dateB;
        });
    };

    const grouped = groupByWeek(tareasFiltradasPorBusqueda);
    const [selectedWeek, setSelectedWeek] = useState(null);
    
    useEffect(() => {
        if (!selectedWeek && grouped.length > 0) setSelectedWeek(grouped[0][0]);
    }, [grouped, selectedWeek]);

    const [showSidebar, setShowSidebar] = useState(true);
    const weekRefs = useRef({});

    useEffect(() => {
        if (selectedWeek && weekRefs.current[selectedWeek]) {
            weekRefs.current[selectedWeek].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedWeek]);

    // --- MANEJADORES ---
    
    const handleOpenCreate = () => { 
        setFormData(initialFormState); 
        setArchivo(null); 
        setEliminarArchivo(false); // Resetear bandera
        setCurrentTask(null); 
        setView('form'); 
    };

    const handleOpenEdit = (tarea) => {
        const grupoValue = typeof tarea.grupo === 'object' ? tarea.grupo?._id : tarea.grupo;
        let fechaFormat = '';
        if(tarea.fechaEntrega) fechaFormat = new Date(tarea.fechaEntrega).toISOString().split('T')[0];

        setFormData({
            ...tarea,
            grupo: grupoValue,
            fechaEntrega: fechaFormat
        });
        setArchivo(null); 
        setEliminarArchivo(false); // Resetear bandera al abrir edición
        setCurrentTask(tarea);
        setView('form');
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            // SIEMPRE usamos FormData para manejar archivos
            const datosEnviar = new FormData();
            datosEnviar.append('titulo', formData.titulo);
            datosEnviar.append('descripcion', formData.descripcion);
            datosEnviar.append('grupo', formData.grupo);
            datosEnviar.append('puntuacionMaxima', formData.puntuacionMaxima);
            datosEnviar.append('fechaEntrega', formData.fechaEntrega);

            // 1. Si hay un archivo NUEVO seleccionado, lo mandamos
            if (archivo) {
                datosEnviar.append('archivo', archivo);
            }

            // 2. Si es edición y el usuario marcó explícitamente "Eliminar archivo"
            if (currentTask && eliminarArchivo) {
                datosEnviar.append('eliminarArchivo', 'true');
            }

            if (currentTask) {
                await updateTarea(currentTask._id, datosEnviar);
                alert("Tarea actualizada correctamente.");
            } else {
                await createTarea(datosEnviar);
                alert("Tarea creada exitosamente.");
            }
            fetchData();
            setView('list');
        } catch (error) {
            console.error("Error guardando:", error);
            const msg = error.response?.data?.message || 'Error al guardar la tarea';
            alert(msg);
        }
    };

    const handleDelete = async (id) => { 
        if(window.confirm('¿Eliminar esta tarea permanentemente?')) {
            try {
                await deleteTarea(id);
                fetchData(); 
            } catch (error) {
                alert('No se pudo eliminar la tarea.');
            }
        } 
    };

    // Manejador para cargar entregas desde el Backend
    const handleViewSubmissions = async (tarea) => { 
        setCurrentTask(tarea); 
        setView('entregas');
        
        setLoadingEntregas(true);
        try {
            const data = await getEntregasByTarea(tarea._id); // Llamada al API
            setEntregas(data);
        } catch (error) {
            console.error("Error cargando entregas:", error);
            alert("No se pudieron cargar las entregas.");
        } finally {
            setLoadingEntregas(false);
        }
    };

    // Manejador para calificar alumno
    const handleCalificar = async (entregaId, notaActual) => {
        const nuevaNota = window.prompt("Ingresa la calificación (0-100):", notaActual || "");
        
        if (nuevaNota !== null && nuevaNota.trim() !== "") {
            const calificacionNum = Number(nuevaNota);
            if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 100) {
                return alert("Por favor ingresa un número válido entre 0 y 100");
            }

            try {
                await calificarEntrega(entregaId, { 
                    calificacion: calificacionNum, 
                    comentariosDocente: "Calificado desde panel docente" 
                });
                
                // Actualizamos visualmente la tabla
                setEntregas(prev => prev.map(e => 
                    e._id === entregaId ? { ...e, calificacion: calificacionNum, estado: 'Calificado' } : e
                ));
                alert("Calificación guardada exitosamente.");
            } catch (error) {
                console.error(error);
                alert("Error al guardar la calificación.");
            }
        }
    };

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
                            <div>
                                <label className="label-global">Título</label>
                                <input type="text" className="input-global" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ej: Examen Parcial" />
                            </div>
                            <div>
                                <label className="label-global">Grupo</label>
                                <select 
                                    className="input-global" 
                                    value={formData.grupo} 
                                    onChange={e => setFormData({...formData, grupo: e.target.value})} 
                                    required
                                >
                                    <option value="">Selecciona un grupo...</option>
                                    {listaGrupos.length > 0 ? (
                                        listaGrupos.map((g) => (
                                            <option key={g._id} value={g._id}>
                                                {g.nombre} ({g.clave})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No tienes grupos creados</option>
                                    )}
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
                            <textarea className="input-global" rows="4" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Instrucciones..."></textarea>
                        </div>
                        
                        {/* --- ZONA DE ARCHIVOS DEL DOCENTE (MODIFICADO) --- */}
                        <div style={{marginTop:15, padding:15, border:'1px dashed #ccc', borderRadius:6, background: '#f9fafb'}}>
                            <label className="label-global">📎 Material de Apoyo (Opcional)</label>
                            
                            {/* Caso 1: Hay archivo guardado y NO se ha marcado para borrar */}
                            {currentTask?.archivoUrl && !eliminarArchivo && (
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, marginBottom: 10, background: '#e0f2fe', padding: 10, borderRadius: 5}}>
                                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                                        <span style={{color:'#0284c7', fontWeight:'bold'}}>📄 Archivo actual activo</span>
                                        <a href={currentTask.archivoUrl} target="_blank" rel="noreferrer" style={{fontSize:'0.9em', textDecoration:'underline'}}>Ver/Descargar</a>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setEliminarArchivo(true)} 
                                        style={{background:'#ef4444', color:'white', border:'none', borderRadius:4, padding:'4px 10px', cursor:'pointer', fontSize:'0.8em', fontWeight:'bold'}}
                                    >
                                        ✕ Eliminar Archivo
                                    </button>
                                </div>
                            )}

                            {/* Caso 2: Se marcó para eliminar */}
                            {eliminarArchivo && (
                                <div style={{marginBottom: 10, color:'#dc2626', fontSize:'0.9em', fontStyle:'italic', padding:10, background:'#fee2e2', borderRadius:5, border:'1px solid #fca5a5'}}>
                                    ⚠️ El archivo actual será eliminado al guardar cambios. 
                                    <button type="button" onClick={() => setEliminarArchivo(false)} style={{marginLeft:10, textDecoration:'underline', background:'none', border:'none', color:'#991b1b', cursor:'pointer', fontWeight:'bold'}}>Deshacer</button>
                                </div>
                            )}

                            {/* Input siempre disponible para subir archivo (nuevo o reemplazo) */}
                            <input type="file" className="input-global" onChange={e => { setArchivo(e.target.files[0]); setEliminarArchivo(false); }} />
                            <small style={{color:'#666', display:'block', marginTop:5}}>
                                {currentTask?.archivoUrl ? 'Selecciona un archivo nuevo para REEMPLAZAR el actual.' : 'Sube un archivo (PDF, Word, etc.) para que tus alumnos lo descarguen.'}
                            </small>
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

    //VISTA ENTREGAS (CONECTADA AL BACKEND)
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
                    <div className="stat-card-global highlight">
                        <div className="stat-icon-global">📊</div>
                        <div className="stat-info-global">
                            <div className="stat-value-global">{entregas.length}</div>
                            <div className="stat-label-global">Envíos Recibidos</div>
                        </div>
                    </div>
                    <div className="stat-card-global">
                        <div className="stat-icon-global">✅</div>
                        <div className="stat-info-global">
                            <div className="stat-value-global">
                                {entregas.filter(e => e.calificacion !== null).length}
                            </div>
                            <div className="stat-label-global">Calificados</div>
                        </div>
                    </div>
                </div>

                <div className="data-container-global">
                    <div className="data-header-global"><h2 className="data-title-global">Detalle de Envíos</h2></div>
                    <div className="overflow-x-auto">
                        {loadingEntregas ? (
                            <p style={{padding: 20, textAlign: 'center'}}>Cargando entregas...</p>
                        ) : entregas.length === 0 ? (
                            <p style={{padding: 30, textAlign: 'center', color: '#888'}}>
                                No hay entregas para esta tarea aún.
                            </p>
                        ) : (
                            <table className="table-global">
                                <thead>
                                    <tr>
                                        <th>Alumno</th>
                                        <th>Estado</th>
                                        <th>Fecha Entrega</th>
                                        <th>Archivo</th>
                                        <th>Calificación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entregas.map(entrega => (
                                        <tr key={entrega._id}>
                                            <td>
                                                <div className="font-semibold text-gray-800">
                                                    {entrega.estudiante?.nombre || "Desconocido"}
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                    {entrega.estudiante?.email}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge-pill ${
                                                    entrega.estado === 'Calificado' ? 'success' : 
                                                    entrega.estado === 'Tarde' ? 'warning' : 'info'
                                                }`}>
                                                    {entrega.estado}
                                                </span>
                                            </td>
                                            <td className="text-gray-600">
                                                {new Date(entrega.fechaEntrega).toLocaleDateString()}
                                                <span style={{fontSize:'0.75em', display:'block'}}>
                                                    {new Date(entrega.fechaEntrega).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </td>
                                            <td>
                                                {entrega.archivoUrl ? (
                                                    <a 
                                                        href={entrega.archivoUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline"
                                                    >
                                                        📄 Ver Trabajo
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">Sin archivo</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="actions-row-global">
                                                    <div style={{display:'flex', alignItems:'center', gap: 10}}>
                                                        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
                                                            {entrega.calificacion !== null ? entrega.calificacion : '-'}
                                                        </span>
                                                        <button 
                                                            className="action-btn-global" 
                                                            title="Calificar"
                                                            onClick={() => handleCalificar(entrega._id, entrega.calificacion)}
                                                        >
                                                            📝
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // VISTA LISTA PRINCIPAL
    return (
        <div className="page-container" style={{display: 'flex', gap: 20, position: 'relative'}}>
            
            {!showSidebar && (
                <div style={tabStyle} role="button" onClick={() => setShowSidebar(true)} title="Abrir Semanas">
                    <div className="week-tab-circle"><span style={{fontSize:16, lineHeight:1}}>☰</span></div>
                </div>
            )}

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

            <main style={{flex:1, minWidth: 0}}>
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

                <div className="stats-row">
                    <div className="stat-card-global">
                        <div className="stat-icon-global">📋</div>
                        <div className="stat-info-global">
                            <div className="stat-value-global">{tareasMostradas.length}</div>
                            <div className="stat-label-global">Tareas Activas</div>
                        </div>
                    </div>
                </div>

                <div className="data-container-global" style={{padding: 18, borderRadius: 8}}>
                    <div className="data-header-global" style={{padding: '0 6px'}}>
                        <h2 className="data-title-global">{selectedWeek || 'Cronograma de Actividades'}</h2>
                        <div className="data-controls-global">
                            <input type="text" placeholder="Buscar tarea..." className="global-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        {loading ? <p style={{padding:20}}>Cargando datos...</p> : (
                             grouped.length > 0 ? (
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
                                                        <div style={{fontSize:'0.85rem', color:'#64748b', marginTop: 8}}>
                                                            {t.grupo?.nombre || t.grupo} • Puntos: {t.puntuacionMaxima}
                                                        </div>
                                                        <div style={{fontSize:'0.85rem', color:'#64748b', marginTop: 4}}>
                                                            Entrega: {t.fechaEntrega ? new Date(t.fechaEntrega).toLocaleDateString() : 'Sin fecha'}
                                                        </div>
                                                        
                                                        {/* MOSTRAR LINK SI TIENE ARCHIVO DEL DOCENTE */}
                                                        {t.archivoUrl && (
                                                            <div style={{marginTop:8}}>
                                                                <a href={t.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm flex items-center gap-1 font-semibold hover:underline">
                                                                    📎 Ver Material Adjunto
                                                                </a>
                                                            </div>
                                                        )}
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
                                <div style={{padding: '2rem', textAlign: 'center', color: '#999'}}>No se encontraron tareas.</div>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ==========================================
// VISTA ESTUDIANTE: Estilo Calificaciones
// ==========================================
const TareasVistaEstudiante = ({ user }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const grupoFiltro = searchParams.get('grupo');

    const [tareas, setTareas] = useState([]);
    const [misEntregas, setMisEntregas] = useState([]); // Estado para saber qué ha entregado
    const [loading, setLoading] = useState(false);

    // Cargar Tareas y Entregas del alumno
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [tareasData, entregasData] = await Promise.all([
                getTareas(), 
                getMisEntregas() // Cargamos entregas para saber el estado
            ]);
            setTareas(tareasData);
            setMisEntregas(entregasData);
        } catch (error) { 
            console.error("Error cargando tareas:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const tareasFiltradas = grupoFiltro ? tareas.filter(t => (t.grupo?.nombre || t.grupo) === grupoFiltro) : tareas;
    const [searchTerm, setSearchTerm] = useState('');
    
    const tareasFiltradasPorBusqueda = tareasFiltradas.filter(t => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const nombreGrupo = t.grupo?.nombre || t.grupo || '';
        return `${t.titulo} ${t.descripcion} ${nombreGrupo}`.toLowerCase().includes(term);
    });

    // Helper para obtener el estado de una tarea específica
    const getEstado = (tareaId) => {
        const entrega = misEntregas.find(e => (e.tarea._id || e.tarea) === tareaId);
        if (entrega) return { estado: entrega.estado, entrega };
        return { estado: 'Pendiente', entrega: null };
    };

    const getWeekRangeLabel = (dateStr) => {
        if(!dateStr) return 'Sin Fecha';
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
            const aDate = new Date(a[1][0].fechaEntrega || 0);
            const bDate = new Date(b[1][0].fechaEntrega || 0);
            return aDate - bDate;
        });
    };

    const grouped = groupByWeek(tareasFiltradasPorBusqueda);
    const [selectedWeek, setSelectedWeek] = useState(null);

    useEffect(() => {
        if (!selectedWeek && grouped.length > 0) setSelectedWeek(grouped[0][0]);
    }, [grouped, selectedWeek]);

    const [showSidebar, setShowSidebar] = useState(true);
    const weekRefs = useRef({});
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTask, setModalTask] = useState(null);
    const [modalEntrega, setModalEntrega] = useState(null);

    // Estados para SUBIR TAREA (Estudiante)
    const [archivoSubir, setArchivoSubir] = useState(null);
    const [comentarioSubir, setComentarioSubir] = useState('');
    // NUEVO: Estado para alternar entre "Ver detalles" y "Formulario de edición"
    const [isEditing, setIsEditing] = useState(false);

    const openModal = (t) => { 
        const { entrega } = getEstado(t._id);
        setModalTask(t); 
        setModalEntrega(entrega); 
        // Reset form
        setArchivoSubir(null);
        setComentarioSubir(entrega ? entrega.comentariosEstudiante : '');
        // Si ya hay entrega, no empezamos en modo edición
        setIsEditing(false); 
        setModalOpen(true); 
    };
    const closeModal = () => { setModalOpen(false); setModalTask(null); };

    // FUNCIÓN: Entregar Tarea
    const handleEntregarTarea = async (e) => {
        e.preventDefault();
        if (!archivoSubir) return alert("Debes seleccionar un archivo para entregar.");

        const formData = new FormData();
        formData.append('tareaId', modalTask._id);
        formData.append('comentariosEstudiante', comentarioSubir);
        formData.append('archivo', archivoSubir);

        try {
            await createEntrega(formData);
            alert("¡Tarea entregada con éxito!");
            cargarDatos(); // Recargar datos para ver el cambio de estado
            closeModal();
        } catch (error) {
            console.error(error);
            alert("Error al subir la tarea.");
        }
    };

    // Función para ver si la edición está bloqueada
    const isLocked = () => {
        if (!modalEntrega) return false;
        const calificada = modalEntrega.calificacion !== null && modalEntrega.calificacion !== undefined;
        const yaPaso = new Date() > new Date(modalTask.fechaEntrega);
        return calificada || yaPaso;
    };

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
                        {loading ? <p style={{padding:20}}>Cargando...</p> : (
                            grouped.map(([label, items]) => (
                                <div key={label} ref={el => (weekRefs.current[label] = el)} style={{marginBottom:16, padding:'12px 12px', borderBottom: selectedWeek===label ? '2px solid #e6eef8' : '1px solid #eee', background: selectedWeek===label ? '#fbfdff' : 'transparent', borderRadius:6}}>
                                    <h3 style={{marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span>{label}</span>
                                        <span style={{fontSize:'0.85rem', color:'#666'}}>{items.length} tarea{items.length>1?'s':''}</span>
                                    </h3>
                                    <ul style={{listStyle:'none', padding:0}}>
                                        {items.map(t => {
                                            const { estado, entrega } = getEstado(t._id);
                                            const color = estado === 'Calificado' ? 'success' : estado === 'Pendiente' ? 'warning' : 'info';

                                            return (
                                                <li key={t._id} style={{padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff'}}>
                                                    <div>
                                                        <div style={{fontWeight:700, color:'#0b3b66'}}>{t.titulo}</div>
                                                        <div style={{fontSize:'0.85rem', color:'#666'}}>
                                                            {t.grupo?.nombre || t.grupo} • Entrega: {new Date(t.fechaEntrega).toLocaleDateString()}
                                                        </div>
                                                        {t.archivoUrl && (
                                                            <a href={t.archivoUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline">
                                                                📎 Ver Material del Profe
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className={`badge-pill ${color}`} style={{marginRight:8}}>{estado}</span>
                                                        <button className="btn btn-view" onClick={() => openModal(t)}>
                                                            {entrega ? 'Ver / Editar' : 'Entregar'}
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {modalOpen && modalTask && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modalTask.titulo}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{marginBottom:12}}>
                                <strong>Grupo:</strong> {modalTask.grupo?.nombre || modalTask.grupo} • 
                                <strong>Entrega:</strong> {new Date(modalTask.fechaEntrega).toLocaleDateString()}
                            </p>
                            <div style={{marginBottom:12, padding:10, background:'#f9f9f9', borderRadius:6}}>{modalTask.descripcion}</div>
                            
                            {/* MOSTRAR ESTADO O FORMULARIO */}
                            {(!modalEntrega || isEditing) ? (
                                // MODO EDICIÓN / NUEVA ENTREGA
                                <div style={{marginTop:15, borderTop:'1px solid #eee', paddingTop:10}}>
                                    <h4 style={{marginBottom:8, fontWeight:'bold'}}>{modalEntrega ? '✏️ Editar Entrega' : '📤 Nueva Entrega'}</h4>
                                    
                                    {modalEntrega && (
                                        <div style={{fontSize:'0.85rem', color:'#d97706', marginBottom:10, background:'#fffbeb', padding:8, borderRadius:4, border:'1px solid #fcd34d'}}>
                                            ⚠️ Al subir un nuevo archivo, se <strong>reemplazará</strong> el anterior.
                                        </div>
                                    )}

                                    <form onSubmit={handleEntregarTarea}>
                                        <div style={{marginBottom:10}}>
                                            <label className="label-global">Subir Archivo (Tarea)</label>
                                            <input type="file" required className="input-global" onChange={e => setArchivoSubir(e.target.files[0])} />
                                        </div>
                                        <div style={{marginBottom:10}}>
                                            <label className="label-global">Comentarios (Opcional)</label>
                                            <textarea className="input-global" rows="2" value={comentarioSubir} onChange={e => setComentarioSubir(e.target.value)} placeholder="Escribe aquí..."></textarea>
                                        </div>
                                        <div style={{display:'flex', gap:10}}>
                                            <button type="submit" className="btn btn-create" style={{flex:1}}>
                                                {modalEntrega ? 'Guardar Cambios' : 'Enviar Tarea Ahora'}
                                            </button>
                                            {modalEntrega && (
                                                <button type="button" className="btn btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                // MODO DETALLES (Ya entregado)
                                <div style={{marginTop:15, borderTop:'1px solid #eee', paddingTop:10}}>
                                    <div className="stat-card-global" style={{padding:'15px', display:'block'}}>
                                        <div style={{marginBottom:5}}>
                                            <strong>Estado:</strong> <span className={`badge-pill ${modalEntrega.estado === 'Calificado'?'success':'info'}`}>{modalEntrega.estado}</span>
                                        </div>
                                        <div style={{marginBottom:5}}>
                                            <a href={modalEntrega.archivoUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                                                📄 Ver tu archivo enviado
                                            </a>
                                        </div>
                                        {modalEntrega.calificacion !== null && (
                                            <div style={{marginTop:10, fontSize:'1.1em', fontWeight:'bold', color:'green'}}>
                                                Calificación: {modalEntrega.calificacion} / {modalTask.puntuacionMaxima}
                                            </div>
                                        )}
                                        {modalEntrega.comentariosDocente && (
                                            <div style={{marginTop:8, fontStyle:'italic', color:'#555'}}>
                                                " {modalEntrega.comentariosDocente} "
                                            </div>
                                        )}

                                        {/* Botón EDITAR (Solo si no está bloqueada) */}
                                        {!isLocked() && (
                                            <button onClick={() => setIsEditing(true)} className="btn btn-view" style={{marginTop:15, width:'100%'}}>
                                                ✏️ Editar / Reemplazar Archivo
                                            </button>
                                        )}
                                        {isLocked() && (
                                            <p style={{color:'red', fontSize:'0.8em', marginTop:10, fontStyle:'italic'}}>
                                                * No puedes editar esta entrega (Calificada o Vencida).
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
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
    if (!user) return <div>Cargando usuario...</div>;
    return user?.rol === 'docente' ? <TareasVistaDocente /> : <TareasVistaEstudiante user={user} />;
};

export default Tareas;