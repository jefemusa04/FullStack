const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config(); 
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const connectDB = require('./src/config/dbConexion'); 
// Importar librerías de seguridad (mantener importaciones, solo comentar el uso)
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const port = process.env.PORT || 5000; 

// Conectar a la Base de Datos
connectDB(); 
const app = express();

// CONFIGURACIÓN CRÍTICA DEL PROXY Y CORS
// FIX CRÍTICO: Indica a Express que confíe en el proxy de desarrollo de React.
app.set('trust proxy', 1); 

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MIDDLEWARES DE LECTURA Y SANITIZACIÓN (DEBEN IR PRIMERO)

// Permite a Express leer JSON y URL-encoded data.
app.use(express.json()); 
app.use(express.urlencoded({extended: false})); 

// Sanitización de Datos: Limpia datos antes de que lleguen a las rutas.
// app.use(mongoSanitize()); // TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTO

// Rate Limiting: Limita 100 peticiones por IP en 15 minutos.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limitar cada IP a 100 peticiones por ventana
    message: 'Demasiadas peticiones desde esta IP. Intente de nuevo en 15 minutos.',
});
// app.use(limiter); // TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTO

//RUTAS DE LA API 

// Rutas de Usuarios/Autenticación
app.use('/api/usuarios', require('./src/routes/rutasUsuarios')); 
// Rutas de Gestión Escolar (Grupos/Cursos)
app.use('/api/grupos', require('./src/routes/rutasGrupos'));
// Rutas de Gestión Escolar (TAREAS) 
app.use('/api/tareas', require('./src/routes/rutasTareas'));
// Rutas de Gestión Escolar (ENTREGAS) 
app.use('/api/entregas', require('./src/routes/rutasEntregas'));
// Rutas de Gestión Escolar (Alumnos - se usará para gestionar matrículas)
app.use('/api/alumnos', require('./src/routes/rutasAlumnos')); 
// Rutas de Gestión Escolar (MENSAJES) 
app.use('/api/mensajes', require('./src/routes/rutasMensajes'));


// Middleware de Errores (DEBE ir al final de todas las rutas)
app.use(errorHandler);

app.listen(port, () => console.log(`Servidor de Gestión Escolar escuchando en el puerto ${port}`));