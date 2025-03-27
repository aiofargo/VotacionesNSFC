const express = require('express');
const router = express.Router();
const votacionController = require('../controllers/votacion.controller');

// Middleware para verificar si hay votación activa
const verificarVotacionActiva = (req, res, next) => {
    // Aquí puedes agregar la lógica para verificar si hay una votación activa
    // Por ahora, simplemente pasamos al siguiente middleware
    next();
};

// Rutas para el proceso de votación
router.get('/', verificarVotacionActiva, votacionController.mostrarValidacion);
router.post('/validar', verificarVotacionActiva, votacionController.validarVotante);
router.get('/tarjetones', verificarVotacionActiva, votacionController.mostrarTarjetones);
router.post('/procesar', verificarVotacionActiva, votacionController.procesarVoto);

module.exports = router; 