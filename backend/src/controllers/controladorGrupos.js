const asyncHandler = require('express-async-handler');
const Grupo = require('../models/Grupo'); 
const Usuario = require('../models/Usuario'); 

// @desc    Obtener todos los grupos relevantes para el usuario autenticado
// @route   GET /api/grupos
// @access  Private
const obtenerGrupos = asyncHandler(async (req, res) => {
    let grupos;
    
    // Si es docente, ve los grupos que creó
    if (req.usuario.rol === 'docente') {
        grupos = await Grupo.find({ docente: req.usuario.id });
    } 
    // Si es estudiante, ve los grupos a los que pertenece
    else if (req.usuario.rol === 'estudiante') {
        // Obtenemos el usuario completo (que ya debería contener el array de grupos en la propiedad 'grupos')
        const estudiante = await Usuario.findById(req.usuario.id).select('grupos'); 

        if (estudiante && estudiante.grupos.length > 0) {
            // Buscar los grupos por los IDs en el array del estudiante
            grupos = await Grupo.find({ _id: { $in: estudiante.grupos } });
        } else {
            grupos = []; // Lista vacía si no está en ningún grupo
        }
    } else {
        res.status(403);
        throw new Error('Rol no reconocido.');
    }

    res.status(200).json(grupos);
});

// @desc    Crear un nuevo grupo/curso
// @route   POST /api/grupos
// @access  Private
const crearGrupo = asyncHandler(async (req, res) => {
    // 1. Verificar si es docente
    if (req.usuario.rol !== 'docente') {
        res.status(403);
        throw new Error('Acceso denegado. Solo docentes pueden crear grupos.');
    }
    
    // 1. Validar que se envíen los campos obligatorios
    const { nombre, clave, descripcion } = req.body;

    if (!nombre || !clave) {
        res.status(400);
        throw new Error('El nombre y la clave del grupo son obligatorios');
    }

    // 2. Crear el grupo, asignándolo automáticamente al usuario autenticado (ahora como 'docente')
    const grupo = await Grupo.create({
        nombre,
        clave,
        descripcion,
        docente: req.usuario.id, // Asigna el grupo al ID del docente logueado
    });

    res.status(201).json(grupo);
});

// @desc    Actualizar un grupo (CRUD - Update)
// @route   PUT /api/grupos/:id
// @access  Private
const actualizarGrupo = asyncHandler(async (req, res) => {
    // 1. Buscar el grupo por ID
    const grupo = await Grupo.findById(req.params.id);

    if (!grupo) {
        res.status(400);
        throw new Error('Grupo no encontrado');
    }

    // 2. Verificar la propiedad (CRÍTICO DE SEGURIDAD)
    // Se asegura que el grupo pertenezca al docente que está logueado
    if (grupo.docente.toString() !== req.usuario.id) { // Usamos 'docente'
        res.status(401);
        throw new Error('Usuario no autorizado para actualizar este grupo');
    }

    // 3. Actualizar el grupo
    const grupoActualizado = await Grupo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // Devuelve el documento actualizado
    );

    res.status(200).json(grupoActualizado);
});

// @desc    Eliminar un grupo (CRUD - Delete)
// @route   DELETE /api/grupos/:id
// @access  Private
const eliminarGrupo = asyncHandler(async (req, res) => {
    // 1. Buscar el grupo por ID
    const grupo = await Grupo.findById(req.params.id);

    if (!grupo) {
        res.status(400);
        throw new Error('Grupo no encontrado');
    }

    // 2. Verificar la propiedad (CRÍTICO DE SEGURIDAD)
    if (grupo.docente.toString() !== req.usuario.id) { // Usamos 'docente'
        res.status(401);
        throw new Error('Usuario no autorizado para eliminar este grupo');
    }

    await Grupo.deleteOne({ _id: req.params.id }); 
    res.status(200).json({ mensaje: `Grupo ${req.params.id} eliminado` });
});

// ... (Tus funciones anteriores: obtenerGrupos, crearGrupo, etc.)

// @desc    Agregar un alumno existente a un grupo por correo
// @route   POST /api/grupos/agregar-alumno
// @access  Private (Docente)
const agregarAlumnoExistente = asyncHandler(async (req, res) => {
    const { email, grupoId } = req.body;

    // 1. Validaciones básicas
    if (!email || !grupoId) {
        res.status(400);
        throw new Error('El email del alumno y el grupo son obligatorios.');
    }

    // 2. Buscar al Alumno y al Grupo
    const alumno = await Usuario.findOne({ email });
    if (!alumno) {
        res.status(404);
        throw new Error('No se encontró ningún usuario con ese correo.');
    }

    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
        res.status(404);
        throw new Error('Grupo no encontrado.');
    }

    // 3. Seguridad: Verificar que el docente sea el dueño del grupo
    if (grupo.docente.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('No tienes permiso para modificar este grupo.');
    }

    // 4. Evitar duplicados (Si ya está en la clase)
    if (grupo.estudiantes.includes(alumno._id)) {
        res.status(400);
        throw new Error('El alumno ya está inscrito en este grupo.');
    }

    // 5. ACTUALIZACIÓN BIDIRECCIONAL (La clave para que todo funcione)
    
    // A) Meter al alumno en el Grupo
    grupo.estudiantes.push(alumno._id);
    await grupo.save();

    // B) Meter el grupo en el Alumno (Importante para que el alumno vea la materia)
    if (!alumno.grupos.includes(grupo._id)) {
        alumno.grupos.push(grupo._id);
        await alumno.save();
    }

    res.status(200).json({ 
        mensaje: 'Alumno agregado correctamente',
        alumno: { id: alumno._id, nombre: alumno.nombre, email: alumno.email }
    });
});

module.exports = {
    obtenerGrupos,
    crearGrupo,
    actualizarGrupo,
    eliminarGrupo,
    agregarAlumnoExistente,
};