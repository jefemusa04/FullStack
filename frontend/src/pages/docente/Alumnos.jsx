import React, { useState } from 'react';
import { toast } from 'react-toastify';
import StudentCreationForm from '../../components/docente/StudentCreationForm';

export default function AlumnosPage() {
    const [showForm, setShowForm] = useState(false);
    
    // Estado para el formulario de nuevo alumno
    const [newStudent, setNewStudent] = useState({ nombre: '', email: '', grupo: '' });

    // Datos simulados
    const [alumnos, setAlumnos] = useState([
        { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', grupo: 'Matemáticas I', estado: 'Activo' },
        { id: 2, nombre: 'María Gómez', email: 'maria@example.com', grupo: 'Historia Universal', estado: 'Activo' },
        { id: 3, nombre: 'Pedro López', email: 'pedro@example.com', grupo: 'Programación Web', estado: 'Inactivo' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSaveStudent = (e) => {
        e.preventDefault();
        
        // Simulación de guardado
        const id = alumnos.length + 1;
        setAlumnos([...alumnos, { ...newStudent, id, estado: 'Activo' }]);

        // --- MENSAJE BONITO (TOAST) ---
        toast.success(
            <div>
                <strong>¡Alumno Registrado!</strong>
                <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
                    El estudiante <b>{newStudent.nombre}</b> ha sido matriculado correctamente en <b>{newStudent.grupo}</b>.
                </div>
            </div>,
            {
                icon: "👤" // Icono de usuario para diferenciar
            }
        );

        // Limpiar y cerrar
        setNewStudent({ nombre: '', email: '', grupo: '' });
        setShowForm(false);
    };

    const filtered = alumnos.filter(a => {
        const t = searchTerm.trim().toLowerCase();
        if (!t) return true;
        return `${a.nombre} ${a.email} ${a.grupo}`.toLowerCase().includes(t);
    });

    const handleDelete = (id) => {
        if (!window.confirm('¿Eliminar este alumno?')) return;
        setAlumnos(alumnos.filter(a => a.id !== id));
    };

    const handleEdit = (al) => {
        const nuevoNombre = window.prompt('Nuevo nombre', al.nombre);
        if (!nuevoNombre) return;
        setAlumnos(alumnos.map(a => a.id === al.id ? { ...a, nombre: nuevoNombre } : a));
    };

    return (
        <div className="page-container">
            {/*HEADER */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 Gestión de Estudiantes</h1>
                    <p className="page-subtitle">Administra el acceso y los grupos de tus alumnos</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={showForm ? "btn btn-cancel" : "btn btn-create"}
                >
                    {showForm ? '✖ Cancelar' : '➕ Registrar Alumno'}
                </button>
            </div>

            {/*FORMULARIO DE CREACIÓN */}
            {showForm && (
                <div className="form-container-global">
                    <StudentCreationForm />
                </div>
            )}

            {/*STATS */}
            <div className="stats-row">
                <div className="stat-card-global">
                    <div className="stat-icon-global">👥</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{alumnos.length}</div>
                        <div className="stat-label-global">Total Matriculados</div>
                    </div>
                </div>
                <div className="stat-card-global">
                    <div className="stat-icon-global">🎓</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">3</div>
                        <div className="stat-label-global">Grupos Totales</div>
                    </div>
                </div>
            </div>

            {/* 4. TABLA */}
            <div className="data-container-global">
                <div className="data-header-global">
                    <h2 className="data-title-global">Directorio de Alumnos</h2>
                    <div className="data-controls-global">
                        <input type="text" placeholder="🔍 Buscar estudiante..." className="global-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table-global">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Correo</th>
                                <th>Grupo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((alumno) => (
                                <tr key={alumno.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {alumno.nombre.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-gray-800">{alumno.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-600">{alumno.email}</td>
                                    <td>
                                        <span className="badge-pill blue">{alumno.grupo}</span>
                                    </td>
                                    <td>
                                        <span className={`badge-pill ${alumno.estado === 'Activo' ? 'success' : 'warning'}`}>
                                            {alumno.estado}
                                        </span>
                                    </td>
                                        <td>
                                        <div className="actions-row-global">
                                            <button className="action-btn-global delete" title="Eliminar" onClick={() => handleDelete(alumno.id)}>🗑️</button>
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