const mongoose = require('mongoose');

const EntregaSchema = new mongoose.Schema({
 
    tarea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
        required: true
    },
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    archivoUrl: {
        type: String,
        default: null 
    },
    comentariosEstudiante: {
        type: String
    },
    fechaEntrega: {
        type: Date,
        default: Date.now
    },
    calificacion: {
        type: Number,
        min: 0,
        default: null 
    },
    comentariosDocente: {
        type: String
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Entregado', 'Calificado', 'Tarde'],
        default: 'Entregado'
    }
});

EntregaSchema.index({ tarea: 1, estudiante: 1 }, { unique: true });

// CORRECCIÓN CRÍTICA
module.exports = mongoose.models.Entrega || mongoose.model('Entrega', EntregaSchema);