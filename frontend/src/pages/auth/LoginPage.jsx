import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { useAuth } from "../../hooks/userAuth"; 
import { toast } from "react-toastify";
import '../../styles/auth.css'; 

const REMEMBER_EMAIL_KEY = 'rememberedEmail';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false); 

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (rememberedEmail) {
      setForm((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Completa todos los campos");
    
    if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, form.email);
    else localStorage.removeItem(REMEMBER_EMAIL_KEY);
    
    const res = await login(form.email, form.password); 

    if (res.ok) {
        if (res.requiresPasswordChange) { 
            navigate("/cambiar-password", { replace: true, state: { userId: res.data.user.id } }); 
            toast.warn("Por seguridad, actualiza tu contraseña.");
        } else {
            toast.success(`Bienvenido de nuevo, ${res.data.user.nombre || 'Docente'}`);
            navigate("/dashboard", { replace: true });
        }
    } else {
        toast.error(res.message || "Credenciales incorrectas");
    }
  };

  // Si ya hay un usuario en el contexto, redirigir automáticamente al dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card-global">
        {/* Icono de Marca */}
        <div className="auth-icon">🎓</div>
        
        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">Accede a tu panel académico y gestiona tus actividades.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <input
              type="email"
              className="auth-input"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <input
              type="password"
              className="auth-input"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          
          <div className="auth-options">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ marginRight: '8px', width: '16px', height: '16px' }}
            />
            <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>Recordar mi correo</label>
          </div>
          
          <button type="submit" className="btn-auth">Ingresar al Sistema</button>
        </form>

        <div className="auth-footer">
          <p className="mb-2">
            <Link to="/forgot-password" className="auth-link text-sm text-gray-500 hover:text-blue-600">
                ¿Olvidaste tu contraseña?
            </Link> 
          </p> 
          <p>
            ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate como Docente</Link>
          </p>
        </div>
      </div>
    </div>
  );
}