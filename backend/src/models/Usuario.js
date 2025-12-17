const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    },

    resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { 
    timestamps: true 
}); 

UsuarioSchema.pre('save', async function(next) {
    // Solo encriptar si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// CORRECCIÓN CRÍTICA: Uso de mongoose.models para evitar el error OverwriteModelError
module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);