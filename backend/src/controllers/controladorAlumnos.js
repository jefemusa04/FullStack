const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');
const Grupo = require('../models/Grupo');

// @desc    Obtener la lista de estudiantes matriculados en un grupo específico
// @route   GET /api/alumnos/grupo/:grupoId
// @access  Private (Docente)
const obtenerAlumnosPorGrupo = asyncHandler(async (req, res) => {
    // Si esta función estuviera completa:
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes.');
    }

    const { grupoId } = req.params;
    const grupo = await Grupo.findOne({ _id: grupoId, docente: req.usuario.id })
        .populate('estudiantes', 'nombre email rol'); 

    if (!grupo) {
        res.status(404);
        throw new Error('Grupo no encontrado o no pertenece al docente.');
    }
    res.status(200).json(grupo.estudiantes);
});


// @desc    Agregar un estudiante (por email) a un grupo (Matriculación)
// @route   PUT /api/alumnos/matricular/:grupoId
// @access  Private (Docente)
const agregarAlumnoAGrupo = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden matricular alumnos.');
    }

    const { grupoId } = req.params;
    // CRÍTICO: El Frontend envía el campo como emailEstudiante
    const { emailEstudiante } = req.body; 

    // 1. Verificar que el grupo exista y pertenezca al docente
    const grupo = await Grupo.findOne({ _id: grupoId, docente: req.usuario.id });
    if (!grupo) {
        res.status(404);
        throw new Error('Grupo no encontrado o no pertenece al docente.');
    }

    // 2. Buscar al estudiante por email
    const estudiante = await Usuario.findOne({ email: emailEstudiante, rol: 'estudiante' });
    if (!estudiante) {
        res.status(404);
        throw new Error('No se encontró un estudiante con ese email.');
    }

    // 3. Verificar si el estudiante ya está matriculado en este grupo
    const estudianteIdString = estudiante._id.toString();
    const yaMatriculado = grupo.estudiantes.some(id => id.toString() === estudianteIdString);

    if (yaMatriculado) {
        res.status(400);
        throw new Error('El estudiante ya está matriculado en este grupo.');
    }

    // 4. Matricular al estudiante en el grupo (actualizar Grupo y Usuario)
    // A) Añadir el estudiante al array de 'estudiantes' del Grupo
    grupo.estudiantes.push(estudiante._id);
    await grupo.save();

    // B) Añadir el grupo al array de 'grupos' del Usuario/Estudiante
    estudiante.grupos.push(grupo._id);
    await estudiante.save();
    
    res.status(200).json({ mensaje: `Estudiante ${estudiante.nombre} matriculado con éxito.`, estudianteId: estudiante._id });
});


// @desc    Desmatricular un alumno de un grupo
// @route   PUT /api/alumnos/desmatricular/:grupoId/:estudianteId
// @access  Private (Docente)
const eliminarAlumnoDeGrupo = asyncHandler(async (req, res) => {
    // Si esta función estuviera completa:
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden desmatricular alumnos.');
    }
    
    const { grupoId, estudianteId } = req.params;

    // 1. Verificar que el grupo pertenezca al docente
    const grupo = await Grupo.findOne({ _id: grupoId, docente: req.usuario.id });
    if (!grupo) {
        res.status(404);
        throw new Error('Grupo no encontrado o no pertenece al docente.');
    }
    
    // 2. Lógica de desmatriculación
    await Grupo.updateOne({ _id: grupoId }, { $pull: { estudiantes: estudianteId } });
    await Usuario.updateOne({ _id: estudianteId }, { $pull: { grupos: grupoId } });

    res.status(200).json({ mensaje: 'Estudiante desmatriculado con éxito.' });
});


module.exports = {
    obtenerAlumnosPorGrupo,
    agregarAlumnoAGrupo,
    eliminarAlumnoDeGrupo,
};