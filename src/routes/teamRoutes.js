const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const teamController = require('../controllers/teamControllers'); // Importamos el nuevo controlador

// Ruta existente de predicciones
router.get('/predictions/upcoming', predictionController.getFuturePredictions);

// Nueva ruta para resolver las preguntas estadísticas
router.get('/stats', teamController.getStats);

module.exports = router;