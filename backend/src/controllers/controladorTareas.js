const asyncHandler = require('express-async-handler');
const Tarea = require('../models/Tareas');
const Grupo = require('../models/Grupo');
const fs = require('fs');
const path = require('path');

// @desc    Obtener todas las tareas relevantes para el usuario
// @route   GET /api/tareas
// @access  Private 
const obtenerTareas = asyncHandler(async (req, res) => {
    let tareas;

    // --- LOG DE DEBUGGING ---
    console.log(`[DEBUG] Solicitud de Tareas. Rol: ${req.usuario.rol}, ID: ${req.usuario.id}`);
    
    if (req.usuario.rol === 'docente') {
        // DOCENTE: Ver las tareas que creó
        console.log(`[DEBUG] 1. Docente: Iniciando búsqueda de tareas creadas.`);
        tareas = await Tarea.find({ creador: req.usuario.id }).populate('grupo', 'nombre');
        console.log(`[DEBUG] 2. Docente: Tareas encontradas: ${tareas.length}. Finalizando consulta.`);
        
    } else if (req.usuario.rol === 'estudiante') {
        // ESTUDIANTE: Ver las tareas de los grupos a los que pertenece
        console.log(`[DEBUG] 1. Estudiante: Buscando grupos matriculados.`);
        // Nota: req.usuario.grupos viene del modelo de Usuario
        const gruposIds = req.usuario.grupos; 
        
        if (gruposIds.length === 0) {
            console.log('[DEBUG] 2. Estudiante: No está en grupos. Devolviendo lista vacía.');
            return res.status(200).json([]);
        }
        
        // Buscar todas las tareas que pertenezcan a esos grupos
        console.log(`[DEBUG] 2. Estudiante: Buscando tareas en ${gruposIds.length} grupos.`);
        tareas = await Tarea.find({
            grupo: { $in: gruposIds }
        })
        .populate('grupo', 'nombre clave'); 
        console.log(`[DEBUG] 3. Estudiante: Tareas encontradas: ${tareas.length}. Finalizando consulta.`);

    } else {
        res.status(403);
        throw new Error('Rol no reconocido.');
    }

    // Doble verificación para asegurar que se retorna lo correcto
    // (Esta línea podría ser redundante con el if/else de arriba, pero asegura el filtrado final)
    tareas = await Tarea.find(req.usuario.rol === 'docente' ? { creador: req.usuario.id } : { grupo: { $in: req.usuario.grupos } })
        .populate('grupo', 'nombre');

    res.status(200).json(tareas);
});

// @desc    Crear una nueva tarea con Archivo
// @route   POST /api/tareas
// @access  Private (Docente)
const crearTarea = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado.');
    }

    // Cuando usas FormData, los campos de texto también vienen en req.body
    const { titulo, grupo, puntuacionMaxima, fechaEntrega, descripcion } = req.body;

    if (!titulo || !grupo || !puntuacionMaxima || !fechaEntrega) {
        res.status(400);
        throw new Error('Faltan campos obligatorios.');
    }

    const grupoExiste = await Grupo.findOne({ _id: grupo, docente: req.usuario.id });
    if (!grupoExiste) {
        res.status(404);
        throw new Error('El grupo no existe o no es suyo.');
    }

    // --- PROCESAR ARCHIVO ---
    let archivoUrl = null;
    if (req.file) {
        // Construimos la URL completa: http://dominio.com/uploads/nombre.pdf
        const nombreArchivo = req.file.filename;
        archivoUrl = `${req.protocol}://${req.get('host')}/uploads/${nombreArchivo}`;
    }

    const tarea = await Tarea.create({
        titulo,
        descripcion,
        grupo, 
        creador: req.usuario.id, 
        puntuacionMaxima,
        fechaEntrega: new Date(fechaEntrega),
        archivoUrl // Guardamos la URL
    });
    
    // Actualizamos el grupo para incluir la nueva tarea
    grupoExiste.tareas.push(tarea._id);
    await grupoExiste.save();

    res.status(201).json(tarea);
});

// @desc    Actualizar una tarea (CRUD - Update) con gestión de archivos
// @route   PUT /api/tareas/:id
// @access  Private (Docente)
const actualizarTarea = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden actualizar tareas.');
    }
    
    const tarea = await Tarea.findById(req.params.id);

    if (!tarea) {
        res.status(404);
        throw new Error('Tarea no encontrada.');
    }

    // 1. Verificar la propiedad (Seguridad)
    if (tarea.creador.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado. Esta tarea no fue creada por usted.');
    }
    
    // 2. Preparar datos para actualizar
    // Copiamos el body para modificarlo si es necesario
    const datosActualizar = { ...req.body };

    // --- LÓGICA DE ARCHIVOS EN ACTUALIZACIÓN ---
    
    // CASO A: El usuario subió un archivo nuevo para reemplazar el anterior
    if (req.file) {
        const nombreArchivo = req.file.filename;
        datosActualizar.archivoUrl = `${req.protocol}://${req.get('host')}/uploads/${nombreArchivo}`;
        
        // (Opcional) Aquí se podría agregar código para borrar el archivo físico antiguo usando fs.unlink
    } 
    // CASO B: El usuario NO subió archivo, pero marcó la casilla "eliminarArchivo"
    else if (req.body.eliminarArchivo === 'true') {
        datosActualizar.archivoUrl = null; // Borramos la referencia en la BD
    }

    const tareaActualizada = await Tarea.findByIdAndUpdate(
        req.params.id,
        datosActualizar,
        { new: true, runValidators: true } 
    );

    res.status(200).json(tareaActualizada);
});

// @desc    Eliminar una tarea (CRUD - Delete)
// @route   DELETE /api/tareas/:id
// @access  Private (Docente)
const eliminarTarea = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden eliminar tareas.');
    }
    
    const tarea = await Tarea.findById(req.params.id);

    if (!tarea) {
        res.status(404);
        throw new Error('Tarea no encontrada.');
    }

    // 1. Verificar la propiedad (Seguridad)
    if (tarea.creador.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado. Esta tarea no fue creada por usted.');
    }

    // 2. Antes de eliminar, eliminar también las referencias en el grupo
    await Grupo.updateOne(
        { _id: tarea.grupo },
        { $pull: { tareas: tarea._id } } 
    );
    
    // Eliminar el documento de la tarea
    await Tarea.deleteOne({ _id: req.params.id }); 

    res.status(200).json({ id: req.params.id, mensaje: 'Tarea eliminada con éxito.' });
});

module.exports = {
    obtenerTareas,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
};