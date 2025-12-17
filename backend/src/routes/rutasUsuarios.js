const express = require('express');
const router = express.Router();
// Renombramos las funciones importadas para que coincidan con la exportación del controlador
const { registro, login, obtenerUsuarioActual, actualizarPerfil } = require('../controllers/controladorUsuarios');
const { proteger } = require('../middlewares/authMiddleware');

// La ruta raíz '/' en este archivo se traduce a /api/usuarios
// REGISTRO (POST /api/usuarios)
router.post('/', registro); // Usar 'registro'

// LOGIN (POST /api/usuarios/login)
router.post('/login', login); // Usar 'login'

// OBTENER DATOS DEL USUARIO (GET /api/usuarios/me)
// Usar 'obtenerUsuarioActual' y cambiar la ruta a '/actual' o '/me'
router.get('/me', proteger, obtenerUsuarioActual); // Usar 'obtenerUsuarioActual'

// ACTUALIZAR PERFIL DEL USUARIO (PUT /api/usuarios/perfil)
router.put('/perfil', proteger, actualizarPerfil);

module.exports = router;