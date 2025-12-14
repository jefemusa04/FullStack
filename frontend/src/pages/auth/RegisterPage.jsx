import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/userAuth"; 
import { toast } from "react-toastify";
import "../../styles/auth.css"; 

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    nombre: "", email: "", password: "", confirmPassword: "" 
  });

  // Validaciones (Regex)
  const MIN_LENGTH = 8;
  const HAS_UPPERCASE = /[A-Z]/;
  const HAS_NUMBER = /[0-9]/;
  const HAS_SPECIAL_CHAR = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  const validate = () => {
    if (!form.nombre || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Por favor completa todos los campos.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
        toast.error("Las contraseñas no coinciden.");
        return false;
    }
    if (form.password.length < MIN_LENGTH) {
      toast.error(`Mínimo ${MIN_LENGTH} caracteres.`); return false;
    }
    if (!HAS_UPPERCASE.test(form.password)) {
      toast.error("Falta una mayúscula."); return false;
    }
    if (!HAS_NUMBER.test(form.password)) {
      toast.error("Falta un número."); return false;
    }
    if (!HAS_SPECIAL_CHAR.test(form.password)) {
      toast.error("Falta un carácter especial."); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const payload = { ...form, rol: "docente" };
    const res = await register(payload);
    
    if (res.ok) {
      toast.success("¡Registro exitoso! Inicia sesión.");
      navigate("/login");
    } else {
      toast.error(res.message || "Error al registrar");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-global">
        <div className="auth-icon">📝</div>
        
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate como docente para gestionar grupos.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            className="auth-input"
            placeholder="Nombre Completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <input
            type="email"
            className="auth-input"
            placeholder="Correo Electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Contraseña (Min 8, Mayús, Núm, Símbolo)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Confirmar Contraseña"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          
          <button type="submit" className="btn-auth">Registrarse</button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}