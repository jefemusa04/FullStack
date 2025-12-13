import React, { useState } from 'react';

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

    const handleSaveStudent = (e) => {
        e.preventDefault();
        const id = alumnos.length + 1;
        setAlumnos([...alumnos, { ...newStudent, id, estado: 'Activo' }]);
        setNewStudent({ nombre: '', email: '', grupo: '' });
        setShowForm(false);
    };

    return (
        <div className="page-container">
            {/* 1. HEADER (Igual a Calificaciones) */}
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

            {/* 2. FORMULARIO DE CREACIÓN (Integrado visualmente) */}
            {showForm && (
                <div className="form-container-global">
                    <div className="form-header-global">
                        <h2 className="form-title-global">Nuevo Estudiante</h2>
                        <p className="form-subtitle-global">Ingresa los datos para matricular a un alumno.</p>
                    </div>
                    <form onSubmit={handleSaveStudent}>
                        <div className="form-grid-global">
                            <div>
                                <label className="label-global">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    className="input-global" 
                                    placeholder="Ej: Ana Torres"
                                    value={newStudent.nombre}
                                    onChange={e => setNewStudent({...newStudent, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-global">Correo Institucional</label>
                                <input 
                                    type="email" 
                                    className="input-global" 
                                    placeholder="ana@escuela.edu"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label-global">Asignar Grupo</label>
                            <select 
                                className="input-global"
                                value={newStudent.grupo}
                                onChange={e => setNewStudent({...newStudent, grupo: e.target.value})}
                                required
                            >
                                <option value="">Selecciona un grupo...</option>
                                <option value="Matemáticas I">Matemáticas I</option>
                                <option value="Historia Universal">Historia Universal</option>
                                <option value="Programación Web">Programación Web</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-cancel">Cancelar</button>
                            <button type="submit" className="btn btn-create">💾 Guardar Alumno</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 3. STATS (Igual a Calificaciones) */}
            <div className="stats-row">
                <div className="stat-card-global">
                    <div className="stat-icon-global">👥</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{alumnos.length}</div>
                        <div className="stat-label-global">Total Matriculados</div>
                    </div>
                </div>
                <div className="stat-card-global highlight">
                    <div className="stat-icon-global">✅</div>
                    <div className="stat-info-global">
                        <div className="stat-value-global">{alumnos.filter(a => a.estado === 'Activo').length}</div>
                        <div className="stat-label-global">Usuarios Activos</div>
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

            {/* 4. TABLA (Igual a Calificaciones) */}
            <div className="data-container-global">
                <div className="data-header-global">
                    <h2 className="data-title-global">Directorio de Alumnos</h2>
                    <div className="data-controls-global">
                        <input type="text" placeholder="🔍 Buscar estudiante..." className="global-search-input" />
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
                            {alumnos.map((alumno) => (
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
                                            <button className="action-btn-global" title="Editar">✏️</button>
                                            <button className="action-btn-global delete" title="Eliminar">🗑️</button>
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