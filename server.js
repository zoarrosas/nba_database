require('dotenv').config(); // Asegura la carga de variables de entorno si usas .env
const app = require('./src/app');

// Inicializa la conexión a la base de datos
require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Enciende el servidor de manera limpia
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🏀 Servidor NBA activo en: http://localhost:${PORT}`);
    console.log(`=============================================`);
});

