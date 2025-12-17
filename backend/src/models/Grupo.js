const mongoose = require('mongoose');

const GrupoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del grupo es obligatorio.'],
        unique: true
    },
    clave: { // <-- CAMPO AÑADIDO
        type: String,
        required: [true, 'La clave del grupo es obligatoria.'],
        unique: true
    },
    descripcion: { // <-- CAMPO AÑADIDO
        type: String,
    },
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: [true, 'Un docente debe ser asignado al grupo.']
    },
    estudiantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    tareas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.models.Grupo || mongoose.model('Grupo', GrupoSchema);