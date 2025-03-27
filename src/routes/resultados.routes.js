const express = require('express');
const router = express.Router();
const resultadosController = require('../controllers/resultados.controller');

// Middleware para verificar si el usuario está autenticado
const estaAutenticado = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Aplicar middleware de autenticación a todas las rutas
router.use(estaAutenticado);

// Ruta para ver estadísticas de participación
router.get('/estadisticas', resultadosController.mostrarEstadisticas);

// Ruta para ver resultados de la votación
router.get('/ver', resultadosController.mostrarResultados);

module.exports = router; 