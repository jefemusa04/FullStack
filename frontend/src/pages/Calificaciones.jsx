import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTareas } from '../services/tareasService';
import { getEntregasByTarea, calificarEntrega, getMisEntregas } from '../services/entregasService'; 
// Importamos jsPDF y autoTable para generación de reportes PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Calificaciones = () => {
    const { user } = useAuth();
    const isDocente = user?.rol === 'docente';

    // Estados de Datos Reales
    const [datosTabla, setDatosTabla] = useState([]); // Array unificado para la tabla
    const [loading, setLoading] = useState(false);
    
    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [listaGrupos, setListaGrupos] = useState([]); // Para llenar el select de filtros

    // Estados Modal Edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    // ==========================================
    // CARGA DE DATOS
    // ==========================================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isDocente) {
                    // 1. DOCENTE: Estrategia de "Barrido"
                    // Traemos todas las tareas creadas por el docente
                    const tareas = await getTareas();
                    
                    // Extraemos los grupos únicos para el filtro
                    const gruposUnicos = [...new Set(tareas.map(t => t.grupo?.nombre || 'Sin Grupo'))];
                    setListaGrupos(gruposUnicos);

                    // Para cada tarea, traemos sus entregas
                    // Promise.all para hacerlo paralelo y rápido
                    const promesasEntregas = tareas.map(t => getEntregasByTarea(t._id));
                    const resultadosEntregas = await Promise.all(promesasEntregas);

                    // Aplanamos y formateamos los datos para la tabla
                    let filas = [];
                    tareas.forEach((tarea, index) => {
                        const entregasDeTarea = resultadosEntregas[index]; // Array de entregas
                        
                        // Por cada entrega real, creamos una fila
                        entregasDeTarea.forEach(entrega => {
                            filas.push({
                                id: entrega._id, // ID de la entrega (para calificar)
                                estudiante: entrega.estudiante?.nombre || 'Desconocido',
                                email: entrega.estudiante?.email,
                                tarea: tarea.titulo,
                                grupo: tarea.grupo?.nombre || 'Sin Grupo',
                                calificacion: entrega.calificacion || 0,
                                maxPuntos: tarea.puntuacionMaxima,
                                fecha: entrega.fechaEntrega ? new Date(entrega.fechaEntrega).toLocaleDateString() : '-',
                                comentario: entrega.comentariosDocente || '',
                                estado: entrega.estado
                            });
                        });
                    });
                    setDatosTabla(filas);

                } else {
                    // 2. ESTUDIANTE: Carga directa
                    // Requiere que implementes 'getMisEntregas' en el backend/service
                    const misEntregas = await getMisEntregas(); 
                    
                    const filas = misEntregas.map(e => ({
                        id: e._id,
                        tarea: e.tarea?.titulo || 'Tarea',
                        grupo: e.tarea?.grupo?.nombre || 'Grupo',
                        calificacion: e.calificacion || 0,
                        maxPuntos: e.tarea?.puntuacionMaxima || 100,
                        fecha: new Date(e.fechaEntrega).toLocaleDateString(),
                        comentario: e.comentariosDocente || '',
                        estado: e.estado
                    }));
                    setDatosTabla(filas);
                }
            } catch (error) {
                console.error("Error cargando calificaciones:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, isDocente]);

    // ==========================================
    // LÓGICA DE FILTROS
    // ==========================================
    const filteredCalificaciones = datosTabla.filter(c => {
        const term = searchTerm.trim().toLowerCase();
        // Filtro de Grupo
        if (groupFilter && c.grupo !== groupFilter) return false;
        // Búsqueda General
        if (!term) return true;
        return [c.estudiante, c.tarea, c.grupo].join(' ').toLowerCase().includes(term);
    });

    const getCalificacionColor = (calificacion, maxPuntos) => {
        if (!maxPuntos) return 'bajo';
        const porcentaje = (calificacion / maxPuntos) * 100;
        if (porcentaje >= 90) return 'excelente';
        if (porcentaje >= 80) return 'bueno';
        if (porcentaje >= 70) return 'regular';
        return 'bajo';
    };

    const getPromedio = () => {
        if (datosTabla.length === 0) return 0;
        const suma = datosTabla.reduce((acc, cal) => acc + (cal.calificacion / cal.maxPuntos) * 100, 0);
        return (suma / datosTabla.length).toFixed(1);
    };

    // ==========================================
    // MANEJO DE EDICIÓN (CALIFICAR)
    // ==========================================
    const openEdit = (cal) => { setEditing({ ...cal }); setEditModalOpen(true); };
    const closeEdit = () => { setEditing(null); setEditModalOpen(false); };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editing) return;

        try {
            // Llamada al Backend para guardar la nota
            await calificarEntrega(editing.id, {
                calificacion: Number(editing.calificacion),
                comentariosDocente: editing.comentario
            });

            // Actualizar estado local
            setDatosTabla(datosTabla.map(c => c.id === editing.id ? editing : c));
            alert("Calificación guardada exitosamente");
            closeEdit();
        } catch (error) {
            console.error("Error al calificar:", error);
            alert("Error al guardar la calificación");
        }
    };

   // ==========================================
    // GENERADOR DE PDF (ACTUALIZADO CON MATERIA)
    // ==========================================
    const generarPDF = () => {
        const doc = new jsPDF();

        // 1. Título Principal
        doc.setFontSize(18);
        doc.setTextColor(40); // Gris oscuro
        doc.text("Reporte de Calificaciones", 14, 22);
        
        // 2. Subtítulo con la MATERIA (Lo que pediste)
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204); // Azul para resaltar
        const materiaTexto = groupFilter ? `Materia: ${groupFilter}` : "Materia: Reporte General (Todas)";
        doc.text(materiaTexto, 14, 32);

        // 3. Datos del Docente y Fecha
        doc.setFontSize(10);
        doc.setTextColor(100); // Gris claro
        const fecha = new Date().toLocaleDateString();
        doc.text(`Docente: ${user.nombre}`, 14, 42);
        doc.text(`Generado el: ${fecha}`, 14, 48);

        // 4. Definir las columnas
        const columnas = ["Estudiante", "Correo", "Tarea", "Grupo", "Calif.", "Máx", "Estado"];

        // 5. Preparar las filas
        const filas = filteredCalificaciones.map(item => [
            item.estudiante,
            item.email || '-',
            item.tarea,
            item.grupo,
            item.calificacion,
            item.maxPuntos,
            item.estado
        ]);

        // 6. Generar la tabla
        autoTable(doc, {
            startY: 55, // Bajamos un poco la tabla para que quepa el encabezado nuevo
            head: [columnas],
            body: filas,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            // Colorear filas según estado (opcional, detalle visual extra)
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 6) {
                    if (data.cell.raw === 'Pendiente') data.cell.styles.textColor = [200, 100, 0]; // Naranja
                    if (data.cell.raw === 'Calificado') data.cell.styles.textColor = [0, 128, 0]; // Verde
                }
            }
        });

        // 7. Descargar
        const nombreArchivo = groupFilter ? `Reporte_${groupFilter.replace(/\s/g, '_')}.pdf` : `Reporte_General.pdf`;
        doc.save(nombreArchivo);
    };
    // ==========================================
    // VISTA DOCENTE
    // ==========================================
    if (isDocente) {
        return (
            <div className="calificaciones-page">
                <div className="calificaciones-header">
                    <div>
                        <h1 className="calificaciones-title">📊 Gestión de Calificaciones</h1>
                        <p className="calificaciones-subtitle">Administra y revisa las calificaciones de tus estudiantes</p>
                    </div>
                    <button className="btn btn-create" onClick={generarPDF}>
                        📄 Imprimir Reporte
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="calificaciones-stats">
                    <div className="calificaciones-stat-card">
                        <div className="calificaciones-stat-icon">📝</div>
                        <div className="calificaciones-stat-info">
                            <div className="calificaciones-stat-value">{datosTabla.length}</div>
                            <div className="calificaciones-stat-label">Entregas Recibidas</div>
                        </div>
                    </div>
                    <div className="calificaciones-stat-card">
                        <div className="calificaciones-stat-icon">📚</div>
                        <div className="calificaciones-stat-info">
                            <div className="calificaciones-stat-value">{listaGrupos.length}</div>
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
                                placeholder="Buscar alumno o tarea..."
                                className="calificaciones-search-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <select className="calificaciones-filter-select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                                <option value="">Todos los grupos</option>
                                {listaGrupos.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="calificaciones-table-wrapper">
                        {loading ? <p style={{padding: 20}}>Cargando calificaciones...</p> : (
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
                                    {filteredCalificaciones.length > 0 ? (
                                        filteredCalificaciones.map(cal => {
                                            const colorClass = getCalificacionColor(cal.calificacion, cal.maxPuntos);
                                            return (
                                                <tr key={cal.id}>
                                                    <td>
                                                        <div className="calificaciones-student-info">
                                                            <div className="calificaciones-student-avatar">
                                                                {cal.estudiante.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                                <span className="calificaciones-student-name">{cal.estudiante}</span>
                                                                <span style={{fontSize:'0.75rem', color:'#666'}}>{cal.email}</span>
                                                            </div>
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
                                                            <button className="calificaciones-action-btn" title="Calificar / Editar" onClick={() => openEdit(cal)}>
                                                                ✏️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="6" style={{textAlign:'center', padding:20}}>No se encontraron entregas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Modal editar calificación */}
                {editModalOpen && editing && (
                    <div className="modal-overlay" onClick={closeEdit}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Calificar Actividad</h3>
                                <button className="modal-close" onClick={closeEdit}>✖</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSaveEdit}>
                                    <div style={{display: 'grid', gap: 12}}>
                                        <div><label className="label-global">Estudiante</label><input className="input-global" value={editing.estudiante} readOnly disabled style={{background:'#f0f0f0'}} /></div>
                                        <div><label className="label-global">Tarea</label><input className="input-global" value={editing.tarea} readOnly disabled style={{background:'#f0f0f0'}} /></div>
                                        
                                        <div style={{display:'flex', gap:8}}>
                                            <div style={{flex:1}}>
                                                <label className="label-global">Calificación</label>
                                                <input 
                                                    type="number" 
                                                    className="input-global" 
                                                    value={editing.calificacion} 
                                                    onChange={e => setEditing({...editing, calificacion: e.target.value})} 
                                                    required 
                                                    min="0"
                                                    max={editing.maxPuntos}
                                                />
                                            </div>
                                            <div style={{width:140}}>
                                                <label className="label-global">Máx. puntos</label>
                                                <input className="input-global" value={editing.maxPuntos} readOnly disabled style={{background:'#f0f0f0'}} />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="label-global">Retroalimentación (Comentario)</label>
                                            <textarea 
                                                className="input-global" 
                                                rows={3} 
                                                value={editing.comentario || ''} 
                                                onChange={e => setEditing({...editing, comentario: e.target.value})} 
                                                placeholder="Escribe un comentario para el estudiante..."
                                            />
                                        </div>
                                        
                                        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop: 10}}>
                                            <button type="button" className="btn btn-cancel" onClick={closeEdit}>Cancelar</button>
                                            <button type="submit" className="btn btn-create">💾 Guardar Calificación</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // VISTA ESTUDIANTE
    // ==========================================
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
                        <div className="calificaciones-stat-value">{datosTabla.length}</div>
                        <div className="calificaciones-stat-label">Tareas Entregadas</div>
                    </div>
                </div>
            </div>

            <div className="calificaciones-table-container">
                <h2 className="calificaciones-table-title">Historial de Calificaciones</h2>

                <div className="calificaciones-table-wrapper">
                    {loading ? <p style={{padding:20}}>Cargando tus notas...</p> : (
                        <table className="calificaciones-table">
                            <thead>
                                <tr>
                                    <th>Tarea</th>
                                    <th>Grupo</th>
                                    <th>Calificación</th>
                                    <th>Fecha</th>
                                    <th>Comentario Docente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosTabla.length > 0 ? (
                                    datosTabla.map(cal => {
                                        const colorClass = getCalificacionColor(cal.calificacion, cal.maxPuntos);
                                        return (
                                            <tr key={cal.id}>
                                                <td className="calificaciones-tarea">{cal.tarea}</td>
                                                <td>
                                                    <span className="calificaciones-group-badge">{cal.grupo}</span>
                                                </td>
                                                <td>
                                                    {cal.estado === 'Calificado' ? (
                                                        <div className={`calificaciones-grade ${colorClass}`}>
                                                            <span className="calificaciones-grade-value">{cal.calificacion}</span>
                                                            <span className="calificaciones-grade-max">/ {cal.maxPuntos}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="badge-pill warning">Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="calificaciones-date">{cal.fecha}</td>
                                                <td className="calificaciones-comment">{cal.comentario || '-'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding:20}}>Aún no tienes entregas registradas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calificaciones;