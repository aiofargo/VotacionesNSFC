const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Middleware para verificar si el usuario está autenticado
const estaAutenticado = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rutas públicas de autenticación
router.get('/login', authController.mostrarLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/registro', authController.mostrarRegistro);
router.post('/registro', authController.registrarAdmin);

// Rutas protegidas de administración
router.get('/createAdmin', estaAutenticado, authController.mostrarCrearAdmin);
router.post('/createAdmin', estaAutenticado, authController.crearAdmin);

// Ruta del dashboard (protegida)
router.get('/dashboard', estaAutenticado, authController.dashboard);

module.exports = router; 