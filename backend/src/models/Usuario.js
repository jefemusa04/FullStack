const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre es obligatorio.'] 
    },
    email: { 
        type: String, 
        required: [true, 'El email es obligatorio y único.'], 
        unique: true, 
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria.']
    },
    rol: { 
        type: String, 
        required: true, 
        enum: ['docente', 'estudiante'], 
        default: 'estudiante'
    },
    grupos: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Grupo'
    }],
    activo: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
}); 

// CORRECCIÓN CRÍTICA: Uso de mongoose.models para evitar el error OverwriteModelError
module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);