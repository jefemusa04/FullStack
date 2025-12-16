const express = require('express');
const router = express.Router();

// Importa las funciones del controlador de grupos
const { obtenerGrupos, crearGrupo, actualizarGrupo, eliminarGrupo, agregarAlumnoExistente } = require('../controllers/controladorGrupos');
// Importa el middleware de protección JWT (para asegurar que la ruta es privada)
const { proteger } = require('../middlewares/authMiddleware');

// La ruta raíz (GET y POST) utiliza el mismo endpoint
router.route('/')
    .get(proteger, obtenerGrupos) // GET /api/grupos (Obtener todos los grupos del usuario)
    .post(proteger, crearGrupo); // POST /api/grupos (Crear un nuevo grupo)

router.post('/agregar-alumno', proteger, agregarAlumnoExistente);

// Rutas por ID: PUT (actualizar) y DELETE (eliminar)
router.route('/:id')
    .put(proteger, actualizarGrupo) // PUT /api/grupos/:id
    .delete(proteger, eliminarGrupo); // DELETE /api/grupos/:id

module.exports = router;