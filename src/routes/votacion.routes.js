const express = require('express');
const router = express.Router();
const votacionController = require('../controllers/votacion.controller');

// Middleware para verificar si el usuario está autenticado
const estaAutenticado = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rutas de votaciones (todas protegidas)
router.get('/crear', estaAutenticado, votacionController.mostrarCrearVotacion);
router.post('/crear', estaAutenticado, votacionController.crearVotacion);
router.get('/', estaAutenticado, votacionController.listarVotaciones);
router.get('/editar/:id', estaAutenticado, votacionController.mostrarEditarVotacion);
router.post('/editar/:id', estaAutenticado, votacionController.editarVotacion);
router.get('/eliminar/:id', estaAutenticado, votacionController.eliminarVotacion);

// Rutas para el proceso de votación
router.get('/', votacionController.mostrarValidacion);
router.post('/validar', votacionController.validarVotante);
router.get('/tarjetones', votacionController.mostrarTarjetones);

module.exports = router; 