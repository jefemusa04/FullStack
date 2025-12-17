const express = require('express');
const cors = require('cors'); // Lo mantenemos por si acaso, pero usaremos el manual primero
const dotenv = require('dotenv').config(); 
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const connectDB = require('./src/config/dbConexion'); 

// Importar librerías de seguridad
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const port = process.env.PORT || 5000; 

// Conectar a la Base de Datos
connectDB(); 

const app = express();

// CONFIGURACIÓN DE SEGURIDAD, CORS Y PRIVATE NETWORK

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

    // Verificar si el origen está permitido
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Cabeceras necesarias para CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // FIX CRÍTICO: Permitir acceso a red local (loopback) desde sitio externo
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // Responder inmediatamente a las peticiones de pre-vuelo (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// MIDDLEWARES DE LECTURA Y SANITIZACIÓN DE DATOS

app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

// Sanitización de Datos 
app.use(mongoSanitize());

// Rate Limiting para prevenir abuso
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Demasiadas peticiones desde esta IP. Intente de nuevo en 15 minutos.',
});
 app.use(limiter); 


// RUTAS DE LA API

app.use('/api/usuarios', require('./src/routes/rutasUsuarios')); 
app.use('/api/grupos', require('./src/routes/rutasGrupos'));
app.use('/api/tareas', require('./src/routes/rutasTareas'));
app.use('/api/entregas', require('./src/routes/rutasEntregas'));
app.use('/api/alumnos', require('./src/routes/rutasAlumnos')); 
app.use('/api/mensajes', require('./src/routes/rutasMensajes'));

// Middleware de Errores (Al final)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`---`);
    console.log(`🚀 Servidor de Gestión Escolar ejecutándose`);
    console.log(`📍 Puerto: ${port}`);
    console.log(`🌐 Dominios permitidos: http://aaisforgg.jcarlos19.com, localhost`);
    console.log(`---`);
});
