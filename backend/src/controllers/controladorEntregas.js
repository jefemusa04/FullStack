const asyncHandler = require('express-async-handler');
const Entrega = require('../models/Entrega');
const Tarea = require('../models/Tareas'); 
const Usuario = require('../models/Usuario'); // (Opcional si lo usas)

// =======================================================
// LÓGICA DEL ESTUDIANTE (Crear o Editar Entrega)
// =======================================================

// @desc    Crear o actualizar la entrega de una tarea (Estudiante)
// @route   POST /api/entregas
// @access  Private (Estudiante)
const crearEntrega = asyncHandler(async (req, res) => {
    // 1. Verificar si el usuario es un estudiante
    if (req.usuario.rol !== 'estudiante') {
        res.status(403);
        throw new Error('Acceso denegado. Solo los estudiantes pueden realizar entregas.');
    }

    const { tareaId, comentariosEstudiante } = req.body;
    const estudianteId = req.usuario.id;

    // 2. VALIDACIÓN Y PROCESAMIENTO DE ARCHIVO (Obligatorio)
    let archivoUrl = null;
    
    if (req.file) {
        const nombreArchivo = req.file.filename;
        // Construye la URL pública
        archivoUrl = `${req.protocol}://${req.get('host')}/uploads/${nombreArchivo}`;
    } else {
        res.status(400);
        throw new Error('Faltan campos obligatorios: Debes subir un archivo para entregar.');
    }

    if (!tareaId) {
        res.status(400);
        throw new Error('Falta el ID de la tarea.');
    }

    // 3. Verificar que la tarea exista
    const tarea = await Tarea.findById(tareaId);
    if (!tarea) {
        res.status(404);
        throw new Error('La tarea especificada no existe.');
    }

    // 4. Buscar si ya existe una entrega previa para esta tarea
    let entrega = await Entrega.findOne({ tarea: tareaId, estudiante: estudianteId });

    // 5. Determinar si es entrega tardía comparando fechas
    const fechaActual = new Date();
    const fechaLimite = new Date(tarea.fechaEntrega);
    const esTarde = fechaActual > fechaLimite;

    if (entrega) {
        // --- MODO EDICIÓN (La entrega ya existe) ---

        // RESTRICCIÓN 1: No se puede editar si ya fue calificada
        // Verificamos si existe calificación y no es null
        if (entrega.calificacion !== null && entrega.calificacion !== undefined) {
            res.status(400);
            throw new Error('No puedes editar la entrega: Ya ha sido calificada por el docente.');
        }

        // RESTRICCIÓN 2: No se puede editar si ya pasó la fecha límite
        if (esTarde) {
            res.status(400);
            throw new Error('No puedes editar la entrega: La fecha límite ha expirado.');
        }

        // Si pasa las validaciones, actualizamos los datos
        entrega.archivoUrl = archivoUrl; // Nuevo archivo reemplaza al anterior
        entrega.comentariosEstudiante = comentariosEstudiante;
        entrega.fechaEntrega = Date.now(); // Actualizamos la fecha de entrega al momento actual
        entrega.estado = 'Entregado'; // Reiniciamos el estado por si estaba en otro
        
        await entrega.save();
        res.status(200).json(entrega);

    } else {
        // --- MODO CREACIÓN (Primera vez) ---
        
        // Si es la primera vez, permitimos entregar aunque sea tarde (marcándolo como 'Tarde')
        entrega = await Entrega.create({
            tarea: tareaId,
            estudiante: estudianteId,
            archivoUrl, // Guardamos la URL generada
            comentariosEstudiante,
            estado: esTarde ? 'Tarde' : 'Entregado', // Marcamos si llegó tarde
        });

        res.status(201).json(entrega);
    }
});


// =======================================================
// LÓGICA DEL DOCENTE (Calificar y Obtener Entregas)
// =======================================================

// @desc    Obtener todas las entregas para una tarea específica
// @route   GET /api/entregas/tarea/:tareaId
// @access  Private (Docente)
const obtenerEntregasPorTarea = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden ver las entregas.');
    }

    const { tareaId } = req.params;

    // Verificar que la tarea exista y pertenezca a este docente (Seguridad extra)
    const tarea = await Tarea.findOne({ _id: tareaId, creador: req.usuario.id });
    if (!tarea) {
        res.status(404);
        throw new Error('Tarea no encontrada o no pertenece a este docente.');
    }

    const entregas = await Entrega.find({ tarea: tareaId })
        .populate('estudiante', 'nombre matricula email');

    res.status(200).json(entregas);
});


// @desc    Calificar una entrega específica
// @route   PUT /api/entregas/:entregaId/calificar
// @access  Private (Docente)
const calificarEntrega = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden calificar.');
    }
    
    const { calificacion, comentariosDocente } = req.body;

    if (calificacion === undefined || calificacion === null) {
        res.status(400);
        throw new Error('La calificación es obligatoria.');
    }

    const entrega = await Entrega.findById(req.params.entregaId);
    if (!entrega) {
        res.status(404);
        throw new Error('Entrega no encontrada.');
    }

    // Verificar permisos sobre la tarea original
    const tarea = await Tarea.findById(entrega.tarea);
    if (!tarea || tarea.creador.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('No está autorizado para calificar esta entrega.');
    }

    entrega.calificacion = calificacion;
    entrega.comentariosDocente = comentariosDocente;
    entrega.estado = 'Calificado';
    await entrega.save();

    res.status(200).json(entrega);
});

// @desc    Obtener todas las entregas del estudiante logueado
// @route   GET /api/entregas/mis-entregas
// @access  Private (Estudiante)
const obtenerMisEntregas = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'estudiante') {
        res.status(403);
        throw new Error('Solo estudiantes pueden ver sus propias entregas.');
    }

    const entregas = await Entrega.find({ estudiante: req.usuario.id })
        .populate({
            path: 'tarea',
            select: 'titulo grupo puntuacionMaxima fechaEntrega', // Seleccionamos campos clave
            populate: { path: 'grupo', select: 'nombre' }
        });

    res.status(200).json(entregas);
});

module.exports = {
    crearEntrega,
    obtenerEntregasPorTarea,
    calificarEntrega,
    obtenerMisEntregas
};