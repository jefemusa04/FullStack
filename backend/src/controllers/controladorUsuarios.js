const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario'); // <--- CORREGIDO: De ModeloUsuario a Usuario

// Función auxiliar para generar el JWT (JSON Web Token)
const generarTokenJWT = (id) => {
    // Genera el token con el ID del usuario, la clave secreta y la expiración
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION, // Usar la variable del .env (ej: '30d')
    });
};

// @desc    Registrar un nuevo usuario (Docente o Estudiante)
// @route   POST /api/usuarios
// @access  Public
const registro = asyncHandler(async (req, res) => {
    // 1. Obtener datos y validar
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
        res.status(400);
        throw new Error('Por favor, ingresa todos los campos requeridos');
    }

    // 2. Verificar si el usuario ya existe (por email)
    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
        res.status(400);
        throw new Error('El usuario ya existe en el sistema');
    }

    // 3. Hashear la contraseña (Seguridad)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Crear el usuario en la base de datos
    const usuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        // Usar el rol si se especifica, si no, el default ('estudiante')
        rol: rol || 'estudiante' 
    });

    // 5. Responder con el usuario creado y el Token (si se creó con éxito)
    if (usuario) {
        res.status(201).json({
            _id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            // Generar el token para la sesión
            token: generarTokenJWT(usuario.id), 
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario inválidos');
    }
});

// @desc    Autenticar un usuario (Login)
// @route   POST /api/usuarios/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Buscar el usuario por email
    const usuario = await Usuario.findOne({ email });

    // 2. Verificar usuario y comparar contraseña hasheada
    if (usuario && (await bcrypt.compare(password, usuario.password))) {
        // Éxito: Devolver datos y Token
        res.json({
            _id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: generarTokenJWT(usuario.id),
        });
    } else {
        // Fallo: Datos inválidos
        res.status(400);
        throw new Error('Credenciales inválidas (email o contraseña incorrectos)');
    }
});

// @desc    Obtener datos del usuario actual (protegida)
// @route   GET /api/usuarios/actual
// @access  Private
const obtenerUsuarioActual = asyncHandler(async (req, res) => {
    // req.usuario es adjuntado por el middleware 'proteger'
    // Como ya pasamos por el middleware, sabemos que el usuario existe
    res.status(200).json(req.usuario); 
});


module.exports = {
    registro,
    login,
    obtenerUsuarioActual,
};