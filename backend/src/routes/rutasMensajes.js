const express = require('express');
const router = express.Router();
const { obtenerMensajes, enviarMensaje } = require('../controllers/controladorMensajes');
const { proteger } = require('../middlewares/authMiddleware');

// POST /api/mensajes -> Enviar un nuevo mensaje
router.post('/', proteger, enviarMensaje);

// GET /api/mensajes/:destinatarioId -> Obtener el historial de la conversación
router.get('/:destinatarioId', proteger, obtenerMensajes);


module.exports = router;