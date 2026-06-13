require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const path = require('path');
const teamRoutes = require('./routes/teamRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS desde la carpeta public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API
app.use('/api', teamRoutes);

// Ruta raíz — sirve el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;