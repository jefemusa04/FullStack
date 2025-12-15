const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Usuario = require('../modelos/Usuario'); // <--- CORREGIDO: De ModeloUsuario a Usuario

/**
 * Middleware para verificar la existencia y validez de un token JWT en la cabecera.
 * Si es válido, adjunta el usuario a la solicitud (req.usuario).
 */
const proteger = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Verificar la cabecera de autorización y el formato Bearer
    // La cabecera debe ser: Authorization: Bearer <TOKEN>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Obtener el token (quitar "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verificar y Decodificar el token usando la clave secreta
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Buscar el usuario por ID del token y adjuntarlo a la solicitud
            // Excluir el hash de la contraseña ('-password') por seguridad.
            req.usuario = await Usuario.findById(decodificado.id).select('-password');
            
            // 5. Continuar al siguiente middleware o controlador
            next();

        } catch (error) {
            // Error 401: No autorizado (token no válido o expirado)
            console.log(error);
            res.status(401); 
            throw new Error('No está autorizado (Token fallido)');
        }
    }

    // 6. Si no se encontró un token válido en la cabecera
    if (!token) {
        res.status(401);
        throw new Error('No está autorizado, no se proporcionó token');
    }
});

module.exports = {
    proteger,
};