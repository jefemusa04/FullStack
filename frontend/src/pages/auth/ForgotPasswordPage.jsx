import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/auth.css"; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return toast.error("Ingresa un correo válido.");
    }

    // Simulación de API
    // await requestPasswordReset(email); 
    
    toast.info("Si el correo existe, recibirás un enlace en breve.");
    setEmail(""); 
    setTimeout(() => navigate("/login"), 4000); 
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-global">
        <div className="auth-icon">🔑</div>
        
        <h2 className="auth-title">Recuperar Acceso</h2>
        <p className="auth-subtitle">Te enviaremos un enlace seguro para restablecer tu contraseña.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="auth-input"
            placeholder="Tu correo electrónico registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-auth">Enviar Enlace</button>
        </form>
        
        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Volver a Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}