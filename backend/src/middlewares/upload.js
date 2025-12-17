const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // IMPORTANTE: Esta ruta debe coincidir con la carpeta que creaste en FASE 1
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Generamos un nombre único: fecha-nombreOriginal
        // Ejemplo: 173441230-tarea-juan.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuración final con límites
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 } // Límite de 10 MB por archivo (puedes cambiarlo)
});

module.exports = upload;