const express = require('express');
const router = express.Router();
const { obtenerMensajes, enviarMensaje } = require('../controladores/controladorMensajes');
const { proteger } = require('../middleware/authMiddleware');

// POST /api/mensajes -> Enviar un nuevo mensaje
router.post('/', proteger, enviarMensaje);

// GET /api/mensajes/:destinatarioId -> Obtener el historial de la conversación
router.get('/:destinatarioId', proteger, obtenerMensajes);


module.exports = router;