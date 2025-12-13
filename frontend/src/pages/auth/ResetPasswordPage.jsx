import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/auth.css"; 

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  // Reglas de validación
  const MIN_LENGTH = 8;
  const HAS_UPPERCASE = /[A-Z]/;
  const HAS_NUMBER = /[0-9]/;
  const HAS_SPECIAL_CHAR = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  const validate = () => {
    if (form.password !== form.confirmPassword) {
        toast.error("Las contraseñas no coinciden."); return false;
    }
    if (form.password.length < MIN_LENGTH || !HAS_UPPERCASE.test(form.password) || !HAS_NUMBER.test(form.password) || !HAS_SPECIAL_CHAR.test(form.password)) {
      toast.error("La contraseña debe ser segura (Mín 8, Mayús, Núm, Símbolo).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Token inválido o expirado.");
    if (!validate()) return;
    
    try {
      // await resetPassword(token, form.password); 
      toast.success("¡Contraseña actualizada! Inicia sesión.");
      navigate("/login"); 
    } catch (error) {
      toast.error("El enlace ha caducado.");
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