const express = require('express');
const router = express.Router();
const multer = require('multer');
const candidatoController = require('../controllers/candidato.controller');

// Configuración de multer para manejar la subida de archivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Validar tipo de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen'));
        }
    }
});

// Middleware para verificar si el usuario está autenticado
const estaAutenticado = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware para validar el tipo de candidato
const validarTipo = (req, res, next) => {
    const tipo = req.params.tipo;
    if (tipo === 'personero' || tipo === 'contralor') {
        next();
    } else {
        res.status(404).render('error', {
            mensaje: 'Tipo de candidato no válido',
            admin: {
                email: req.session.adminEmail
            }
        });
    }
};

// Rutas para candidatos (todas protegidas)
router.get('/:tipo', [estaAutenticado, validarTipo], candidatoController.listar);
router.get('/:tipo/crear', [estaAutenticado, validarTipo], candidatoController.mostrarCrear);
router.post('/:tipo/crear', [estaAutenticado, validarTipo, upload.single('foto')], candidatoController.crear);
router.get('/:tipo/editar/:id', [estaAutenticado, validarTipo], candidatoController.mostrarEditar);
router.post('/:tipo/editar/:id', [estaAutenticado, validarTipo, upload.single('foto')], candidatoController.editar);
router.get('/:tipo/eliminar/:id', [estaAutenticado, validarTipo], candidatoController.eliminar);

module.exports = router; 