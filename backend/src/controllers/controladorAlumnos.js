const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
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


// @desc    Registrar un nuevo alumno (Usuario) y matricularlo automáticamente en un grupo
// @route   POST /api/alumnos/registrar/:grupoId
// @access  Private (Docente)
const registrarAlumnoEnGrupo = asyncHandler(async (req, res) => {
    // Verificar rol de docente
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Solo docentes pueden registrar alumnos.');
    }

    const { grupoId } = req.params;
    const { nombre, email, password } = req.body; 

    // Valida que se envíen todos los campos requeridos
    if (!nombre || !email || !password) {
        res.status(400);
        throw new Error('Nombre, email y contraseña son obligatorios.');
    }

    // Verifica si el usuario YA existe en el sistema (por email)
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
        res.status(400);
        throw new Error('Ese correo ya está registrado. Usa la opción de "Matricular existente".');
    }

    // Hashea (encriptar) la contraseña por seguridad
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crea el Usuario (Alumno) en la base de datos
    const nuevoAlumno = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        rol: 'estudiante',
        grupos: [grupoId] // Vinculamos el grupo al alumno inmediatamente
    });

    // Actualiza el Grupo: Agregar el ID del nuevo alumno a su lista
    const grupo = await Grupo.findById(grupoId);
    
    if (!grupo) { 
        // Rollback: Si el grupo falla, borramos al usuario para evitar datos huérfanos
        await Usuario.findByIdAndDelete(nuevoAlumno._id);
        res.status(404); 
        throw new Error('Grupo no encontrado.');
    }
    
    grupo.estudiantes.push(nuevoAlumno._id);
    await grupo.save();

    res.status(201).json(nuevoAlumno);
});

// @desc    Agregar un estudiante existente por email
// @route   PUT /api/alumnos/matricular/:grupoId
const agregarAlumnoAGrupo = asyncHandler(async (req, res) => {
    // 1. Validar Docente
    if (req.usuario.rol !== 'docente') {
        res.status(403); throw new Error('Acceso denegado.');
    }
    const { grupoId } = req.params;
    const { email } = req.body;

    if (!email) {
        res.status(400); throw new Error('El email es obligatorio.');
    }

    // 2. Buscar Grupo
    const grupo = await Grupo.findOne({ _id: grupoId, docente: req.usuario.id });
    if (!grupo) { res.status(404); throw new Error('Grupo no encontrado.'); }

    // 3. Buscar Alumno
    const estudiante = await Usuario.findOne({ email });
    if (!estudiante) { res.status(404); throw new Error('No existe usuario con ese email.'); }

    // 4. VALIDACIÓN SEGURA DE IDs (Usamos .toString() para evitar errores)
    const yaEstaEnGrupo = grupo.estudiantes.some(
        (id) => id.toString() === estudiante._id.toString()
    );

    if (yaEstaEnGrupo) {
        res.status(400); throw new Error('El estudiante ya está en este grupo.');
    }

    // 5. Guardar Relación
    grupo.estudiantes.push(estudiante._id);
    await grupo.save();
    
    // Validar si el alumno ya tiene el grupo antes de agregarlo
    const yaTieneGrupo = estudiante.grupos.some(
        (id) => id.toString() === grupo._id.toString()
    );

    if (!yaTieneGrupo) {
        estudiante.grupos.push(grupo._id);
        await estudiante.save();
    }

    res.status(200).json(estudiante);
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

    // Verificar que el grupo pertenezca al docente
    const grupo = await Grupo.findOne({ _id: grupoId, docente: req.usuario.id });
    if (!grupo) {
        res.status(404);
        throw new Error('Grupo no encontrado o no pertenece al docente.');
    }
    
    // Lógica de desmatriculación
    await Grupo.updateOne({ _id: grupoId }, { $pull: { estudiantes: estudianteId } });
    await Usuario.updateOne({ _id: estudianteId }, { $pull: { grupos: grupoId } });

    res.status(200).json({ mensaje: 'Estudiante desmatriculado con éxito.' });
});


module.exports = {
    obtenerAlumnosPorGrupo,
    registrarAlumnoEnGrupo,
    agregarAlumnoAGrupo,
    eliminarAlumnoDeGrupo,
};