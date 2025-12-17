const express = require('express');
const router = express.Router();
const { obtenerMensajes, enviarMensaje, obtenerContactos } = require('../controllers/controladorMensajes');
const { proteger } = require('../middlewares/authMiddleware');

// POST /api/mensajes -> Enviar un nuevo mensaje
router.post('/', proteger, enviarMensaje);

// GET /api/mensajes/contactos -> Obtener lista de contactos
router.get('/contactos', proteger, obtenerContactos);

// GET /api/mensajes/:destinatarioId -> Obtener el historial de la conversación
router.get('/:destinatarioId', proteger, obtenerMensajes);

module.exports = router;