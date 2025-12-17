const express = require('express');
const router = express.Router();
const { crearEntrega, obtenerEntregasPorTarea, calificarEntrega, obtenerMisEntregas } = require('../controllers/controladorEntregas');
const { proteger } = require('../middlewares/authMiddleware');

// 1. IMPORTAR LIBRERÍAS DE ARCHIVOS (Faltaba esto)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 2. CONFIGURAR ALMACENAMIENTO (Igual que en Tareas)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 3. RUTAS
// POST /api/entregas -> Estudiante sube tarea
router.post('/', proteger, upload.single('archivo'), crearEntrega);

// GET /api/entregas/tarea/:tareaId -> Docente ve entregas
router.get('/tarea/:tareaId', proteger, obtenerEntregasPorTarea);

// GET /api/entregas/mis-entregas -> Estudiante ve sus entregas
router.get('/mis-entregas', proteger, obtenerMisEntregas);

// PUT /api/entregas/:entregaId/calificar -> Docente califica
router.put('/:entregaId/calificar', proteger, calificarEntrega);

module.exports = router;