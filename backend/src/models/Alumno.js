const mongoose = require('mongoose');

const esquemaAlumno = mongoose.Schema(
    {
        // Referencia al usuario (Profesor/Admin) que administra los datos del alumno
        usuario: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario', 
        },
        nombreCompleto: {
            type: String,
            required: [true, 'El nombre completo del alumno es obligatorio'],
            trim: true,
        },
        matricula: {
            type: String,
            unique: true, // La matrícula debe ser única en el sistema
            required: [true, 'La matrícula es obligatoria'],
            trim: true,
        },
        emailContacto: {
            type: String,
            required: false,
        },
        // Relación N a N: Un alumno puede pertenecer a varios grupos
        grupos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grupo',
        }]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Alumno', esquemaAlumno);