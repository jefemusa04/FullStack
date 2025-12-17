import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// RECIBIMOS 'grupos' y 'grupoPreseleccionado' COMO PROPS
export default function StudentCreationForm({ onSubmit, onCancel, grupos = [], grupoPreseleccionado = '' }) {
    const [modo, setModo] = useState('nuevo'); 

    const [form, setForm] = useState({ 
        nombre: '', 
        email: '', 
        password: '',
        grupoId: '' // Nuevo campo para el ID del grupo
    });

    // EFECTO: Cuando abre el modal, seleccionamos automáticamente el grupo actual
    useEffect(() => {
        if (grupoPreseleccionado) {
            setForm(prev => ({ ...prev, grupoId: grupoPreseleccionado }));
        } else if (grupos.length > 0) {
            // Si no hay uno preseleccionado, agarramos el primero de la lista
            setForm(prev => ({ ...prev, grupoId: grupos[0]._id }));
        }
    }, [grupoPreseleccionado, grupos]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modo === 'nuevo') {
            if (!form.nombre || !form.email || !form.password) return toast.error("Todos los campos son obligatorios.");
            if (form.password.length < 6) return toast.error('Mínimo 6 caracteres para la clave.');
        } else {
            // Validaciones modo 'Existente'
            if (!form.email) return toast.error("El email es obligatorio.");
            if (!form.grupoId) return toast.error("Debes seleccionar un grupo destino.");
        }

        // Enviamos todo el form (incluye grupoId) y el modo
        onSubmit({ ...form, modo });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            
            {/* TABS (Igual que antes) */}
            <div className="flex gap-3 mb-6">
                <button 
                    type="button"
                    className={`flex-1 transition-all duration-200 ${modo === 'nuevo' ? 'btn btn-create shadow-md' : 'btn btn-cancel opacity-60 hover:opacity-100'}`}
                    onClick={() => setModo('nuevo')}
                >
                    ✨ Registrar Nuevo
                </button>
                <button 
                    type="button"
                    className={`flex-1 transition-all duration-200 ${modo === 'existente' ? 'btn btn-create shadow-md' : 'btn btn-cancel opacity-60 hover:opacity-100'}`}
                    onClick={() => setModo('existente')}
                >
                    🔗 Agregar Existente
                </button>
            </div>

            <div className="form-header-global mb-5 text-center">
                <h2 className="form-title-global text-lg font-bold">
                    {modo === 'nuevo' ? 'Crear Cuenta Estudiante' : 'Matricular Alumno Existente'}
                </h2>
                <p className="form-subtitle-global text-sm text-gray-500 mt-1">
                    {modo === 'nuevo' 
                        ? 'Crea un usuario y contraseña para un alumno nuevo.' 
                        : 'Busca a un alumno por correo y asígnalo a un grupo.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid-global flex flex-col gap-5">
                
                {/*SELECTOR DE GRUPO (Solo en modo Existente)*/}
                {modo === 'existente' && (
                    <div className="flex flex-col gap-1 animate-fade-in-down">
                        <label className="label-global font-medium text-sm text-gray-700">Grupo Destino</label>
                        <select
                            className="input-global bg-gray-50 cursor-pointer"
                            value={form.grupoId}
                            onChange={(e) => setForm({ ...form, grupoId: e.target.value })}
                            required
                        >
                            <option value="" disabled>-- Selecciona --</option>
                            {grupos.map((grupo) => (
                                <option key={grupo._id} value={grupo._id}>
                                    📂 {grupo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* NOMBRE (Solo Nuevo) */}
                {modo === 'nuevo' && (
                    <div className="flex flex-col gap-1 animate-fade-in-down">
                        <label className="label-global font-medium text-sm text-gray-700">Nombre Completo</label>
                        <input
                            className="input-global"
                            type="text"
                            placeholder="Ej: Ana Torres"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />
                    </div>
                )}

                {/* EMAIL */}
                <div className="flex flex-col gap-1">
                    <label className="label-global font-medium text-sm text-gray-700">Correo Institucional</label>
                    <input
                        className="input-global"
                        type="email"
                        placeholder={modo === 'nuevo' ? "ana@escuela.edu" : "usuario@ejemplo.com"}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>

                {/* PASSWORD (Solo Nuevo) */}
                {modo === 'nuevo' && (
                    <div className="flex flex-col gap-1 animate-fade-in-down">
                        <label className="label-global font-medium text-sm text-gray-700">Clave Inicial</label>
                        <input
                            className="input-global"
                            type="password"
                            placeholder="mín. 6 caracteres"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                )}

                <div className="form-actions flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onCancel} className="btn btn-cancel">Cancelar</button>
                    <button type="submit" className="btn btn-create">
                        {modo === 'nuevo' ? 'Crear Cuenta' : 'Matricular'}
                    </button>
                </div>
            </form>
        </div>
    );
}