const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv').config(); 
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const connectDB = require('./src/config/dbConexion'); 
const authRoutes = require('./src/routes/authRoutes.js');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const port = process.env.PORT || 5000; 

// 1. Conectar a la Base de Datos
connectDB(); 

// 2. INICIALIZAR APP (Crítico: Debe ir antes de cualquier app.use)
const app = express();

// 3. CONFIGURACIÓN DE SEGURIDAD Y CORS
app.set('trust proxy', 1); 

// Middleware Manual para CORS y Private Network Access (PNA)
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'http://aaisforgg.jcarlos19.com',
        'http://159.54.150.99'
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// 4. MIDDLEWARES DE LECTURA Y SANITIZACIÓN
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Demasiadas peticiones desde esta IP. Intente de nuevo en 15 minutos.',
});
app.use(limiter); 

// 5. VINCULAR RUTAS DE LA API
app.use('/api/auth', authRoutes); // Ruta para OCI (forgot-password)
app.use('/api/usuarios', require('./src/routes/rutasUsuarios')); 
app.use('/api/grupos', require('./src/routes/rutasGrupos'));
app.use('/api/tareas', require('./src/routes/rutasTareas'));
app.use('/api/entregas', require('./src/routes/rutasEntregas'));
app.use('/api/alumnos', require('./src/routes/rutasAlumnos')); 
app.use('/api/mensajes', require('./src/routes/rutasMensajes'));

// 6. Middleware de Errores (Siempre al final)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`---`);
    console.log(`🚀 Servidor de Gestión Escolar ejecutándose`);
    console.log(`📍 Puerto: ${port}`);
    console.log(`🌐 Dominios permitidos configurados`);
    console.log(`---`);
});