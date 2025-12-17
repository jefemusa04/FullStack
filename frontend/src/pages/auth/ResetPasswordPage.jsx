import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/auth.css"; 
import axios from "axios";

export default function ResetPasswordPage() {
  // Tus compañeros usaron query params (?token=xyz)
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  // ... (mantén las funciones de validación MIN_LENGTH, etc.)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Falta el token de seguridad.");
    if (!validate()) return;
    
    try {
      // CONEXIÓN REAL: Enviamos la nueva password al backend
      await axios.put(`http://aaisforgg.jcarlos19.com:5000/api/auth/reset-password/${token}`, { 
        password: form.password 
      });

      toast.success("¡Contraseña actualizada! Inicia sesión.");
      navigate("/login"); 
    } catch (error) {
      toast.error(error.response?.data?.message || "El enlace ha caducado o es inválido.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-global">
        <div className="auth-icon">🔐</div>
        
        <h2 className="auth-title">Nueva Contraseña</h2>
        <p className="auth-subtitle">Crea una contraseña segura para proteger tu cuenta.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            className="auth-input"
            placeholder="Nueva Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Confirmar Nueva Contraseña"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button type="submit" className="btn-auth">Guardar Nueva Contraseña</button>
        </form>
        
        <div className="auth-footer">
            <p>¿No necesitas cambiarla?</p>
            <Link to="/login" className="auth-link">Volver al Login</Link>
        </div>
      </div>
    </div>
  );
}