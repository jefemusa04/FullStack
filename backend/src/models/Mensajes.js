const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
    remitente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: true
    },
    destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    contenido: {
        type: String,
        required: [true, 'El mensaje no puede estar vacío.']
    },
    leido: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});

// CORRECCIÓN CRÍTICA
module.exports = mongoose.models.Mensaje || mongoose.model('Mensaje', MensajeSchema);