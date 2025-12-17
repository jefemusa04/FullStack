const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título de la tarea es obligatorio.']
    },
    descripcion: {
        type: String
    },
    grupo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grupo', 
        required: [true, 'La tarea debe estar asignada a un grupo.']
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: [true, 'El creador de la tarea es obligatorio.']
    },
    puntuacionMaxima: {
        type: Number,
        required: [true, 'La puntuación máxima es obligatoria.'],
        min: 1
    },
    fechaEntrega: {
        type: Date,
        required: [true, 'La fecha de entrega es obligatoria.']
    },
    archivoUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// CORRECCIÓN CRÍTICA
module.exports = mongoose.models.Tarea || mongoose.model('Tarea', TareaSchema);