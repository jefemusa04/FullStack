import React, { useState } from 'react';
import axios from 'axios'; // Usar tu instancia de axios configurada
import { toast } from 'react-toastify';

// Simulación de tu instancia de axios (debes importarla realmente)
// import api from '../../api'; 

export default function StudentCreationForm() {
    const [form, setForm] = useState({ 
        nombre: '', 
        email: '', 
        passwordGenerica: '' 
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre || !form.email || !form.passwordGenerica) {
            return toast.error("Complete todos los campos.");
        }
        if (form.passwordGenerica.length < 6) return toast.error('La clave debe tener al menos 6 caracteres.');

        try {
            const res = await axios.post('/api/usuarios/estudiante', form);
            toast.success(res.data?.message || 'Estudiante creado');
            setForm({ nombre: '', email: '', passwordGenerica: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al crear estudiante.");
        }
    };

    return (
        <div>
            <div className="form-header-global">
                <h2 className="form-title-global">Nuevo Estudiante</h2>
                <p className="form-subtitle-global">Ingresa los datos para matricular a un alumno.</p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid-global" style={{ gap: 12 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                    <label className="label-global">Nombre Completo</label>
                    <input
                        className="input-global"
                        type="text"
                        placeholder="Ej: Ana Torres"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                    <label className="label-global">Correo Institucional</label>
                    <input
                        className="input-global"
                        type="email"
                        placeholder="ana@escuela.edu"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                    <label className="label-global">Clave Genérica Inicial</label>
                    <input
                        className="input-global"
                        type="password"
                        placeholder="mín. 6 caracteres"
                        value={form.passwordGenerica}
                        onChange={(e) => setForm({ ...form, passwordGenerica: e.target.value })}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-create">Crear Cuenta</button>
                </div>
            </form>
        </div>
    );
}