import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import StudentCreationForm from '../../components/docente/StudentCreationForm';
import { getAlumnosPorGrupo, registrarNuevoAlumno, desmatricularAlumno } from '../../services/alumnosService';
import { getGrupos, agregarAlumnoExistente } from '../../services/gruposService';

export default function AlumnosPage() {
    // --- ESTADOS DE UI ---
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- ESTADOS DE DATOS (BACKEND) ---
    const [grupos, setGrupos] = useState([]);           
    const [selectedGroupId, setSelectedGroupId] = useState(''); 
    const [alumnos, setAlumnos] = useState([]);         
    const [searchTerm, setSearchTerm] = useState('');

    // CARGAR GRUPOS AL INICIAR
    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const misGrupos = await getGrupos();
                setGrupos(misGrupos);
                // Seleccionar el primero por defecto
                if (misGrupos.length > 0) setSelectedGroupId(misGrupos[0]._id);
            } catch (error) {
                toast.error("Error cargando grupos");
            }
        };
        cargarGrupos();
    }, []);

    // CARGAR ALUMNOS CUANDO CAMBIA EL GRUPO
    const cargarAlumnosDelGrupo = async () => {
        if (!selectedGroupId) return;
        setLoading(true);
        try {
            const lista = await getAlumnosPorGrupo(selectedGroupId);
            setAlumnos(lista);
        } catch (error) {
            setAlumnos([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAlumnosDelGrupo();
    }, [selectedGroupId]);

    // --- MANEJADORES ---

    const handleSaveStudent = async (data) => {
        // data trae { nombre, email, password, modo }
        try {
            if (data.modo === 'nuevo') {
                // CREAR (El que ya tenías)
                await registrarNuevoAlumno(selectedGroupId, data);
                toast.success(`Cuenta creada para ${data.nombre}`);
            } else {
                // AGREGAR EXISTENTE (El nuevo)
                await agregarAlumnoExistente(data.email, data.grupoId);
                toast.success(`Alumno agregado al grupo correctamente`);
            }

            await cargarAlumnosDelGrupo();
            setShowForm(false);
        } catch (error) {
            const msg = error.response?.data?.message || "Error en la operación";
            toast.error(msg);
        }
    };

    const handleDelete = async (alumnoId, nombre) => {
        if (!window.confirm(`¿Eliminar a ${nombre} de este grupo?`)) return;
        try {
            await desmatricularAlumno(selectedGroupId, alumnoId);
            toast.info("Alumno eliminado");
            setAlumnos(alumnos.filter(a => a._id !== alumnoId));
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Filtro de búsqueda local
    const filtered = alumnos.filter(a => 
        a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log("GRUPOS CARGADOS:", grupos);

    return (
        <div className="page-container">
            {/* HEADER (Igual a tu diseño original) */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 Gestión de Estudiantes</h1>
                    <p className="page-subtitle">Administra el acceso y los grupos de tus alumnos</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    disabled={!selectedGroupId}
                    className={`btn ${showForm ? "btn-cancel" : "btn-create"} ${!selectedGroupId && "opacity-50 cursor-not-allowed"}`}
                >
                    {showForm ? '✖ Cancelar' : '➕ Registrar Alumno'}
                </button>
            </div>

            {/* FORMULARIO DE CREACIÓN (Dentro de su contenedor global) */}
            {showForm && (
                <div className="form-container-global mb-6 animate-fade-in-down">
                    <StudentCreationForm 
                        onSubmit={handleSaveStudent} 
                        onCancel={() => setShowForm(false)} 
                        grupos={grupos} 
                        grupoPreseleccionado={selectedGroupId}
                    />
                </div>
            )}

            {/* STATS (Con datos reales) */}
            <div className="stats-row">
                <div className="stat-card-global">
                    <div className="stat-icon-global">👥</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{alumnos.length}</div>
                        <div className="stat-label-global">Alumnos en este Grupo</div>
                    </div>
                </div>
                <div className="stat-card-global">
                    <div className="stat-icon-global">🎓</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{grupos.length}</div>
                        <div className="stat-label-global">Grupos Totales</div>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="data-container-global">
                <div className="data-header-global flex-col md:flex-row gap-4 items-start md:items-center">
                    <h2 className="data-title-global">Directorio de Alumnos</h2>
                    
                    {/* CONTROLES: Filtro y Buscador juntos */}
                    <div className="data-controls-global flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        
                        {/* SELECTOR DE GRUPO */}
                        <select 
                            className="input-global py-2 pl-3 pr-8 cursor-pointer min-w-[200px]"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                        >
                            {grupos.length === 0 && <option value="">Sin grupos</option>}
                            {grupos.map(g => (
                                <option key={g._id} value={g._id}>
                                    📂 {g.nombre} ({g.clave})
                                </option>
                            ))}
                        </select>

                        {/* BUSCADOR */}
                        <input 
                            type="text" 
                            placeholder="🔍 Buscar estudiante..." 
                            className="global-search-input" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table-global">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* ESTADO DE CARGA */}
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-500">
                                        Cargando datos...
                                    </td>
                                </tr>
                            )}

                            {/* FILAS DE ALUMNOS */}
                            {!loading && filtered.map((alumno) => (
                                <tr key={alumno._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {alumno.nombre?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="font-semibold text-gray-800">{alumno.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-600">{alumno.email}</td>
                                    <td>
                                        <span className="badge-pill blue">Estudiante</span>
                                    </td>
                                    <td>
                                        <span className="badge-pill success">Activo</span>
                                    </td>
                                    <td>
                                        <div className="actions-row-global">
                                            <button 
                                                className="action-btn-global delete" 
                                                title="Eliminar" 
                                                onClick={() => handleDelete(alumno._id, alumno.nombre)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* ESTADO VACÍO (DENTRO DE LA TABLA) */}
                            {!loading && alumnos.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-12 bg-gray-50">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="text-4xl mb-2 opacity-60">🎓</div>
                                            <h3 className="text-lg font-bold text-gray-700">Grupo vacío</h3>
                                            <p className="text-sm">No hay estudiantes matriculados en esta materia.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}