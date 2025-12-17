const asyncHandler = require('express-async-handler');
const Mensaje = require('../models/Mensajes');
const Usuario = require('../models/Usuario'); 
const Grupo = require('../models/Grupo');

// @desc    Obtener todos los mensajes entre el usuario logueado y otro usuario (historial de conversación)
// @route   GET /api/mensajes/:destinatarioId
// @access  Private
const obtenerMensajes = asyncHandler(async (req, res) => {
    const usuarioLogueadoId = req.usuario.id;
    const { destinatarioId } = req.params;

    // 1. Buscar mensajes en ambas direcciones
    const mensajes = await Mensaje.find({
        $or: [
            // Mensajes enviados por mí al destinatario
            { remitente: usuarioLogueadoId, destinatario: destinatarioId },
            // Mensajes enviados por el destinatario a mí
            { remitente: destinatarioId, destinatario: usuarioLogueadoId },
        ],
    })
    .sort({ createdAt: 1 }) // Ordenar cronológicamente
    .populate('remitente', 'nombre rol') // Mostrar quién envió
    .populate('destinatario', 'nombre rol'); // Mostrar quién recibió

    // 2. Marcar como leídos los mensajes que me enviaron
    await Mensaje.updateMany(
        { remitente: destinatarioId, destinatario: usuarioLogueadoId, leido: false },
        { $set: { leido: true } }
    );

    res.status(200).json(mensajes);
});

// @desc    Enviar un nuevo mensaje
// @route   POST /api/mensajes
// @access  Private
const enviarMensaje = asyncHandler(async (req, res) => {
    const { destinatario, contenido } = req.body;
    const remitente = req.usuario.id;

    // 1. Validar campos
    if (!destinatario || !contenido) {
        res.status(400);
        throw new Error('El destinatario y el contenido del mensaje son obligatorios.');
    }

    // 2. Verificar que el destinatario exista
    const destinatarioExiste = await Usuario.findById(destinatario);
    if (!destinatarioExiste) {
        res.status(404);
        throw new Error('El destinatario no existe.');
    }

    // 3. Crear el mensaje
    const mensaje = await Mensaje.create({
        remitente,
        destinatario,
        contenido,
    });

    // 4. Devolver el mensaje creado
    res.status(201).json(mensaje);
});

// @desc    Obtener lista de contactos disponibles (Compañeros de clase / Profesores)
// @route   GET /api/mensajes/contactos
// @access  Private
const obtenerContactos = asyncHandler(async (req, res) => {
    const userId = req.usuario.id;
    let contactos = [];

    if (req.usuario.rol === 'docente') {
        // SI SOY DOCENTE: Busco a mis alumnos de todos mis grupos
        const grupos = await Grupo.find({ docente: userId })
            .populate('estudiantes', 'nombre email rol');
        
        // Extraemos todos los estudiantes y eliminamos duplicados
        const estudiantesMap = new Map();
        grupos.forEach(grupo => {
            grupo.estudiantes.forEach(est => {
                if (est) estudiantesMap.set(est._id.toString(), est);
            });
        });
        contactos = Array.from(estudiantesMap.values());

    } else if (req.usuario.rol === 'estudiante') {
        // SI SOY ESTUDIANTE: Busco a mis profesores (dueños de mis grupos)
        // Primero buscamos al usuario para ver sus grupos
        const usuario = await Usuario.findById(userId);
        
        // Buscamos los grupos donde está inscrito y populamos el docente
        const grupos = await Grupo.find({ _id: { $in: usuario.grupos } })
            .populate('docente', 'nombre email rol');

        const docentesMap = new Map();
        grupos.forEach(grupo => {
            if (grupo.docente) {
                docentesMap.set(grupo.docente._id.toString(), grupo.docente);
            }
        });
        contactos = Array.from(docentesMap.values());
    }

    res.status(200).json(contactos);
});

module.exports = {
    obtenerMensajes,
    enviarMensaje,
    obtenerContactos,
};