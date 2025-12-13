// src/components/StudentCreationForm.jsx
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
        // Validación aquí (simple para el ejemplo)
        if (!form.nombre || !form.email || !form.passwordGenerica) {
            return toast.error("Complete todos los campos.");
        }

        try {
            // ⬅️ Usa tu instancia de Axios para la llamada al BACKEND
            const res = await axios.post('/api/usuarios/estudiante', form); 
            
            toast.success(res.data.message);
            setForm({ nombre: '', email: '', passwordGenerica: '' }); // Limpiar formulario
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al crear estudiante.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Añadir Nuevo Estudiante</h3>
            <input
                type="text"
                placeholder="Nombre del Estudiante"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
                type="email"
                placeholder="Correo del Estudiante"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
                type="text"
                placeholder="Clave Genérica Inicial (mín. 6)"
                value={form.passwordGenerica}
                onChange={(e) => setForm({ ...form, passwordGenerica: e.target.value })}
            />
            <button type="submit">Crear Cuenta</button>
        </form>
    );
}