const asyncHandler = require('express-async-handler');
const Entrega = require('../modelos/Entrega');
const Tarea = require('../modelos/Tareas'); // Usamos 'Tarea' singular (asumiendo que se corrigió el modelo)
const Usuario = require('../modelos/Usuario');

// =======================================================
// LÓGICA DEL ESTUDIANTE (Crear Entrega)
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

    const { tareaId, archivoUrl, comentariosEstudiante } = req.body;
    const estudianteId = req.usuario.id;

    // 2. Validar campos obligatorios
    if (!tareaId || !archivoUrl) {
        res.status(400);
        throw new Error('Faltan campos obligatorios: ID de la tarea y URL del archivo.');
    }

    // 3. Verificar que la tarea exista
    const tarea = await Tarea.findById(tareaId);
    if (!tarea) {
        res.status(404);
        throw new Error('La tarea especificada no existe.');
    }

    // 4. Verificar si ya existe una entrega para esta tarea por parte de este estudiante (Unicidad)
    let entrega = await Entrega.findOne({ tarea: tareaId, estudiante: estudianteId });

    if (entrega) {
        // Si ya existe, se actualiza 
        entrega.archivoUrl = archivoUrl;
        entrega.comentariosEstudiante = comentariosEstudiante;
        entrega.fechaEntrega = Date.now();
        entrega.estado = (entrega.fechaEntrega > tarea.fechaEntrega) ? 'Tarde' : 'Entregado';
        
        await entrega.save();
        res.status(200).json(entrega);
    } else {
        // Si no existe, se crea la nueva entrega
        const estadoEntrega = (Date.now() > tarea.fechaEntrega) ? 'Tarde' : 'Entregado';

        entrega = await Entrega.create({
            tarea: tareaId,
            estudiante: estudianteId,
            archivoUrl,
            comentariosEstudiante,
            estado: estadoEntrega,
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

    // 1. Verificar que la tarea exista y pertenezca a este docente
    const tarea = await Tarea.findOne({ _id: tareaId, creador: req.usuario.id });
    if (!tarea) {
        res.status(404);
        throw new Error('Tarea no encontrada o no pertenece a este docente.');
    }

    // 2. Obtener todas las entregas para esa tarea, poblando los datos del estudiante
    const entregas = await Entrega.find({ tarea: tareaId })
        .populate('estudiante', 'nombre matricula email'); // Mostrar solo campos relevantes del estudiante

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

    // 1. Validar calificación
    if (calificacion === undefined || calificacion === null) {
        res.status(400);
        throw new Error('La calificación es obligatoria.');
    }

    // 2. Buscar la entrega
    const entrega = await Entrega.findById(req.params.entregaId);
    if (!entrega) {
        res.status(404);
        throw new Error('Entrega no encontrada.');
    }

    // 3. Verificar que la tarea asociada pertenezca al docente (Seguridad)
    const tarea = await Tarea.findById(entrega.tarea);
    if (!tarea || tarea.creador.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('No está autorizado para calificar esta entrega (la tarea no es suya).');
    }

    // 4. Actualizar la calificación y el estado
    entrega.calificacion = calificacion;
    entrega.comentariosDocente = comentariosDocente;
    entrega.estado = 'Calificado'; // Cambia el estado
    await entrega.save();

    res.status(200).json(entrega);
});


module.exports = {
    crearEntrega,
    obtenerEntregasPorTarea,
    calificarEntrega,
};