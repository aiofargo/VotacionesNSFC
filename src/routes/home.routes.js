const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// Ruta para la página de inicio
router.get('/', homeController.mostrarInicio);

module.exports = router; 