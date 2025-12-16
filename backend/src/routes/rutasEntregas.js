const express = require('express');
const router = express.Router();
const { crearEntrega, obtenerEntregasPorTarea, calificarEntrega } = require('../controllers/controladorEntregas');
const { proteger } = require('../middlewares/authMiddleware');

// RUTAS DEL ESTUDIANTE (Crear/Actualizar Entrega)
// POST /api/entregas
router.post('/', proteger, crearEntrega);

// RUTAS DEL DOCENTE (Revisión y Calificación)
// GET /api/entregas/tarea/:tareaId -> Obtener todas las entregas de una tarea
router.get('/tarea/:tareaId', proteger, obtenerEntregasPorTarea);

// PUT /api/entregas/:entregaId/calificar -> Calificar una entrega
router.put('/:entregaId/calificar', proteger, calificarEntrega);


module.exports = router;