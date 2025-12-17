const express = require('express');
const router = express.Router();
const { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea } = require('../controllers/controladorTareas');
const { proteger } = require('../middlewares/authMiddleware');

// Rutas base: GET (obtener todas) y POST (crear nueva)
router.route('/')
    .get(proteger, obtenerTareas) // GET /api/tareas
    .post(proteger, crearTarea); // POST /api/tareas

// Rutas por ID: PUT (actualizar) y DELETE (eliminar)
router.route('/:id')
    .put(proteger, actualizarTarea) // PUT /api/tareas/:id
    .delete(proteger, eliminarTarea); // DELETE /api/tareas/:id


module.exports = router;