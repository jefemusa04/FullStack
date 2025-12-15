const express = require('express');
const dotenv = require('dotenv').config(); 
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/dbConexion'); 
// Importar librerías de seguridad (mantener importaciones, solo comentar el uso)
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const puerto = process.env.PUERTO || 5000; 

// Conectar a la Base de Datos (Mantener comentado si no está activa)
connectDB(); 
const app = express();

// =======================================================
// 1. CONFIGURACIÓN CRÍTICA DEL PROXY
// =======================================================
// [A] FIX CRÍTICO: Indica a Express que confíe en el proxy de desarrollo de React.
app.set('trust proxy', 1); 

// =======================================================
// 2. MIDDLEWARES DE LECTURA Y SANITIZACIÓN (DEBEN IR PRIMERO)
// =======================================================

// [B] Body Parser: Permite a Express leer JSON y URL-encoded data.
app.use(express.json()); 
app.use(express.urlencoded({extended: false})); 

// [C] Sanitización de Datos: Limpia datos antes de que lleguen a las rutas.
// app.use(mongoSanitize()); // TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTO

// =======================================================
// 3. MIDDLEWARE DE RATE LIMITING (APLICADO DESPUÉS DEL PARSER)
// =======================================================

// [D] Rate Limiting: Limita 100 peticiones por IP en 15 minutos.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limitar cada IP a 100 peticiones por ventana
    message: 'Demasiadas peticiones desde esta IP. Intente de nuevo en 15 minutos.',
});
// app.use(limiter); // TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTO


// =======================================================
// 4. RUTAS DE LA API 
// =======================================================

// 1. Rutas de Usuarios/Autenticación
app.use('/api/usuarios', require('./rutas/rutasUsuarios')); 
// 2. Rutas de Gestión Escolar (Grupos/Cursos)
app.use('/api/grupos', require('./rutas/rutasGrupos'));
// 3. Rutas de Gestión Escolar (TAREAS) 
app.use('/api/tareas', require('./rutas/rutasTareas'));
// 4. Rutas de Gestión Escolar (ENTREGAS) 
app.use('/api/entregas', require('./rutas/rutasEntregas'));
// 5. Rutas de Gestión Escolar (Alumnos - se usará para gestionar matrículas)
app.use('/api/alumnos', require('./rutas/rutasAlumnos')); 
// 6. Rutas de Gestión Escolar (MENSAJES) 
app.use('/api/mensajes', require('./rutas/rutasMensajes'));


// Middleware de Errores (DEBE ir al final de todas las rutas)
app.use(errorHandler);

app.listen(puerto, () => console.log(`Servidor de Gestión Escolar escuchando en el puerto ${puerto}`));