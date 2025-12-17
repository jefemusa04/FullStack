const express = require('express');
const router = express.Router();
const { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea } = require('../controllers/controladorTareas');
const { proteger } = require('../middlewares/authMiddleware');

// MULTER Y PATH
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CONFIGURAR DÓNDE SE GUARDAN LOS ARCHIVOS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nombre único: fecha-nombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rutas base: GET (obtener todas) y POST (crear nueva)
router.route('/')
    .get(proteger, obtenerTareas) // GET /api/tareas

    .post(proteger, upload.single('archivo'), crearTarea); // POST /api/tareas

// Rutas por ID: PUT (actualizar) y DELETE (eliminar)
router.route('/:id')
    .put(proteger, upload.single('archivo'), actualizarTarea) // PUT /api/tareas/:id
    .delete(proteger, eliminarTarea); // DELETE /api/tareas/:id

module.exports = router;