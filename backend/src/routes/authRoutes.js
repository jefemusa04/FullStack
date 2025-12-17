const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/authController');

// Ruta para solicitar el correo (POST http://tu-api.com/api/auth/forgot-password)
router.post('/forgot-password', forgotPassword);

// Ruta para cambiar la contraseña (PUT http://tu-api.com/api/auth/reset-password/:token)
router.put('/reset-password/:token', resetPassword);

module.exports = router;