const express = require('express');
const router = express.Router();
// Renombramos las funciones importadas para que coincidan con la exportación del controlador
const { registro, login, obtenerUsuarioActual } = require('../controladores/controladorUsuarios');
const { proteger } = require('../middleware/authMiddleware');

// La ruta raíz '/' en este archivo se traduce a /api/usuarios
// 1. REGISTRO (POST /api/usuarios)
router.post('/', registro); // Usar 'registro'

// 2. LOGIN (POST /api/usuarios/login)
router.post('/login', login); // Usar 'login'

// 3. OBTENER DATOS DEL USUARIO (GET /api/usuarios/me)
// Usar 'obtenerUsuarioActual' y cambiar la ruta a '/actual' o '/me'
router.get('/me', proteger, obtenerUsuarioActual); // Usar 'obtenerUsuarioActual'

module.exports = router;