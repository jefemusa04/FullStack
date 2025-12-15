const express = require('express');
const router = express.Router();
const { obtenerAlumnosPorGrupo, agregarAlumnoAGrupo, eliminarAlumnoDeGrupo } = require('../controladores/controladorAlumnos');
const { proteger } = require('../middleware/authMiddleware');

// RUTAS DE GESTIÓN DE MATRÍCULA (DOCENTE)
// GET /api/alumnos/grupo/:grupoId -> Obtener todos los alumnos de un grupo
router.get('/grupo/:grupoId', proteger, obtenerAlumnosPorGrupo);

// PUT /api/alumnos/matricular/:grupoId -> Agregar alumno a un grupo (usa el email en el body)
router.put('/matricular/:grupoId', proteger, agregarAlumnoAGrupo);

// PUT /api/alumnos/desmatricular/:grupoId/:estudianteId -> Remover alumno de un grupo
router.put('/desmatricular/:grupoId/:estudianteId', proteger, eliminarAlumnoDeGrupo);


module.exports = router;